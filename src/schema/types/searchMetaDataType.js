import { GraphQLString, GraphQLObjectType, GraphQLList } from "graphql";

const ElementMetadataType = new GraphQLObjectType({
    name: 'ElementsMetadata',
    fields: () => ({
        key: { type: GraphQLString },
        value: { type: new GraphQLList(GraphQLString) },
    })
});

const SystemMetadataType = new GraphQLObjectType({
    name: 'SystemMetadata',
    fields: () => ({
        sitemap_locations: { type: new GraphQLList(GraphQLString) },
    })
});

const SearchMetadataType = new GraphQLObjectType({
    name: 'SearchMetadata',
    fields: () => ({
        system: {
            type: SystemMetadataType,
            resolve: rootData => rootData.system
        },
        elements: {
            type: new GraphQLList(ElementMetadataType),
            resolve: rootData => {
                const keys = Object.keys(rootData.elements);
                return keys.map(key => (Object.assign({ key: key }, rootData.elements[key])));
            }
        }
    })
});

export {SearchMetadataType}