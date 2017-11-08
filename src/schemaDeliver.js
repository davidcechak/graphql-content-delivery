import { getItem, getItemsIds } from "./dbCommunication";
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLInt,
    GraphQLString,
    GraphQLList,
    GraphQLUnionType,
    GraphQLID
} = require('graphql');


const TextElementType = new GraphQLObjectType({
    name: 'TextElement',
    description: '...',

    fields: () => ({
        type: { type: GraphQLString },
        name: { type: GraphQLString },
        value: {
            type: GraphQLString,
            resolve: rootData => rootData.value,
        },
    })
});

const Asset = new GraphQLObjectType({
   name: 'Asset',

   fields: () => ({
    name: { type: GraphQLString },
    type: { type: GraphQLString },
    size: { type: GraphQLInt },
    url: { type: GraphQLString },
   })
});

const AssetElementType = new GraphQLObjectType({
    name: 'AssetElement',
    description: '...',

    fields: () => ({
        type: { type: GraphQLString },
        name: { type: GraphQLString },

        /*
        Alias 'assetContent' have to be used for 'value', because the field 'value'
        returns conflicting types String and [Asset] in TextElementType and AssetElementType
         */
        assetContent: {
            type: new GraphQLList(Asset),
            resolve: rootData => Object.values(rootData.value),
        },
    })
});

const ElementType = new GraphQLUnionType({
    name: 'Element',
    types: [ TextElementType, AssetElementType ],
    resolveType(element) {
        if (element.type == 'text') {
            return TextElementType;
        }
        if (element.type == 'asset') {
            return AssetElementType;
        }
    }
});

const SystemType = new GraphQLObjectType({
    name: 'System',
    description: '...',

    fields: () => ({
        id: { type: GraphQLID },
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
        id: { type: GraphQLID },
        project_id: { type: GraphQLID },
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

const WrappedItemIdType = new GraphQLObjectType({
    name: 'WrappedItemId',

    fields: () => ({
        id: {
            type: GraphQLString,
            resolve: rootData => rootData.$1.id,
        }
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
                    id: { type: GraphQLID },
                    project_id: { type: GraphQLID },

                    _rid: { type: GraphQLString },
                    _self: { type: GraphQLString },
                    _etag: { type: GraphQLString },
                    _attachments: { type: GraphQLString },
                    _ts: { type: GraphQLInt },
                },
                // root - is parent data (if it is a nested structure)
                resolve: (root, args) => getItem(args.id).then(response => response)
            },
            itemsIds: {
                type: new GraphQLList(WrappedItemIdType),
                args: {},
                resolve: (root, args) => getItemsIds().then(response => response),
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