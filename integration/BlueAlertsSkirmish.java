package app;

import model.ModelManager;
import model.battlefield.army.ArmyManager;
import event.ControllerChangeEvent;
import event.EventManager;

/**
 * BLUE ALERTS first playable OpenRTS skirmish.
 * Reuses the initialized RTS editor shell, loads the two-faction battlefield,
 * then the smoke test switches to the native battlefield controller with F1.
 */
public class BlueAlertsSkirmish extends MainRTS {
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
        EventManager.post(new ControllerChangeEvent(0));
    }

    public static void main(String[] args) {
        OpenRTSApplication.main(new BlueAlertsSkirmish());
    }
}
