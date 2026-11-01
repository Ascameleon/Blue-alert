package app;

import geometry.geom2d.Point2D;
import geometry.geom3d.Point3D;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import model.CommandManager;
import model.ModelManager;
import model.battlefield.army.ArmyManager;
import model.battlefield.army.components.Unit;
import event.ControllerChangeEvent;
import event.EventManager;
import com.jme3.math.Vector3f;
import com.jme3.scene.Spatial.CullHint;

/**
 * BLUE ALERTS first playable OpenRTS skirmish.
 * Loads a two-faction battlefield, switches directly to the native battlefield
 * controller, then exercises select-all and independent faction move orders.
 */
public class BlueAlertsSkirmish extends MainRTS {
    private final Map<Unit, Point3D> initialPositions = new HashMap<>();
    private float elapsedSinceLoad;
    private boolean movementVerified;

    @Override
    public void simpleInitApp() {
        super.simpleInitApp();
        fpsText.setCullHint(CullHint.Always);
        statsView.setCullHint(CullHint.Always);
        debugger.getNode().setCullHint(CullHint.Always);
        ModelManager.loadBattlefield("assets/maps/blue-alerts-skirmish.btf");
        int loadedUnits = ArmyManager.getUnits().size();
        if (loadedUnits != 12) {
            throw new IllegalStateException("Expected 12 BLUE ALERTS units, found " + loadedUnits);
        }
        System.out.println("BLUE ALERTS runtime loaded " + loadedUnits + " units and "
                + ModelManager.getBattlefield().getActorPool().getActors().size() + " actors.");

        for (Unit unit : ArmyManager.getUnits()) {
            initialPositions.put(unit, new Point3D(unit.pos));
        }
        CommandManager.selectAll();
        if (CommandManager.selection.size() != 12) {
            throw new IllegalStateException("Select-all selected " + CommandManager.selection.size() + " of 12 units.");
        }
        List<Unit> redUnits = ArmyManager.getUnits().stream()
                .filter(unit -> "1".equals(unit.faction.getName()))
                .toList();
        List<Unit> blueUnits = ArmyManager.getUnits().stream()
                .filter(unit -> "2".equals(unit.faction.getName()))
                .toList();
        if (redUnits.size() != 6 || blueUnits.size() != 6) {
            throw new IllegalStateException("Expected 6 units per faction; red="
                    + redUnits.size() + ", blue=" + blueUnits.size());
        }
        CommandManager.select(redUnits);
        CommandManager.act(-1L, new Point2D(18, 42));
        System.out.println("BLUE ALERTS issued red group move order to (18, 42).");
        CommandManager.select(blueUnits);
        CommandManager.act(-1L, new Point2D(28, 42));
        System.out.println("BLUE ALERTS issued blue group move order to (28, 42).");
        EventManager.post(new ControllerChangeEvent(0));
    }

    @Override
    public void simpleUpdate(float tpf) {
        super.simpleUpdate(tpf);
        elapsedSinceLoad += tpf;
        if (!movementVerified && elapsedSinceLoad >= 8f) {
            long redMoved = initialPositions.entrySet().stream()
                    .filter(entry -> "1".equals(entry.getKey().faction.getName()))
                    .filter(entry -> entry.getKey().pos.getDistance(entry.getValue()) > 0.5)
                    .count();
            long blueMoved = initialPositions.entrySet().stream()
                    .filter(entry -> "2".equals(entry.getKey().faction.getName()))
                    .filter(entry -> entry.getKey().pos.getDistance(entry.getValue()) > 0.5)
                    .count();
            for (Map.Entry<Unit, Point3D> entry : initialPositions.entrySet()) {
                Unit unit = entry.getKey();
                System.out.println("BLUE ALERTS unit movement: " + unit.builderID
                        + " faction=" + unit.faction.getName()
                        + " distance=" + unit.pos.getDistance(entry.getValue())
                        + " start=" + entry.getValue() + " end=" + unit.pos);
            }
            System.out.println("BLUE ALERTS red faction movement smoke test: " + redMoved + "/6 units moved.");
            System.out.println("BLUE ALERTS blue faction movement smoke test: " + blueMoved + "/6 units moved.");
            if (redMoved != 6 || blueMoved != 6) {
                throw new IllegalStateException("Expected both factions to move all 6 units; red="
                        + redMoved + ", blue=" + blueMoved);
            }
            movementVerified = true;
            // Frame the skirmish more tightly so the unit models are legible
            // in CI evidence while retaining both faction groups in view.
            cam.setFrustumPerspective(50f, (float) cam.getWidth() / cam.getHeight(), 0.1f, 1000f);
            cam.setLocation(new Vector3f(23f, 31f, 12f));
            cam.lookAt(new Vector3f(23f, 42f, 0f), Vector3f.UNIT_Z);
            System.out.println("BLUE ALERTS close camera frame around skirmish units at " + cam.getLocation());
        }
    }

    public static void main(String[] args) {
        OpenRTSApplication.main(new BlueAlertsSkirmish());
    }
}
