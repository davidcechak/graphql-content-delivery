import { ContentItem } from '../types/contentItem/ContentItem';
import { ContentType } from '../types/contentType/ContentType';
import { Taxonomy } from '../types/taxonomy/Taxonomy';
import { LiteralInput } from "../types/inputs/LiteralInput";
import { ElementsInput } from "../types/inputs/ElementInput";
import {
    getContentItemByCodenamesMemoized,
    getProjectItemsMemoized,
    parseModularContent,
} from '../dataAccess/contentItem';
import {
    getContentTypeMemoized,
    getProjectContentTypesMemoized,
} from '../dataAccess/contentType';
import {
    getItemsConditionalyMemoized,
} from '../dataAccess/contentItemConditionaly';
import {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLList,
    GraphQLID,
    GraphQLInt,
    GraphQLNonNull,
} from 'graphql';
import { OrderByInput } from "../types/inputs/OrderByInput";
import { ComparisonFilterInput } from "../types/inputs/ComparisonFilterInput";
import { SystemInput } from "../types/inputs/SystemInput";


const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'Query',
        fields: () => ({
            contentItems: {
                type: new GraphQLList(ContentItem),
                args: {
                    project_id: { type: new GraphQLNonNull(GraphQLID) },
                    items_ids: { type: new GraphQLList(GraphQLID) },

                    system: { type: SystemInput },

                    elements: { type: ElementsInput },
                    /*
                        depth = 1 => first level, without any modular_content dependencies
                        2 => second level, with modular_content dependencies up to first level of depth
                        3 => with modular_content dependencies of this item's modular_content dependencies
                     */
                    depth: { type: GraphQLInt },
//
                    orderBy: { type: OrderByInput },
                    comparisonFilter: { type: ComparisonFilterInput },
                },
                // root - is parent data (if it is a nested structure)
                resolve: (root, args) => {
                    return getProjectItemsMemoized(args).then(response => {
                        if (args.depth === undefined || args.depth < 2) return response;
                        let result = response;
                        const modularContents = new Map();


                        if (Array.isArray(result)) {
                            result.map((item, itemIndex) => {
                                const modularContentOfItem = [];
                                parseModularContent(item, modularContentOfItem);
                                modularContents.set(itemIndex, modularContentOfItem);
                            });
                        }
                        console.log('modularContents => ', modularContents);

                        // ask for modular contents

                        return getContentItemByCodenamesMemoized(args.project_id, modularContents)
                            .then(modularsFromDB => {

                                // itemIndex === mapKey of modularContents
                                result.map((item, mapKey) => {
                                    let itemModulars = [];

                                    // for each result item go through its modularContentItems and
                                    modularContents.get(mapKey).map(modularCodename => {
                                        modularsFromDB.map(modularItemFromDB => {
                                            if (modularCodename === modularItemFromDB.system.codename) {
                                                itemModulars.push(modularItemFromDB);
                                            }
                                        });
                                    });

                                    Object.assign(item, { modular_content: itemModulars })
                                });

                                return result
                            });

                    });
                }
            },

            //ToDo: Move querying one and more contentTypes into single method
            contentType: {
                type: ContentType,
                args: {
                    id: { type: GraphQLID },
                },
                resolve: (root, args) => getContentTypeMemoized(args.id).then(response => response),
            },

            contentTypes: {
                type: new GraphQLList(ContentType),
                args: {
                    project_id: { type: GraphQLID },
                },
                resolve: (root, args) => getProjectContentTypesMemoized(args.project_id).then(response => response),
            },

            //ToDo: Move querying one and more Taxonomies into single method
            taxonomy: {
                type: Taxonomy,
                args: {
                    id: { type: GraphQLID },
                },
                resolve: (root, args) => getContentTypeMemoized(args.id).then(response => response),
            },

            projectTaxonomies: {
                type: new GraphQLList(Taxonomy),
                args: {
                    project_id: { type: GraphQLID },
                },
                resolve: (root, args) => getProjectContentTypesMemoized(args.project_id).then(response => response),
            },

            disjunctiveNormalForm: {
                type: new GraphQLList(ContentItem),
                args: {
                    conjunctiveClauses: {
                        type: new GraphQLList(LiteralInput)
                    }
                },
                resolve: (root, args) => {
                    return getItemsConditionalyMemoized(args.conjunctiveClauses).then(response => response);
                }
            },
        })
    })
});

export { schema }