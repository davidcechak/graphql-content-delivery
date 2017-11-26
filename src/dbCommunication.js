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
                    if (results === null) {
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

        if (languageId === null) {
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
                if (results === null) {
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
                    if (results === null) {
                        console.log("results == null");
                    }
                    else {
                        resolve(results[0]);
                    }
                }
            })
    })
}


function getProjectContentTypes(projectId) {
    return new Promise((resolve, reject) => {
        client.queryDocuments(contentTypeCollectionUrl,
            `SELECT * 
            FROM Types types
            WHERE types.project_id="${projectId}"`)
            .toArray((err, results) => {
                if (err) {
                    console.log(JSON.stringify(err));
                }
                else {
                    if (results === null) {
                        console.log("results == null");
                    }
                    else {
                        resolve(results);
                    }
                }
            });
    })
}


function getItemsConditionaly(conditions) {
    return new Promise((resolve, reject) => {
        let query = `SELECT * 
                FROM Items items 
                WHERE (`;

        conditions.map(
            (clause, clauseIndex) => {
                clause.map((literal, literalIndex) => {
                    const queryCondition = `items.${literal.fieldName}="${literal.value}"`;
                    query = query + queryCondition;

                    if (literalIndex < clause.length-1) {
                        query = query + ` AND `;
                    }
                });
                if (clauseIndex < conditions.length-1) {
                    query = query + `) OR (`;
                }
                else {
                    query = query + `)`;
                }
            }
        );
        console.log(query);


        client.queryDocuments(contentItemCollectionUrl, query).toArray((err, results) => {
            if (err) {
                console.log(JSON.stringify(err));
            }
            else {
                if (results === null) {
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
const getContentItemMemoized = memoizee(getItem, { maxAge: 5000 });
const getContentTypeMemoized = memoizee(getContentType, { maxAge: 5000 });
const getProjectContentTypesMemoized = memoizee(getProjectContentTypes, { maxAge: 5000 });
const getItemsConditionalyMemoized = memoizee(getItemsConditionaly, { maxAge: 5000 });

export {
    getProjectItemsMemoized,
    getContentItemMemoized,
    getContentTypeMemoized,
    getProjectContentTypesMemoized,
    getItemsConditionalyMemoized
};
