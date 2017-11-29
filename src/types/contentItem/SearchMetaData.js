import { GraphQLString, GraphQLObjectType, GraphQLList } from "graphql";

const ElementMetadata = new GraphQLObjectType({
    name: 'ElementsMetadata',
    fields: () => ({
        key: { type: GraphQLString },
        value: { type: new GraphQLList(GraphQLString) },
    })
});

const SystemMetadata = new GraphQLObjectType({
    name: 'SystemMetadata',
    fields: () => ({
        sitemap_locations: { type: new GraphQLList(GraphQLString) },
    })
});

const SearchMetadata = new GraphQLObjectType({
    name: 'SearchMetadata',
    fields: () => ({
        system: {
            type: SystemMetadata,
            resolve: rootData => rootData.system
        },
        elements: {
            type: new GraphQLList(ElementMetadata),
            resolve: rootData => {
                const keys = Object.keys(rootData.elements);
                return keys.map(key => (Object.assign({ key: key }, rootData.elements[key])));
            }
        }
    })
});

export {SearchMetadata}