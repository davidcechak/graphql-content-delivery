import { contentItemCollectionUrl, client } from "./client";

const memoizee = require('memoizee');



function getContentItemsByCodenames(projectId, codenamesMap) {
    return new Promise((resolve, reject) => {
        let queryString = `SELECT * FROM Items i WHERE i.project_id = '${projectId}' AND ( `;
        const codenamesToQuery = new Set();

        codenamesMap.forEach(codenamesArray => {
            codenamesArray.map((codename) => codenamesToQuery.add(codename));
        });

        const codenamesToQueryArray = Array.from(codenamesToQuery);
        codenamesToQueryArray.map((codename, index) => {
            if (codenamesToQueryArray[index + 1] === undefined) {
                queryString = queryString + `i.system.codename = '${codename}' )`;
            }
            else {
                queryString = queryString + `i.system.codename = '${codename}' OR `;
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


function parseModularContent(object, modularContents){
    const keys = Object.keys(object);

    if (object['type'] === 'modular_content' && object['value']){
        modularContents.push(...object['value']);
        console.log(object['value']);
        console.log('modularContents:  ', modularContents);
    }
    keys.map((key) => {

        if (!!object[key] && typeof(object[key]) === "object") {
            if (key === 'modular_content' && object[key]) {
                modularContents.push(...object[key]);
                console.log(object[key]);
                console.log('modularContents:  ', modularContents);
            }
            parseModularContent(object[key], modularContents);
        }
    })
}


const convertToFieldName = (userInput) => {
    // WHERE c.project_id = "76b0495e-5b12-4e41-bd45-d82d490feff9" ORDER BY c.elements.date["value"] DESC
    switch (userInput.toLowerCase()) {
        case 'project_id':
            return 'i.project_id';
        case 'language_id':
            return 'i.language_id';
        case 'compatible_languages':
            return 'i.compatible_languages';
        case 'id':
            return 'i.system.id';
        case 'name':
            return 'i.system.name';
        case 'codename':
            return 'i.system.codename';
        case 'language':
            return 'i.system.language';
        case 'type':
            return 'i.system.type';
        case 'sitemap_locations':
            return 'i.system.sitemap_locations';
        case 'last_modified':
            return 'i.system.last_modified';
        default:
            return 'i.elements.' + userInput + '["value"]';
    }
};


// ToDo: remove (debugging purpose) console.logs and '\n' at the end of queryString insertions
function getProjectContentItems(input) {
    return new Promise((resolve, reject) => {
        const parameters = [
            { name: "@projectId", value: input.project_id },
        ];

        let queryString = `SELECT`;

        if (input.orderBy && input.orderBy.firstN) {
            queryString = queryString + ` TOP ${input.orderBy.firstN}`;
        }

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
                        queryString = queryString + ` AND ARRAY_CONTAINS(i.system.${key}, @${key}${sitemapIndex})`;
                        parameters.push({ name: `@${key}${sitemapIndex}`, value: value });
                    });
                }
                else {
                    queryString = queryString + ` AND i.system.${key} = @${key}`;
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

        // ### comparison filter ###
        if (input.comparisonFilter) {
            const field = convertToFieldName(input.comparisonFilter.field);
            queryString = queryString
                + ` AND ${field} ${input.comparisonFilter.getAllGreaterOrLowerChoice} "${input.comparisonFilter.value}"`;
        }


        if (input.orderBy && input.orderBy.field) {
            const field = convertToFieldName(input.orderBy.field);
            queryString = queryString + ` ORDER BY ${field} ${input.orderBy.direction}`;
        }

        console.log(queryString);
        const queryJSON = {
            query: queryString,
            parameters: parameters
        };

        console.log(queryJSON);

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
const getContentItemByCodenamesMemoized = memoizee(getContentItemsByCodenames, { maxAge: 5000 });

export {
    getProjectItemsMemoized,
    getContentItemByCodenamesMemoized,
    parseModularContent
};
