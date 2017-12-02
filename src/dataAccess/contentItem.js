import * as config from "../config";
import { DEFAULT_ID } from "../constants";
import { Taxonomy } from "../types/taxonomy/Taxonomy";

const memoizee = require('memoizee');
const docdbClient = require("../../node_modules/documentdb/index").DocumentClient;


const client = new docdbClient(config.uri, { masterKey: config.primaryKey });
const databaseUrl = `dbs/${config.database.id}`;
const contentItemCollectionUrl = `${databaseUrl}/colls/${config.collections.itemsId}`;
const contentTypeCollectionUrl = `${databaseUrl}/colls/${config.collections.typesId}`;


function getContentItems(codenames) {
    return new Promise((resolve, reject) => {
        let queryString = `SELECT * FROM Items i WHERE `;
        codenames.map((codename, index) => {
            if (codenames[index + 1]) {
                queryString = queryString + `i.system.codename = '${codename}'`;
            }
            else {
                queryString = queryString + `i.system.codename = '${codename} OR'`;
            }
        });

        console.log(queryString);

        client.queryDocuments(contentItemCollectionUrl, queryString)
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
            })
    })
}

function parseModularContent(object){
    Object.keys(object).map((key) => {

        if (!!object[key] && typeof(object[key]) === "object") {
            console.log(key, `  =>  `, object[key])
            parseModularContent(object[key]);
        }

    })
}

// ToDo: remove (debugging purpose) console.logs and '\n' at the end of queryString insertions
function getProjectContentItems(input) {
    return new Promise((resolve, reject) => {
        const parameters = [
            { name: "@projectId", value: input.project_id },
        ];
        // ### depth of dependent content_modules###
        const depth = input.depth > 1 ? input.depth : 0;

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
                            if (keys[index + 1] !== undefined) {
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

                    // ## images and links ##
                    const richTextParts = [];
                    const richTextPartsNames = [];
                    if (element.images) richTextParts.push(element.images) && richTextPartsNames.push('images');
                    if (element.links) richTextParts.push(element.links) && richTextPartsNames.push('links');

                    richTextParts.map((richTextPart, index) => {
                        const imageKeys = Object.keys(richTextPart);
                        imageKeys.map((imageKey) => {
                            const image = richTextPart[imageKey];

                            queryString = queryString
                                + ` AND i.elements["${element.key}"].${richTextPartsNames[index]}["${image["key"]}"]`
                                + ` != null` + `\n`;

                            // insideKeys = pixelKey
                            // name "pixel" symbolizes a fragment of image, in other words "pixel" is a field of "image" object
                            const pixelKeys = Object.keys(image);

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

                    if (element.modular_content) {
                        element.modular_content.map((value, innerIndex) => {
                            const valueParameter = `@modular_content${innerIndex}`;
                            queryString = queryString
                                + ` AND ARRAY_CONTAINS( `
                                + `i.elements["${element.key}"].modular_content, `
                                + valueParameter
                                + `, true )`;
                            parameters.push({ name: valueParameter, value: value });
                        });
                    }

                    if (element.value) {
                        queryString = queryString + ` AND i.elements.${element.key}["value"] = @${element.key}value`;
                        parameters.push({ name: `@${element.key}value`, value: element.value })
                    }

                    if (element.name) {
                        queryString = queryString + ` AND i.elements.${element.key}["name"] = @${element.key}name`;
                        parameters.push({ name: `@${element.key}name`, value: element.name })
                    }
                }
            });
        }

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


// Could be set to pre-fetch, before it expires. { maxAge: 1000, preFetch: true } default is preFetch: 0.33
const getProjectItemsMemoized = memoizee(getProjectContentItems, { maxAge: 5000 });
const getContentItemMemoized = memoizee(getContentItems, { maxAge: 5000 });

export {
    getProjectItemsMemoized,
    getContentItemMemoized,
    parseModularContent
};
