import { GraphQLObjectType, GraphQLList, GraphQLString, GraphQLID } from 'graphql';

const SystemType = new GraphQLObjectType({
    name: 'System',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        codename: { type: GraphQLString },
        language: { type: GraphQLString },
        type: { type: GraphQLString },
        sitemap_locations: { type: new GraphQLList(GraphQLString) },
        last_modified: { type: GraphQLString },
    })
});

export {SystemType}