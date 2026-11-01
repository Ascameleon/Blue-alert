package app;

import model.ModelManager;

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
    }

    public static void main(String[] args) {
        OpenRTSApplication.main(new BlueAlertsSkirmish());
    }
}
