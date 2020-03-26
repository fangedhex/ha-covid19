import { HomeAssistant } from "./HomeAssistant";
import { Chronodrive } from "./Chronodrive";
import { connect } from "async-mqtt";
import { CHRONO_DRIVE, CHRONO_USER, MQTT_BROKER, CHRONO_PASS, CHROMIUM_OPTS } from "./env.config";
import { VirtualBrowser } from "./util/VirtualBrowser";
import { launch } from "puppeteer";

(async () => {
    const chromium = await launch({
        args: CHROMIUM_OPTS
    });
    const page = await chromium.newPage();

    const virtualBrowser = new VirtualBrowser(page);
    const mqttClient = connect(MQTT_BROKER);

    const chronodrive = new Chronodrive(virtualBrowser);
    const ha = new HomeAssistant(mqttClient);

    await chronodrive.selectStore(CHRONO_DRIVE);
    await chronodrive.connect(CHRONO_USER, CHRONO_PASS);
    await ha.setupSensor("chronodrive");

    const check = true;
    while (check) {
        const state = await chronodrive.check_state();
        await ha.updateSensor("chronodrive", state);
    }
})();
