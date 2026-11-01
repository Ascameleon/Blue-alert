package app;

import event.ControllerChangeEvent;
import event.EventManager;
import geometry.geom2d.Point2D;
import geometry.geom3d.Point3D;
import java.util.List;
import model.CommandManager;
import model.ModelManager;
import model.battlefield.army.ArmyManager;
import model.battlefield.army.components.Unit;
import com.jme3.math.Vector3f;
import com.jme3.input.controls.ActionListener;
import com.jme3.scene.Spatial.CullHint;
import com.jme3.system.AppSettings;
import view.math.TranslateUtil;

/**
 * Separate, real-input BLUE ALERTS smoke test.
 *
 * The normal graphical smoke test remains unchanged. This harness holds every
 * unit except one red tank, then waits for xdotool to select it, issue a ground
 * move order, and right-click an enemy tank. Success requires observed model
 * state changes, not merely successful mouse injection.
 */
public class BlueAlertsInteractiveSmoke extends MainRTS {
    private Vector3f moveDestination;

    private Unit selectedUnit;
    private Unit enemyUnit;
    private Point3D moveStart;
    private float elapsed;
    private float phaseElapsed;
    private boolean ready;
    private boolean selectionVerified;
    private boolean movementVerified;
    private boolean attackVerified;
    private boolean moveClickSeen;
    private boolean moveCommandAccepted;
    private float moveClickElapsed;
    private boolean attackClickSeen;
    private boolean failed;
    private int enemyHealthAtAttack;
    private String moveActionDiagnostic = "not received";

    private final ActionListener nativeActionListener = (name, pressed, tpf) -> {
        if (pressed) {
            return;
        }
        Point2D actionCoord = fieldCtrl.spatialSelector.getCoord(rootNode);
        long entityId = fieldCtrl.spatialSelector.getEntityId();
        if (!movementVerified && !moveClickSeen) {
            moveClickSeen = true;
            moveActionDiagnostic = "coord=" + actionCoord + " entity=" + entityId;
            System.out.println("BLUE ALERTS INTERACTIVE MOVE_CLICK_RECEIVED " + moveActionDiagnostic);
        } else if (movementVerified && !attackClickSeen) {
            attackClickSeen = true;
            enemyHealthAtAttack = enemyUnit.health;
            phaseElapsed = 0f;
            System.out.println("BLUE ALERTS INTERACTIVE ATTACK_CLICK_RECEIVED entity="
                    + entityId + " coord=" + actionCoord + " enemy_health=" + enemyHealthAtAttack);
        }
    };

    // Observe native left-click delivery without querying or mutating the
    // SpatialSelector from a second listener. The engine's own selection
    // listener remains the sole owner of the selection ray.
    private final ActionListener selectDiagnosticListener = (name, pressed, tpf) -> {
        if (pressed) {
            System.out.println("BLUE ALERTS INTERACTIVE SELECT_EVENT cursor="
                    + inputManager.getCursorPosition()
                    + " selected=" + CommandManager.selection.contains(selectedUnit));
        }
    };

    @Override
    public void simpleInitApp() {
        super.simpleInitApp();
        fpsText.setCullHint(CullHint.Always);
        statsView.setCullHint(CullHint.Always);
        debugger.getNode().setCullHint(CullHint.Always);

        ModelManager.loadBattlefield("assets/maps/blue-alerts-skirmish.btf");
        var units = ArmyManager.getUnits();
        if (units.size() != 12) {
            throw new IllegalStateException("Expected 12 BLUE ALERTS units, found " + units.size());
        }

        selectedUnit = units.stream()
                .filter(unit -> "1".equals(unit.faction.getName()))
                .filter(unit -> "rollerTank".equals(unit.builderID))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Red test tank is missing"));
        enemyUnit = units.stream()
                .filter(unit -> "2".equals(unit.faction.getName()))
                .filter(unit -> "rollerTank".equals(unit.builderID))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Blue target tank is missing"));
        Vector3f initial = TranslateUtil.toVector3f(selectedUnit.pos);
        float destinationX = Math.max(6f, Math.min(74f, initial.x + (initial.x < 40f ? 7f : -7f)));
        float destinationY = Math.max(6f, Math.min(74f, initial.y + (initial.y < 40f ? 5f : -5f)));
        moveDestination = new Vector3f(destinationX, destinationY, 0f);

        // Freeze all other units so the input test measures only the selected
        // red tank's mouse-issued orders and the target's resulting damage.
        List<Unit> heldUnits = units.stream().filter(unit -> unit != selectedUnit).toList();
        CommandManager.select(heldUnits);
        CommandManager.orderHold();
        CommandManager.select(List.of());

        EventManager.post(new ControllerChangeEvent(0));
        System.out.println("BLUE ALERTS interactive scenario loaded: 12 units; 11 held; one red tank ready for native input.");
    }

    @Override
    public void simpleUpdate(float tpf) {
        super.simpleUpdate(tpf);
        if (failed || attackVerified) {
            return;
        }
        elapsed += tpf;

        if (!ready && elapsed >= 3f) {
            if (!movementVerified) setTestCamera();
            if (!inputManager.hasMapping("action") || !inputManager.hasMapping("select")) {
                fail("native Battlefield ACTION/SELECT mappings are not registered");
                return;
            }
            inputManager.addListener(nativeActionListener, "action");
            inputManager.addListener(selectDiagnosticListener, "select");
            ready = true;
            System.out.println("BLUE ALERTS INTERACTIVE READY"
                    + " target=" + projectUnit(selectedUnit)
                    + " destination=" + project(moveDestination)
                    + " viewport=" + cam.getWidth() + "x" + cam.getHeight()
                    + " cursor=" + inputManager.getCursorPosition()
                    + " pickPoint=" + unitPickPoint(selectedUnit)
                    + " camera=" + cam.getLocation()
                    + " targetWorld=" + TranslateUtil.toVector3f(selectedUnit.pos));
        }
        if (ready && !movementVerified) {
            // Follow only until the unit reaches its destination. Freeze the
            // view after movement so the enemy click ray uses a stable camera.
            setTestCamera();
        }

        if (ready && !selectionVerified) {
            if (CommandManager.selection.contains(selectedUnit)) {
                selectionVerified = true;
                moveStart = new Point3D(selectedUnit.pos);
                phaseElapsed = 0f;
                System.out.println("BLUE ALERTS INTERACTIVE SELECTED id=" + selectedUnit.builderID
                        + " selection_count=" + CommandManager.selection.size());
            } else if (elapsed > 20f) {
                fail("real left-click did not select the red test tank");
            }
        }

        if (selectionVerified && !movementVerified) {
            phaseElapsed += tpf;
            if (moveClickSeen && !moveCommandAccepted) {
                moveClickElapsed += tpf;
                if (moveClickElapsed >= 1f) {
                    moveCommandAccepted = selectedUnit.getMover().hasDestination();
                    if (moveCommandAccepted) {
                        System.out.println("BLUE ALERTS INTERACTIVE MOVE_ORDER_ACCEPTED destination="
                                + selectedUnit.getMover().getDestination()
                                + " holdPosition=" + selectedUnit.getMover().holdPosition);
                    } else if (moveClickElapsed > 4f) {
                        fail("native right-click did not assign a move destination: " + moveActionDiagnostic
                                + " holdPosition=" + selectedUnit.getMover().holdPosition);
                        return;
                    }
                }
            }
            if (!moveClickSeen && phaseElapsed > 25f) {
                fail("native ground right-click was not received");
                return;
            }
            double distance = selectedUnit.pos.getDistance(moveStart);
            if (moveCommandAccepted && distance > 2.0) {
                movementVerified = true;
                phaseElapsed = 0f;
                System.out.println("BLUE ALERTS INTERACTIVE MOVED distance=" + distance
                        + " start=" + moveStart + " end=" + selectedUnit.pos);
                System.out.println("BLUE ALERTS INTERACTIVE ENEMY_SCREEN " + projectUnit(enemyUnit));
                System.out.println("BLUE ALERTS INTERACTIVE ATTACK_READY");
            } else if (moveCommandAccepted && phaseElapsed > 25f) {
                fail("native ground order was accepted but the selected tank did not move");
            }
        }

        if (movementVerified && attackClickSeen && !attackVerified) {
            phaseElapsed += tpf;
            if (enemyUnit.health < enemyHealthAtAttack) {
                attackVerified = true;
                System.out.println("BLUE ALERTS INTERACTIVE ATTACK_DAMAGE health="
                        + enemyUnit.health + " from=" + enemyHealthAtAttack);
                System.out.println("BLUE ALERTS INTERACTIVE PASS selection+move+attack");
            } else if (phaseElapsed > 30f) {
                fail("real right-click on the enemy did not reduce its health");
            }
        } else if (movementVerified && !attackClickSeen) {
            phaseElapsed += tpf;
            if (phaseElapsed > 12f) {
                fail("native right-click event for enemy attack was not received");
            }
        }
    }

    private void setTestCamera() {
        // Follow the selected tank while it is being selected/moved, then
        // freeze the camera once movement is verified. This keeps the enemy
        // projection and SpatialSelector ray on the same stable view at attack.
        Vector3f target = TranslateUtil.toVector3f(selectedUnit.pos);
        cam.setFrustumPerspective(50f, (float) cam.getWidth() / cam.getHeight(), 0.1f, 1000f);
        cam.setLocation(new Vector3f(target.x, target.y - 14f, target.z + 16f));
        cam.lookAt(target, Vector3f.UNIT_Z);
        cam.update();
    }

    private Vector3f unitPickPoint(Unit unit) {
        var spatial = unit.actor.getViewElements().spatial;
        if (spatial != null && spatial.getWorldBound() != null) {
            return spatial.getWorldBound().getCenter().clone();
        }
        Vector3f fallback = TranslateUtil.toVector3f(unit.pos);
        fallback.z += 0.8f;
        return fallback;
    }

    private String projectUnit(Unit unit) {
        return project(unitPickPoint(unit));
    }

    private String project(Vector3f world) {
        Vector3f screen = cam.getScreenCoordinates(world);
        int x = Math.round(screen.x);
        int y = Math.round(cam.getHeight() - screen.y);
        if (screen.z < 0f || screen.z > 1f || x < 8 || x >= cam.getWidth() - 8
                || y < 8 || y >= cam.getHeight() - 8) {
            throw new IllegalStateException("Interactive test point is outside the camera: "
                    + x + "," + y + " depth=" + screen.z);
        }
        return x + "," + y;
    }

    private void fail(String message) {
        failed = true;
        System.err.println("BLUE ALERTS INTERACTIVE FAILURE: " + message);
    }

    public static void main(String[] args) {
        BlueAlertsInteractiveSmoke app = new BlueAlertsInteractiveSmoke();
        AppSettings testSettings = new AppSettings(true);
        testSettings.setWidth(1280);
        testSettings.setHeight(720);
        testSettings.setVSync(false);
        testSettings.setResizable(false);
        testSettings.setTitle("BLUE ALERTS Interactive Smoke");
        app.setSettings(testSettings);
        OpenRTSApplication.main(app);
    }
}
