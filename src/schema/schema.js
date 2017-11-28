import { ContentItem } from './types/contentItem/ContentItem';
import { ContentType } from './types/contentType/ContentType';
import { Taxonomy } from './types/taxonomy/Taxonomy';
import { LiteralInput } from "./types/inputs/LiteralInput";
import { ElementInput } from "./types/inputs/ElementInput";
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
    GraphQLNonNull
} from 'graphql';
import { OrderOption } from "./types/scalars/OrderOption";

const UnionInputType = require('graphql-union-input-type');



const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'Query',
        fields: () => ({
            contentItem: {
                type: ContentItem,
                args: {
                    id: { type: GraphQLID },
                },
                // root - is parent data (if it is a nested structure)
                resolve: (root, args) => getContentItemMemoized(args.id).then(response => response),
            },

            projectContentItems: {
                type: new GraphQLList(ContentItem),
                args: {
                    item_id: { type: GraphQLID },
                    project_id: { type: new GraphQLNonNull(GraphQLID) },
                    language_id: { type: GraphQLID },
                    orderByLastModified: { type: OrderOption },
                    firstN: { type: GraphQLInt },
                    element: { type: ElementInput }
                },
                resolve: (root, args) => {
                    if (args.project_id === null) console.log('project_id is null, GraphQLNonNull -> should not be ');

                    // ToDo: check whether ElementInput description is satisfied 
                    if (args.element)
                    return getProjectItemsMemoized(
                        args.item_id,
                        args.project_id,
                        args.language_id,
                        args.orderByLastModified,
                        args.firstN,
                        args.element
                    ).then(response => response);
                }
            },

            contentType: {
                type: ContentType,
                args: {
                    id: { type: GraphQLID },
                },
                resolve: (root, args) => getContentTypeMemoized(args.id).then(response => response),
            },

            projectContentTypes: {
                type: new GraphQLList(ContentType),
                args: {
                    project_id: { type: GraphQLID },
                },
                resolve: (root, args) => getProjectContentTypesMemoized(args.project_id).then(response => response),
            },

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