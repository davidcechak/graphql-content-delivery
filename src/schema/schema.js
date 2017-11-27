import { ContentItem } from './types/contentItem/ContentItem';
import { ContentType } from './types/contentType/ContentType';
import { Taxonomy } from './types/taxonomy/Taxonomy';
import { Literal } from "./types/inputs/Literal";
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
} from 'graphql';

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
                    project_id: { type: GraphQLID },
                    language_id: { type: GraphQLID },
                },
                resolve: (root, args) => getProjectItemsMemoized(args.project_id, args.language_id).then(response => response),
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
                        type: new GraphQLList(Literal)
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