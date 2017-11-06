import { getItem, getItems } from "./dbCommunication";
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLInt,
    GraphQLString,
    GraphQLList
} = require('graphql');

const ElementType = new GraphQLObjectType({
    name: 'Element',
    description: '...',

    fields: () => ({
        type: { type: GraphQLString },
        name: { type: GraphQLString },
        value: {
            type: GraphQLString,
            // resolve: rootData => rootData.value instanceof Array ? Object.values(rootData.value) : rootData.value,
            resolve: rootData => rootData.value,
        },
    })
});

const SystemType = new GraphQLObjectType({
    name: 'System',
    description: '...',

    fields: () => ({
        id: { type: GraphQLString },
        name: { type: GraphQLString },
        codename: { type: GraphQLString },
        type: { type: GraphQLString },
        sitemap_locations: { type: new GraphQLList(GraphQLString) },
        last_modified: { type: GraphQLString },
    })
});

const ItemType = new GraphQLObjectType({
    name: 'Item',
    description: '...',

    fields: () => ({
        // types of arguments below have to be corrected
        system: {
            type: SystemType,
            resolve: rootData => rootData.system
        },
        dependencies: { type: GraphQLString },
        search_metadata: { type: GraphQLString },

        // all arguments below have correct type
        id: { type: GraphQLString },
        project_id: { type: GraphQLString },
        elements: {
            type: new GraphQLList(ElementType),
            resolve: rootData => Object.values(rootData.elements)
        },

        _rid: { type: GraphQLString },
        _self: { type: GraphQLString },
        _etag: { type: GraphQLString },
        _attachments: { type: GraphQLString },
        _ts: { type: GraphQLInt },
    })
});

module.exports = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'Query',
        description: '...',

        fields: () => ({
            item: {
                type: ItemType,
                args: {
                    // types of arguments below have to be corrected
                    elements: { type: GraphQLString },
                    system: { type: GraphQLString },
                    dependencies: { type: GraphQLString },
                    search_metadata: { type: GraphQLString },

                    // all arguments below have correct type
                    id: { type: GraphQLString },
                    project_id: { type: GraphQLString },

                    _rid: { type: GraphQLString },
                    _self: { type: GraphQLString },
                    _etag: { type: GraphQLString },
                    _attachments: { type: GraphQLString },
                    _ts: { type: GraphQLInt },
                },
                // root - is parent data (if it is a nested structure)
                resolve: (root, args) => getItem(args.id).then(x => x)
            },
            itemsIds: {
                type: new GraphQLList(GraphQLString),
                resolve: (root, args) => getItems().then(x => x)
            }
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
    return Object.assign(item, ({ elements: { itemElements }}));
};