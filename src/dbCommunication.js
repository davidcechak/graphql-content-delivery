import * as config from "./config";
const docdbClient = require("../node_modules/documentdb").DocumentClient;

const client = new docdbClient(config.uri, { masterKey: config.primaryKey });

const HttpStatusCodes = { NOTFOUND: 404 };

const databaseUrl = `dbs/${config.database.id}`;
const collectionUrl = `${databaseUrl}/colls/${config.collection.id}`;

//dbs/123/colls/12/docs/1234

function readDbIfExists() {
    client.readDatabase(databaseUrl, (err, result) => {
        if (err) {
            console.log(JSON.stringify(err));
            console.log("ERROR :(");

        }
        else {
            console.log(JSON.stringify(result));
            console.log("IT WORKS!!!");
        }
    })
}

// readDbIfExists();

function readCollectionIfExists() {
    client.readCollection(collectionUrl, (err, result) => {
        if (err) {
            console.log("ERROR :(");
            console.log(JSON.stringify(err));
        }
        else {
            console.log("IT WORKS!!!");
            console.log(JSON.stringify(result, null, 2));

        }
    })
}

// readCollectionIfExists();

export function getItem(id) {
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
                    // for (let result of results) {
                    //     // console.log("Item.elements");
                    //     // console.log(JSON.stringify(result.elements));
                    //     const obj = Object.values(result);
                    //     console.log(obj);
                    // }
                    if (results == null) {
                        console.log("results == null");
                        // console.log(results[0]);
                    }
                    else {
                        // console.log(results[0]);
                        resolve(results[0]);
                    }
                }
            })
    })
}

// const result = getItem();
// result.then(x => console.log(x));

export function getItemsIds() {
    return new Promise((resolve, reject) => {
        client.queryDocuments(collectionUrl,
            `SELECT {'id': items.id} 
            FROM Items items`)
            .toArray((err, results) => {
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
            })
    })
}

// getItemsIds().then(x => console.log(x));