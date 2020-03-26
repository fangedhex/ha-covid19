const debug = require("debug")("ha-covid19:mqtt");
import {AsyncMqttClient, connect} from "async-mqtt";

export class HomeAssistant {
    private states: Map<string, boolean>;

    public constructor(private mqttClient: AsyncMqttClient) {
        this.states = new Map();
    }

    public setupSensor(name: string) {
        const config = {
            name,
            unique_id: name,
            state_topic: `homeassistant/binary_sensor/${name}/state`
        };

        const json = JSON.stringify(config);
        debug("Setting up sensor : %O", json);

        this.states.set(name, false);

        return this.mqttClient.publish(`homeassistant/binary_sensor/${name}/config`, json);
    }

    public updateSensor(name: string, state: boolean) {
        if (this.states.get(name) != state) {
            this.states.set(name, state);

            const stateStr = state ? "ON" : "OFF";
            debug("Changing state of %s to %s", name, stateStr);
            return this.mqttClient.publish(`homeassistant/binary_sensor/${name}/state`, stateStr);
        }
    }
}
