import { ContentItem } from '../types/contentItem/ContentItem';
import { ContentType } from '../types/contentType/ContentType';
import { Taxonomy } from '../types/taxonomy/Taxonomy';
import { LiteralInput } from "../types/inputs/LiteralInput";
import { ElementsInput } from "../types/inputs/ElementInput";
import {
    getContentItemMemoized,
    getContentTypeMemoized,
    getProjectItemsMemoized,
    getProjectContentTypesMemoized,
    getItemsConditionalyMemoized, parseModularContent,
} from '../dbCommunication';
import {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLList,
    GraphQLID,
    GraphQLInt,
    GraphQLNonNull,
    GraphQLError,
    GraphQLInputObjectType,
} from 'graphql';
import { OrderOption } from "../types/scalars/OrderOption";
import { AllowedCharactersString } from "../types/scalars/AllowedCharactersString";
import { NonSpecialCharactersString } from "../types/scalars/NonSpecialCharactersString";

const UnionInputType = require('graphql-union-input-type');


const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'Query',
        fields: () => ({
            //ToDo: Delete unnecessary things like this one
            contentItem: {
                type: ContentItem,
                args: {
                    codename: { type: GraphQLID },
                },
                // root - is parent data (if it is a nested structure)
                resolve: (root, args) => getContentItemMemoized(args.codename).then(response => response),
            },

            contentItems: {
                type: new GraphQLList(ContentItem),
                args: {
                    project_id: { type: new GraphQLNonNull(GraphQLID) },
                    items_ids: { type: new GraphQLList(GraphQLID) },

                    system: { type: new GraphQLInputObjectType({
                        name: 'SystemInput',
                        fields: {
                            codename: { type: NonSpecialCharactersString },
                            type: { type: NonSpecialCharactersString },
                            language_id: { type: GraphQLID },
                            language: { type: NonSpecialCharactersString },
                            sitemap_locations: { type: new GraphQLList(NonSpecialCharactersString) },
                        },
                    })},

                    elements: { type: ElementsInput },
                    /*
                        depth = 1 => first level, without any modular_content dependencies
                        2 => second level, with modular_content dependencies up to first level of depth
                        3 => with modular_content dependencies of this item's modular_content dependencies
                     */
                    depth: { type: GraphQLInt },





                    orderByLastModifiedMethod: { type: OrderOption },
                    firstN: { type: GraphQLInt },
                },
                resolve: (root, args) => {

                    // if ((args.firstN || args.orderByLastModifiedMethod) && args.elements) {
                    //     args.elements.map(e => {
                    //         if (e.ordering !== null)
                    //             throw new GraphQLError(
                    //                 'Query error: Only one of arguments ordering method can be specified.' +
                    //                 'And only one of the combinations element.ordering.method with ordering.firstN' +
                    //                 ' or orderByLastModifiedMethod with firstN can be specified.'
                    //             );
                    //     });
                    // }

                    // ToDo: make getProjectItemsMemoized work with the new approach to elements
                    // ToDo: add the rest of the elements

                    return getProjectItemsMemoized(args).then(response => {
                        parseModularContent(response);
                        return response
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