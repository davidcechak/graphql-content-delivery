import { ContentItem } from './types/contentItem/ContentItem';
import { ContentType } from './types/contentType/ContentType';
import { Taxonomy } from './types/taxonomyType/Taxonomy';
import {
    getContentItemMemoized,
    getContentTypeMemoized,
    getProjectItemsMemoized,
    getProjectContentTypesMemoized,
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


function parseLogicalOperator(value) {
    const upperCaseValue = value.toString().toUpperCase();
    if (upperCaseValue === 'AND') return 'AND';
    if (upperCaseValue === 'OR') return 'OR';
    return null;
}

const LogicalOperatorNode = new GraphQLScalarType({
    name: 'LogicalOperatorNode',
    serialize: parseLogicalOperator,
    parseValue: parseLogicalOperator,
    parseLiteral(ast) {
        return parseLogicalOperator(ast.value);
    }
});

const Leaf = new GraphQLInputObjectType({
    name: 'Leaf',
    fields: () => ({
        field: {
            /*
            ToDo:1 Type check - all the possibilities (e.g. id, project_id, lang, system.type, etc.)
            ToDo:2 Throw GraphQLError if it is incorrect field type
             */
            type: GraphQLString
        },
        value: {
            type: GraphQLString
        },
    })
});

const ConditionNode = UnionInputType({
    name: 'ConditionNode',
    resolveTypeFromAst: (ast) => {
        if (ast.fields && ast.fields[0] && ast.fields[0].name.value === 'field') {
            return Leaf;
        } else {
            return LogicalOperatorNode;
        }
    },
});

const ConditionInputType = new GraphQLInputObjectType({
    name: 'Condition',
    fields: () => ({
        nodeValue:{
            type: ConditionNode,
        },
        leftChild: {
            type: ConditionInputType
        },
        rightChild: {
            type: ConditionInputType
        }
    })
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
            conditionTest: {
                type: GraphQLBoolean,
                args: {
                    conditionalInput: {
                        type: ConditionInputType
                    }
                },
                resolve: (root, args) => {
                    /*
                    ToDo: Type check - traverse throw the whole object and check it's syntax correctness
                     */
                    console.log(args);
                    return true;
                }
            },
        })
    })
});


const preprocessItemForSchema = (item) => {
    const elementsArray = Object.values(item.elements);
    console.log(elementsArray);
    // For the unification of item.elements[x].value type. It could be an array of strings or a string
    const itemElements = elementsArray.map(x => {
        console.log(x);
        x.value = x.value instanceof Array ? x.value : [x.value];
        console.log(x);
    });
    return Object.assign(item, ({ elements: { itemElements } }));
};

export { schema }