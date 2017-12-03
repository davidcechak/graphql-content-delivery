import * as config from "../config";
const docdbClient = require("../../node_modules/documentdb/index").DocumentClient;


const client = new docdbClient(config.uri, { masterKey: config.primaryKey });
const databaseUrl = `dbs/${config.database.id}`;
const contentItemCollectionUrl = `${databaseUrl}/colls/${config.collections.itemsId}`;
const contentTypeCollectionUrl = `${databaseUrl}/colls/${config.collections.typesId}`;

export {client, databaseUrl, contentTypeCollectionUrl, contentItemCollectionUrl}