import { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLInt, GraphQLList } from 'graphql';

const TaxonomyTerm = new GraphQLObjectType({
    name: 'TaxonomyTerm',
    fields: () => ({
        name: {type: GraphQLString},
        codename: {type: GraphQLString},
        terms: {type: new GraphQLList(TaxonomyTerm)},
    })
});

const TaxonomySystem = new GraphQLObjectType({
    name: 'TaxonomySystem',
    fields: () => ({
        id: {type: GraphQLString},
        name: {type: GraphQLString},
        codename: {type: GraphQLString},
        last_modified: {type: GraphQLString},
    })
});

const Taxonomy = new GraphQLObjectType({
    name: 'Taxonomy',
    fields: () => ({
        id: { type: GraphQLID },
        project_id: { type: GraphQLID },
        object_type: { type: GraphQLString },
        system: {
            type: TaxonomySystem,
            resolve: rootData => rootData.system
        },
        terms: {
            type: new GraphQLList(TaxonomyTerm),
            resolve: rootData => rootData.terms,
        },

        // Properties with underscore are important for database or communication with it.
        // There is no use of them for the client.
        _rid: { type: GraphQLString },
        _self: { type: GraphQLString },
        _etag: { type: GraphQLString },
        _attachments: { type: GraphQLString },
        _ts: { type: GraphQLInt },
    })
});

export { Taxonomy }