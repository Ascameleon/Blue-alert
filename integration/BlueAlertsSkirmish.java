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
        CommandManager.act(-1L, new Point2D(40, 50));
        System.out.println("BLUE ALERTS issued group move order to (40, 50).");
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
            System.out.println("BLUE ALERTS movement smoke test: " + movedUnits + "/12 units moved.");
            if (movedUnits == 0) {
                throw new IllegalStateException("No BLUE ALERTS units moved after the group move order.");
            }
            movementVerified = true;
        }
    }

    public static void main(String[] args) {
        OpenRTSApplication.main(new BlueAlertsSkirmish());
    }
}
