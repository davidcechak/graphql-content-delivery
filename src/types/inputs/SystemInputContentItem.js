import { NonSpecialCharactersString } from "../scalars/NonSpecialCharactersString";
import { GraphQLID, GraphQLList, GraphQLInputObjectType } from "graphql";

const SystemInputContentItem = new GraphQLInputObjectType({
    name: 'SystemInputContentItem',
    fields: {
        codename: { type: NonSpecialCharactersString },
        type: { type: NonSpecialCharactersString },
        language_id: { type: GraphQLID },
        language: { type: NonSpecialCharactersString },
        sitemap_locations: { type: new GraphQLList(NonSpecialCharactersString) },
    },
});


export { SystemInputContentItem }