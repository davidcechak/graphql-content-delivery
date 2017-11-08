import * as configSettings from "../out/config";

const config = {
    // uri and primaryKey should not be commit
    uri: configSettings.uri,
    primaryKey: configSettings.primaryKey,

    database: {
        "id": "Content"
    },

    collection: {
        "id": "Items"
    },
};

module.exports = config;

