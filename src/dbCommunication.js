import * as config from "./config";
import { DEFAULT_ID } from "./constants";
const memoizee = require('memoizee');
const docdbClient = require("../node_modules/documentdb").DocumentClient;


const client = new docdbClient(config.uri, { masterKey: config.primaryKey });
const databaseUrl = `dbs/${config.database.id}`;
const collectionUrl = `${databaseUrl}/colls/${config.collection.id}`;


function getItem(id) {
    return new Promise((resolve, reject) => {
        client.queryDocuments(collectionUrl,
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
            client.queryDocuments(collectionUrl,
                `SELECT * 
                FROM Items items 
                WHERE items.project_id="${projectId}"
                AND items.language_id="${languageId}"`)
            : client.queryDocuments(collectionUrl,
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

// Could be set to pre-fetch, before it expires. { maxAge: 1000, preFetch: true } default is preFetch: 0.33
const getProjectItemsMemoized = memoizee(getProjectItems, { maxAge: 5000 });
const getItemMemoized = memoizee(getItem, { maxAge: 5000 });

export {
    getProjectItemsMemoized,
    getItemMemoized
};
