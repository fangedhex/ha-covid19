import Bottleneck from "bottleneck";

const debug = require("debug")("ha-covid19:app");
import { HomeAssistant } from "./HomeAssistant";
import { Chronodrive } from "./Chronodrive";
import { connectAsync } from "async-mqtt";
import { CHRONO_DRIVE, CHRONO_USER, MQTT_BROKER, CHRONO_PASS, CHROMIUM_OPTS } from "./env.config";
import { VirtualBrowser } from "./util/VirtualBrowser";
import { launch } from "puppeteer";

(async () => {
    debug("Init");
    const chromium = await launch({
        args: CHROMIUM_OPTS
    });
    const page = await chromium.newPage();

    const virtualBrowser = new VirtualBrowser(page);

    debug("Connecting to MQTT Broker : %s", MQTT_BROKER);
    const mqttClient = await connectAsync(MQTT_BROKER);
    if (!mqttClient.connected) {
        throw "MQTT Client not connected.";
    }

    const chronodrive = new Chronodrive(virtualBrowser);
    const ha = new HomeAssistant(mqttClient);

    debug("Setting up chronodrive");
    let retry = 5;
    const bottleneck = new Bottleneck({
        minTime: 5000,
        maxConcurrent: 1
    })

    while(!await chronodrive.selectStore(CHRONO_DRIVE) && retry > 0) {
        retry--;
        if (retry > 0) {
            debug("Cannot select store. Retrying in 5 sec.");
            await bottleneck.schedule(() => Promise.resolve());
        } else {
            throw "Cannot select store after 5 retries";
        }
    }
    await chronodrive.connect(CHRONO_USER, CHRONO_PASS);
    await ha.setupSensor("chronodrive");

    debug("Running");
    const check = true;
    while (check) {
        const state = await chronodrive.check_state();
        if (state != undefined) await ha.updateSensor("chronodrive", state);
    }
})().catch((error) => {
    debug("Error : %O", error);
});
