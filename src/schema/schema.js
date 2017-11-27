import { ContentItem } from './types/contentItem/ContentItem';
import { ContentType } from './types/contentType/ContentType';
import { Taxonomy } from './types/taxonomyType/Taxonomy';
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
    GraphQLInputObjectType,
    GraphQLString,
    GraphQLScalarType,
    GraphQLBoolean,
} from 'graphql';

const UnionInputType = require('graphql-union-input-type');

const Literal = new GraphQLInputObjectType({
    name: 'Literal',
    fields: () => ({
        id: { type: AllowedCharactersString },
        project_id: { type: AllowedCharactersString },
        language_id: { type: AllowedCharactersString },
        compatible_languages: { type: new GraphQLList(AllowedCharactersString) },
        systemId: { type: AllowedCharactersString },
        systemName: { type: AllowedCharactersString },
        systemCodename: { type: AllowedCharactersString },
        systemLanguage: { type: AllowedCharactersString },
        systemType: { type: AllowedCharactersString },
        systemSitemap_locations: { type: new GraphQLList(AllowedCharactersString) },
        systemLast_modified: { type: AllowedCharactersString },
    })
});

const AllowedCharactersString = new GraphQLScalarType({
    name: 'AllowedCharactersString',
    description: 'represents a string with no special characters',
    serialize: String,
    parseValue: (value) => {
        if (value.match(/^([A-Za-z]|\s|_|-|:|\.|[0-9]|[0-9];[0-9])+$/)) {
            return value
        }
        console.log(value)
        return null
    },
    parseLiteral: (ast) => {
        if (ast.value.match(/^([A-Za-z]|\s|_|-|:|\.|[0-9]|[0-9];[0-9])+$/)) {
            return ast.value
        }
        console.log(ast.value)
        return null
    }
});

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
                    /*
                    ToDo: Type check - traverse throw the whole object and check it's syntax correctness
                     */
                    return getItemsConditionalyMemoized(args.conjunctiveClauses).then(response => response);
                }
            },
        })
    })
});

export { schema }