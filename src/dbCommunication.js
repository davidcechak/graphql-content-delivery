import * as config from "./config";
import { DEFAULT_ID } from "./constants";
import { Taxonomy } from "./types/taxonomy/Taxonomy";

const memoizee = require('memoizee');
const docdbClient = require("../node_modules/documentdb").DocumentClient;


const client = new docdbClient(config.uri, { masterKey: config.primaryKey });
const databaseUrl = `dbs/${config.database.id}`;
const contentItemCollectionUrl = `${databaseUrl}/colls/${config.collections.itemsId}`;
const contentTypeCollectionUrl = `${databaseUrl}/colls/${config.collections.typesId}`;


function getContentItem(id) {
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

// ToDo: remove (debugging purpose) console.logs and '\n' at the end of queryString insertions
function getProjectContentItems(input) {
    return new Promise((resolve, reject) => {
        const parameters = [
            { name: "@projectId", value: input.project_id },
        ];

        let queryString = `SELECT`;
        queryString = queryString + ` * FROM Items i WHERE i.project_id = @projectId`;

        // ### item IDs ###
        if (input.items_ids) {
            input.items_ids.map((id, index) => {
                queryString = index === 0 ? queryString + ` AND (` : queryString + ` OR `;
                queryString = queryString + `i.id = @itemIds${index}`;
                parameters.push({ name: `@itemIds${index}`, value: id });
                if (index === input.items_ids.length - 1) {
                    queryString = queryString + `)`;
                }
            });
        }

        // ### system ###
        if (input.system) {
            const systemKeys = Object.keys(input.system);
            systemKeys.map((key, index) => {
                if (key === 'sitemap_locations') {
                    const sitemapValues = Object.values(input.system[key]);

                    sitemapValues.map((value, sitemapIndex) => {
                        queryString = queryString + ` AND ARRAY_CONTAINS(i.${key}, @${key}${sitemapIndex})`;
                        parameters.push({ name: `@${key}${sitemapIndex}`, value: value });
                    });
                }
                else {
                    queryString = queryString + ` AND i.${key} = @${key}`;
                    parameters.push({ name: `@${key}`, value: input.system[key] });
                }
            });
        }


        // ### elements ###
        if (input.elements) {
            const queriedElementTypes = Object.keys(input.elements);

            queriedElementTypes.map((type, index) => {
                const element = input.elements[type];

                // ## single value elements ##
                if (type === 'text' || type === 'url_slug' || type === 'date' || type === 'number') {
                    queryString = queryString + ` AND i.elements.${element.key}["value"] = @${element.key}${index}`;
                    parameters.push({ name: `@${element.key}${index}`, value: element.value })
                }

                // ## modular_content element ##
                if (type === 'modular_content') {
                    const values = Object.values(element.value);

                    values.map((value, modularIndex) => {
                        queryString = queryString
                            + ` AND ARRAY_CONTAINS(`
                            + `i.elements.${element.key}["value"], @${element.key}${modularIndex})`;
                        parameters.push({ name: `@${element.key}${modularIndex}`, value: value });
                    });
                }

                // ## taxonomy, multiple_choice and asset elements ##
                if (type === 'taxonomy' || type === 'multiple_choice' || type === 'asset') {
                    const values = Object.values(element.value);

                    values.map((inputObject, assetIndex) => {
                        queryString = queryString + ` AND ARRAY_CONTAINS(i.elements.${element.key}["value"],{ `;

                        const keys = Object.keys(inputObject);
                        keys.map((key, index) => {
                            const valueParameter = `@${type}${key}${assetIndex}${index}`;
                            queryString = queryString + ` ${key}: ` + valueParameter;
                            if (keys[index+1] !== undefined) {
                                queryString = queryString + `, `
                            }
                            parameters.push({
                                name: valueParameter,
                                value: inputObject[key]
                            });
                        });
                        queryString = queryString + `}, true)`;
                    });
                }

                // ## rich_text elements ##
                if (type === 'rich_text') {

                    console.log()
                    console.log()
                    console.log('type => ', type)
                    console.log()
                    console.log('element => ', element)
                    console.log()
                    console.log()


                    const richTextParts = [];
                    const richTextPartsNames = [];
                    if (element.images) richTextParts.push(element.images) && richTextPartsNames.push('images');
                    if (element.links) richTextParts.push(element.links) && richTextPartsNames.push('links');
                    console.log('richTextParts => ', richTextParts)
                    console.log()
                    console.log()
                    console.log('richTextPartsNames => ', richTextPartsNames)
                    console.log()
                    console.log()


                    richTextParts.map( (richTextPart, index) => {
                        console.log('richTextPart => ', richTextPart)

                        const imageKeys = Object.keys(richTextPart);
                        console.log('imageKeys', imageKeys)

                        imageKeys.map((imageKey) => {
                            const image = richTextPart[imageKey];

                            queryString = queryString
                                + ` AND i.elements["${element.key}"].${richTextPartsNames[index]}["${image["key"]}"]`
                                + ` != null`+ `\n`;

                            // insideKeys = pixelKey
                            // name "pixel" symbolizes a fragment of image, in other words "pixel" is a field of "image" object
                            const pixelKeys = Object.keys(image);
                            console.log('pixelKeys', pixelKeys)

                            // to get rid of 'key' elements as the database representation is different from arguments
                            pixelKeys.shift();
                            pixelKeys.map((pixelKey) => {
                                const pixelValueParameter
                                    = `@${element.key}${richTextPartsNames[index]}${imageKey}${pixelKey}`;
                                queryString = queryString
                                    + ` AND i.elements["${element.key}"].${richTextPartsNames[index]}["${image["key"]}"].${pixelKey}`
                                    + ` = ` + pixelValueParameter + `\n`;
                                parameters.push({ name: pixelValueParameter, value: image[pixelKey] })
                            });
                        });
                    });


                }
            });
        }

        console.log();
        console.log(queryString);
        console.log();
        console.log(parameters);


        const queryJSON = {
            query: queryString,
            parameters: parameters
        };


        client.queryDocuments(contentItemCollectionUrl, queryJSON).toArray((err, results) => {
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


function getProjectContentItemsBackup(itemIds, projectId, languageId, orderByLastModified, firstN, elements) {
    return new Promise((resolve, reject) => {
        const parameters = [
            { name: "@projectId", value: projectId },
            { name: "@languageId", value: languageId }
        ];

        let queryString = `SELECT`;
        const topAmount =
            (elements && elements.ordering && elements.ordering.firstN)
                ? elements.ordering.firstN
                : firstN;
        if (topAmount) {
            queryString = queryString + ` TOP @topAmount`;
            parameters.push({ name: "@topAmount", value: topAmount }
            )
        }

        queryString = queryString + ` * FROM Items i WHERE i.project_id = @projectId`;

        if (languageId) {
            queryString = queryString + ` AND i.language_id = @languageId`;
        }

        itemIds.map((id, index) => {
            queryString = index === 0 ? queryString + ` AND (` : queryString + ` OR `;
            queryString = queryString + `i.id = @itemIds${index}`;
            parameters.push({ name: `@itemIds${index}`, value: id });
            if (index === itemIds.length - 1) {
                queryString = queryString + `)`;
            }
        });


        if (elements.key) {
            if (elements.value) {
                queryString = queryString + ` AND i.elements.${elements.key}.value = @elementValue`;
                parameters.push({ name: "@elementValue", value: elements.value })
            }
            if (elements.values) {
                queryString = queryString
                    + ` AND ARRAY_CONTAINS(i.${elements.key}, @elementValue)`;
                parameters.push({ name: "@elementValue", value: elements.values })
            }
        }

        if (orderByLastModified) {
            queryString = queryString + ` ORDER BY i.system.last_modified ${orderByLastModified}`;
        }
        else if (elements.ordering) {
            queryString = queryString
                + ` ORDER BY i.elements.${elements.key}["value"] ${elements.ordering.method}`;
        }

        console.log(queryString);

        const queryJSON = {
            query: queryString,
            parameters: parameters
        };

        client.queryDocuments(contentItemCollectionUrl, queryJSON).toArray((err, results) => {
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


const convertToDatabaseKey = (key) => {
    switch (key) {
        case 'systemId':
            return 'system.id';
        case 'systemName':
            return 'system.name';
        case 'systemCodename':
            return 'system.codename';
        case 'systemLanguage':
            return 'system.language';
        case 'systemType':
            return 'system.type';
        case 'systemSitemap_locations':
            return 'system.sitemap_locations';
        case 'systemLast_modified':
            return 'system.last_modified';
        default:
            return key;
    }
};


/*
    DocumentDB SQL query does not deal with duplication in parameter names
        'WHERE project_id = @project_id OR project_id = @project_id'
        {
            parameters: [
                {
                    name: @project_id
                    value: "1"
                },
                {
                    name: @project_id
                    value: "2"
                }
            ]
        }
    Therefore unique identifier have to be used "name: `@${key + clauseIndex + keyIndex}`"
 */
function getItemsConditionallyParametrized(conditions) {
    return new Promise((resolve, reject) => {
        let queryString = `SELECT * 
        FROM Items items 
        WHERE (`;
        const parameters = [];

        conditions.map((clause, clauseIndex) => {

                const keys = Object.keys(clause);

                keys.map((key, keyIndex) => {
                    // The databaseKey contains '.', therefore it cannot be used as a Map key
                    const databaseKey = convertToDatabaseKey(key);

                    const parameter = {
                        name: `@${key + clauseIndex + keyIndex}`,
                        value: `${clause[key]}`
                    };

                    const queryCondition = (
                        key === 'compatible_languages' || key === 'systemSitemap_locations'
                    )
                        ? `ARRAY_CONTAINS(items.${databaseKey}, @${key + clauseIndex + keyIndex})`
                        : `items.${databaseKey} = @${key + clauseIndex + keyIndex}`;
                    queryString = queryString + queryCondition;

                    parameters.push(parameter);

                    if (keyIndex < keys.length - 1) {
                        queryString = queryString + ` AND `;
                    }
                });
                if (clauseIndex < conditions.length - 1) {
                    queryString = queryString + `) OR (`;
                }
                else {
                    queryString = queryString + `)`;
                }
            }
        );

        const queryJSON = {
            query: queryString,
            parameters: parameters
        };

        client.queryDocuments(contentItemCollectionUrl, queryJSON).toArray((err, results) => {
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


/*
    Function getItemsConditionally is a variation of getItemsConditionallyParametrized,
    without the parametrized SQL query format
 */
function getItemsConditionally(conditions) {
    return new Promise((resolve, reject) => {
        let queryString = `SELECT * 
                FROM Items items 
                WHERE (`;

        conditions.map((clause, clauseIndex) => {

                const keys = Object.keys(clause);

                keys.map((key, keyIndex) => {
                    const databaseKey = convertToDatabaseKey(key);
                    const queryCondition = (
                        key === 'compatible_languages' || key === 'systemSitemap_locations'
                    )
                        ? `ARRAY_CONTAINS(items.${databaseKey}, "${clause[key]}")`
                        : `items.${databaseKey}="${clause[key]}"`;
                    queryString = queryString + queryCondition;

                    if (keyIndex < keys.length - 1) {
                        queryString = queryString + ` AND `;
                    }
                    console.log('inner')
                });
                if (clauseIndex < conditions.length - 1) {
                    queryString = queryString + `) OR (`;
                }
                else {
                    queryString = queryString + `)`;
                }
                console.log('outer')

            }
        );
        console.log(queryString);


        client.queryDocuments(contentItemCollectionUrl, queryString).toArray((err, results) => {
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
const getProjectItemsMemoized = memoizee(getProjectContentItems, { maxAge: 5000 });
const getContentItemMemoized = memoizee(getContentItem, { maxAge: 5000 });
const getContentTypeMemoized = memoizee(getContentType, { maxAge: 5000 });
const getProjectContentTypesMemoized = memoizee(getProjectContentTypes, { maxAge: 5000 });
const getItemsConditionalyMemoized = memoizee(getItemsConditionallyParametrized, { maxAge: 5000 });

export {
    getProjectItemsMemoized,
    getContentItemMemoized,
    getContentTypeMemoized,
    getProjectContentTypesMemoized,
    getItemsConditionalyMemoized
};
