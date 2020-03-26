require("dotenv").config();
const env = require("env-var");

export const CHROMIUM_OPTS = env.get("CHROMIUM_OPTS")
    .asArray();

export const MQTT_BROKER = env.get("MQTT_BROKER")
    .required()
    .asUrlString();

export const CHRONO_DRIVE = env.get("CHRONO_DRIVE")
    .required()
    .asString();

export const CHRONO_USER = env.get("CHRONO_USER")
    .required()
    .asString();

export const CHRONO_PASS = env.get("CHRONO_PASS")
    .required()
    .asString();
