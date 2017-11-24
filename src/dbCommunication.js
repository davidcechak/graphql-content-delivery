import * as config from "./config";
import { DEFAULT_ID } from "./constants";
const memoizee = require('memoizee');
const docdbClient = require("../node_modules/documentdb").DocumentClient;


const client = new docdbClient(config.uri, { masterKey: config.primaryKey });
const databaseUrl = `dbs/${config.database.id}`;
const contentItemCollectionUrl = `${databaseUrl}/colls/${config.collections.itemsId}`;
const contentTypeCollectionUrl = `${databaseUrl}/colls/${config.collections.typesId}`;


function getItem(id) {
    return new Promise((resolve, reject) => {
        client.queryDocuments(contentItemCollectionUrl,
            `SELECT * 
            FROM Items items 
            WHERE items.id='${id}'`)
            .toArray((err, results) => {
                if (err) {
                    console.log(JSON.stringify(err));
                }
                else {
                    if (results == null) {
                        console.log("results == null");
                    }
                    else {
                        resolve(results[0]);
                    }
                }
            })
    })
}


function getProjectItems(projectId, languageId) {
    return new Promise((resolve, reject) => {
        const query = languageId ?
            client.queryDocuments(contentItemCollectionUrl,
                `SELECT * 
                FROM Items items 
                WHERE items.project_id="${projectId}"
                AND items.language_id="${languageId}"`)
            : client.queryDocuments(contentItemCollectionUrl,
                `SELECT * 
                FROM Items items 
                WHERE 
                    items.project_id="${projectId}"
                OR 
                    (items.project_id="${projectId}"
                    AND items.language_id="${DEFAULT_ID}")`);

        if (languageId == null) {
            console.log('langID is null')
        }
        else {
            console.log('langID was given')
        }

        query.toArray((err, results) => {
            if (err) {
                console.log(JSON.stringify(err));
            }
            else {
                if (results == null) {
                    console.log("results == null");
                }
                else {
                    resolve(results);
                }
            }
        });
    })
}


function getContentType(id) {
    return new Promise((resolve, reject) => {
        client.queryDocuments(contentTypeCollectionUrl,
            `SELECT * 
            FROM Types types
            WHERE types.id='${id}'`)
            .toArray((err, results) => {
                if (err) {
                    console.log(JSON.stringify(err));
                }
                else {
                    if (results == null) {
                        console.log("results == null");
                    }
                    else {
                        resolve(results[0]);
                    }
                }
            })
    })
}

// Could be set to pre-fetch, before it expires. { maxAge: 1000, preFetch: true } default is preFetch: 0.33
const getProjectItemsMemoized = memoizee(getProjectItems, { maxAge: 5000 });
const getContentItemMemoized = memoizee(getItem, { maxAge: 5000 });
const getContentTypeMemoized = memoizee(getContentType, { maxAge: 5000 });

export {
    getProjectItemsMemoized,
    getContentItemMemoized,
    getContentTypeMemoized
};
