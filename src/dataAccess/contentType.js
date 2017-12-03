import { contentTypeCollectionUrl } from "./client";

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
                    // The databaseKey contains '.', therefore it cannot be used as a variable
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


// Could be set to pre-fetch, before it expires. { maxAge: 1000, preFetch: true } default is preFetch: 0.33
const getContentTypeMemoized = memoizee(getContentType, { maxAge: 5000 });
const getProjectContentTypesMemoized = memoizee(getProjectContentTypes, { maxAge: 5000 });
const getItemsConditionalyMemoized = memoizee(getItemsConditionallyParametrized, { maxAge: 5000 });

export {
    getContentTypeMemoized,
    getProjectContentTypesMemoized,
    getItemsConditionalyMemoized,
};
