import { ContentItem } from '../types/contentItem/ContentItem';
import { ContentType } from '../types/contentType/ContentType';
import { Taxonomy } from '../types/taxonomy/Taxonomy';
import { LiteralInput } from "../types/inputs/LiteralInput";
import { ElementInput } from "../types/inputs/ElementInput";
import {
    getContentItemMemoized,
    getContentTypeMemoized,
    getProjectItemsMemoized,
    getProjectContentTypesMemoized,
    getItemsConditionalyMemoized,
} from '../dbCommunication';
import {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLList,
    GraphQLID,
    GraphQLInt,
    GraphQLNonNull,
    GraphQLError
} from 'graphql';
import { OrderOption } from "../types/scalars/OrderOption";

const UnionInputType = require('graphql-union-input-type');


const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'Query',
        fields: () => ({
            //ToDo: Delete unnecessary things like this one
            contentItem: {
                type: ContentItem,
                args: {
                    id: { type: GraphQLID },
                },
                // root - is parent data (if it is a nested structure)
                resolve: (root, args) => getContentItemMemoized(args.id).then(response => response),
            },

            contentItems: {
                type: new GraphQLList(ContentItem),
                args: {
                    item_ids: { type: new GraphQLList(GraphQLID) },
                    project_id: { type: new GraphQLNonNull(GraphQLID) },
                    language_id: { type: GraphQLID },
                    orderByLastModifiedMethod: { type: OrderOption },
                    firstN: { type: GraphQLInt },
                    element: { type: ElementInput }
                },
                resolve: (root, args) => {
                    if (args.project_id === null)
                        console.log('project_id is null, GraphQLNonNull -> should not be ');

                    if ((args.firstN || args.orderByLastModifiedMethod)
                        && args.element && args.element.ordering && args.element.ordering.firstN) {
                        throw new GraphQLError(
                            'Query error: Only one of arguments ordering method can be specified.' +
                            'And only one of the combinations element.ordering with element.firstN' +
                            ' or orderByLastModifiedMethod with firstN can be specified.'
                        );
                    }

                    if (args.element
                        && (
                            (args.element.value && args.element.values)
                            || (args.element.value && args.element.ordering)
                            || (args.element.ordering && args.element.values)
                        )
                    ) {
                        throw new GraphQLError(
                            'Query error: The key and only one of the arguments of ElementInput should be specified.'
                            + ' Read ElementInput description.'
                        );
                    }
                    return getProjectItemsMemoized(
                        args.item_ids,
                        args.project_id,
                        args.language_id,
                        args.orderByLastModifiedMethod,
                        args.firstN,
                        args.element
                    ).then(response => { console.log(response[0].elements.date.value); return response} );
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