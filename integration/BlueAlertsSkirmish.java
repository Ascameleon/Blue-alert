package app;

import geometry.geom2d.Point2D;
import geometry.geom3d.Point3D;
import java.util.HashMap;
import java.util.Map;
import model.CommandManager;
import model.ModelManager;
import model.battlefield.army.ArmyManager;
import model.battlefield.army.components.Unit;
import event.ControllerChangeEvent;
import event.EventManager;
import com.jme3.math.Vector3f;

/**
 * BLUE ALERTS first playable OpenRTS skirmish.
 * Loads a two-faction battlefield, switches directly to the native battlefield
 * controller, then exercises select-all and a group move order for smoke testing.
 */
public class BlueAlertsSkirmish extends MainRTS {
    private final Map<Unit, Point3D> initialPositions = new HashMap<>();
    private float elapsedSinceLoad;
    private boolean movementVerified;

    @Override
    public void simpleInitApp() {
        super.simpleInitApp();
        setDisplayStatView(false);
        setDisplayFps(false);
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
        CommandManager.act(-1L, new Point2D(23, 42));
        System.out.println("BLUE ALERTS issued group move order to (23, 42).");
        EventManager.post(new ControllerChangeEvent(0));
    }

    @Override
    public void simpleUpdate(float tpf) {
        super.simpleUpdate(tpf);
        elapsedSinceLoad += tpf;
        if (!movementVerified && elapsedSinceLoad >= 8f) {
            long movedUnits = initialPositions.entrySet().stream()
                    .filter(entry -> entry.getKey().pos.getDistance(entry.getValue()) > 0.5)
                    .count();
            for (Map.Entry<Unit, Point3D> entry : initialPositions.entrySet()) {
                Unit unit = entry.getKey();
                System.out.println("BLUE ALERTS unit movement: " + unit.builderID
                        + " faction=" + unit.faction.getName()
                        + " distance=" + unit.pos.getDistance(entry.getValue())
                        + " start=" + entry.getValue() + " end=" + unit.pos);
            }
            System.out.println("BLUE ALERTS movement smoke test: " + movedUnits + "/12 units moved.");
            if (movedUnits == 0) {
                throw new IllegalStateException("No BLUE ALERTS units moved after the group move order.");
            }
            movementVerified = true;
            // The stock editor camera starts near map origin; explicitly frame
            // the skirmish cluster so CI screenshots prove that the units render.
            cam.setFrustumPerspective(55f, (float) cam.getWidth() / cam.getHeight(), 0.1f, 1000f);
            cam.setLocation(new Vector3f(23f, 10f, 30f));
            cam.lookAt(new Vector3f(23f, 40f, 0f), Vector3f.UNIT_Z);
            System.out.println("BLUE ALERTS camera framed around skirmish units at " + cam.getLocation());
        }
    }

    public static void main(String[] args) {
        OpenRTSApplication.main(new BlueAlertsSkirmish());
    }
}
