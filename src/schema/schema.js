import { ContentItem } from '../types/contentItem/ContentItem';
import { ContentType } from '../types/contentType/ContentType';
import { Taxonomy } from '../types/taxonomy/Taxonomy';
import { LiteralInput } from "../types/inputs/LiteralInput";
import { ElementInputContentItem } from "../types/inputs/ElementInputContentItem";
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
import { SystemInputContentItem } from "../types/inputs/SystemInputContentItem";
import { ElementInputContentType } from "../types/inputs/ElementInputContentType";
import { SystemInputContentType } from "../types/inputs/SystemInputContentType";
import { TermInput } from "../types/inputs/TermInput";


const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'Query',
        fields: () => ({
            contentItems: {
                type: new GraphQLList(ContentItem),
                args: {
                    project_id: { type: new GraphQLNonNull(GraphQLID) },
                    items_ids: { type: new GraphQLList(GraphQLID) },
                    language_id: { type: GraphQLID },

                    system: { type: SystemInputContentItem },

                    elements: { type: ElementInputContentItem },
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
                        if(modularContents.size === 0){
                            return response
                        }
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

            contentTypes: {
                type: new GraphQLList(ContentType),
                args: {
                    project_id: { type: new GraphQLNonNull(GraphQLID) },
                    items_ids: { type: new GraphQLList(GraphQLID) },
                    elements: { type: ElementInputContentType },
                    system: { type: SystemInputContentType },
                },
                resolve: (root, args) => getProjectContentTypesMemoized(args, 'ContentType').then(response => response),
            },

            taxonomies: {
                type: new GraphQLList(Taxonomy),
                args: {
                    project_id: { type: new GraphQLNonNull(GraphQLID) },
                    items_ids: { type: new GraphQLList(GraphQLID) },
                    terms: { type: new GraphQLList(TermInput) },
                    system: { type: SystemInputContentType },
                },
                resolve: (root, args) => getProjectContentTypesMemoized(args, 'TaxonomyGroup').then(response => response),
            },

            //ToDO: rename to something more understandable - f.e. disjunctive clauses, , zeptat se Jiriho?
            disjunctiveNormalFormContentItems: {
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