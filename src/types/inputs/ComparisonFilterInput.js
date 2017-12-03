import { GraphQLID, GraphQLInputObjectType, GraphQLList } from 'graphql';
import { NonSpecialCharactersString } from "../scalars/NonSpecialCharactersString";

const ComparisonFilterInput = new GraphQLInputObjectType({
    name: 'ComparisonFilterInput',
    fields: {
        codename: { type: NonSpecialCharactersString },
        type: { type: NonSpecialCharactersString },
        language_id: { type: GraphQLID },
        language: { type: NonSpecialCharactersString },
        sitemap_locations: { type: new GraphQLList(NonSpecialCharactersString) },
    },
});

export { ComparisonFilterInput }