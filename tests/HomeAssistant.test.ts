import { expect } from "chai";
import {Substitute} from "@fluffy-spoon/substitute";
import {AsyncMqttClient} from "async-mqtt";
import {HomeAssistant} from "../src/HomeAssistant";

describe("HomeAssistant", () => {
    it("should setup sensor and update it", () => {
        const mqttClient = Substitute.for<AsyncMqttClient>();

        const config = {
            name: "dummy",
            unique_id: "dummy",
            state_topic: "homeassistant/binary_sensor/dummy/state"
        };
        const json = JSON.stringify(config);

        const homeAssistant = new HomeAssistant(mqttClient);
        homeAssistant.setupSensor("dummy");

        // @ts-ignore
        mqttClient.received().publish("homeassistant/binary_sensor/dummy/config", json);

        homeAssistant.updateSensor("dummy", true);

        // @ts-ignore
        mqttClient.received().publish("homeassistant/binary_sensor/dummy/state", "ON");
    });
});
