import { contentTypeCollectionUrl, client } from "./client";

const memoizee = require('memoizee');


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

function getProjectContentTypes(input, objectType) {
    return new Promise((resolve, reject) => {
        const parameters = [
            { name: "@projectId", value: input.project_id },
            { name: "@objectType", value: objectType },
        ];

        let queryString = `SELECT * FROM Types t WHERE t.project_id = @projectId AND t.object_type = @objectType`;

        // ### item IDs ###
        if (input.items_ids) {
            input.items_ids.map((id, index) => {
                queryString = index === 0 ? queryString + ` AND (` : queryString + ` OR `;
                queryString = queryString + `t.id = @itemIds${index}`;
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
                queryString = queryString + ` AND t.system.${key} = @${key}`;
                parameters.push({ name: `@${key}`, value: input.system[key] });
            });
        }

        if (input.terms) {
            input.terms.map((termJSON, index) => {
                queryString = queryString
                    + ` AND ARRAY_CONTAINS(`
                    + `t.terms, @term${index}, true)`;
                parameters.push({ name: `@term${index}`, value: termJSON });
            });
        }

        if (input.elements) {
            const queriedElementTypes = Object.keys(input.elements);

            queriedElementTypes.map((type, index) => {
                const element = input.elements[type];
                queryString = queryString + ` AND t.elements.${element.key} != null`;


                // ## key, name elements and taxonomy element##
                if(element.name){
                    queryString = queryString + ` AND t.elements.${element.key}["name"] = @${element.key}${index}name`;
                    parameters.push({ name: `@${element.key}${index}name`, value: element.name })
                }
                // ## taxonomy element ##
                if(element.taxonomy_group){
                    queryString = queryString +
                        ` AND t.elements.${element.key}["taxonomy_group"] = @${element.key}${index}taxonomy_group`;
                    parameters.push({ name: `@${element.key}${index}taxonomy_group`, value: element.taxonomy_group })
                }
                // ## multiple_choice element##
                if (element.options){
                    element.options.map((optionJSON, index) => {
                        queryString = queryString
                            + ` AND ARRAY_CONTAINS(`
                            + `t.elements.${element.key}["options"], @${element.key}${index}option, true)`;
                        parameters.push({ name: `@${element.key}${index}option`, value: optionJSON });
                    });
                }


            });
        }


        console.log(queryString);
        const queryJSON = {
            query: queryString,
            parameters: parameters
        };

        console.log(queryJSON);

        client.queryDocuments(contentTypeCollectionUrl, queryJSON)
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


// Could be set to pre-fetch, before it expires. { maxAge: 1000, preFetch: true } default is preFetch: 0.33
const getContentTypeMemoized = memoizee(getContentType, { maxAge: 5000 });
const getProjectContentTypesMemoized = memoizee(getProjectContentTypes, { maxAge: 5000 });

export {
    getContentTypeMemoized,
    getProjectContentTypesMemoized,
};
