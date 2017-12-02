import { GraphQLInputObjectType, GraphQLInt, GraphQLNonNull } from 'graphql'
import { OrderOption } from "../scalars/OrderOption";
import { NonSpecialCharactersString } from "../scalars/NonSpecialCharactersString";

const OrderByInput = new GraphQLInputObjectType({
    name: 'OrderBy',
    description: "Supported fields are normal and system fields. " +
    "They are recognized by inserting one of the strings from below." +
    "If you wish to specify an element name to order by its value, insert it's key (codename)." +
    "However there is no check correctness check to determine if correct key was given.\n" +
    "Normal and system fields: \n" +
    "  'project_id', \n" +
    "  'language_id', \n" +
    "  'compatible_languages', \n" +
    "  'id', \n" +
    "  'name', \n" +
    "  'codename', \n" +
    "  'language', \n" +
    "  'type', \n" +
    "  'sitemap_locations', \n" +
    "  'last_modified'",

    fields: {
        field: { type: new GraphQLNonNull(NonSpecialCharactersString) },
        direction: { type: new GraphQLNonNull(OrderOption) },
        firstN: { type: GraphQLInt },
    },
});

export {OrderByInput}