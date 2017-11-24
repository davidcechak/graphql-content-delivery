import { configSettings } from "./configSettings.js";

const config = {
    // uri and primaryKey should not be commit
    uri: configSettings.uri,
    primaryKey: configSettings.primaryKey,

    database: {
        "id": "Content"
    },

    collections: {
        itemsId: 'Items',
        typesId: 'Types',
    },
};

module.exports = config;

