package app.example;

import app.OpenRTSApplication;
import model.ModelManager;

/**
 * BLUE ALERTS first playable OpenRTS skirmish.
 * Loads the generated two-faction battlefield without starting a network client.
 */
public class BlueAlertsSkirmish extends Game {
    @Override
    public void simpleInitApp() {
        super.simpleInitApp();
        ModelManager.loadBattlefield("assets/maps/blue-alerts-skirmish.btf");
        faction = ModelManager.getBattlefield().getEngagement().getFactions().get(0);
    }

    public static void main(String[] args) {
        OpenRTSApplication.main(new BlueAlertsSkirmish());
    }
}
