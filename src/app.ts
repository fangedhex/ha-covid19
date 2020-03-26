import { HomeAssistant } from "./HomeAssistant";
import { Chronodrive } from "./Chronodrive";
import { connect } from "async-mqtt";
import { CHRONO_DRIVE, CHRONO_USER, MQTT_BROKER, CHRONO_PASS } from "./env.config";
import { VirtualBrowser } from "./util/VirtualBrowser";

const virtualBrowser = new VirtualBrowser();
const mqttClient = connect(MQTT_BROKER);

const chronodrive = new Chronodrive(virtualBrowser);
const ha = new HomeAssistant(mqttClient);

(async () => {
    await chronodrive.selectStore(CHRONO_DRIVE);
    await chronodrive.connect(CHRONO_USER, CHRONO_PASS);
    await ha.setupSensor("chronodrive");

    const check = true;
    while (check) {
        const state: boolean = await chronodrive.check_state();
        await ha.updateSensor("chronodrive", state);
    }
})();
