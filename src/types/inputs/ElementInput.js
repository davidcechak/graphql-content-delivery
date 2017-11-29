import { GraphQLInputObjectType, GraphQLInt, GraphQLNonNull, GraphQLList } from 'graphql'
import { AllowedCharactersString } from "../scalars/AllowedCharactersString";
import { OrderOption } from "../scalars/OrderOption";
import { NonSpecialCharactersString } from "../scalars/NonSpecialCharactersString";

/*
    Element key and element type are only known by the user during the runtime.
    This is a non-specific input object with loose input suggestions to cover the issue.
    A flexibility comes in a trade off for probable confusion of the user.
 */
const DESCRIPTION =
    'Query IS ONLY VALID IF one of the arguments "value", "values" or' +
    '"ordering" is given together with "key" argument.\n\n' +
    'A content item element.\n' +
    '"key" have to be specified together with only one of the options below:\n' +
    'argument "value" is expected if the element found under the key has a single value\n' +
    'argument "values" is expected if the element has an array of values\n' +
    'argument "ordering" is expected if the element type is date_time';


const DateFilterInput = new GraphQLInputObjectType({
    name: 'DateFilterInput',
    description: DESCRIPTION,
    fields: {
        method: { type: OrderOption },
        firstN: { type: GraphQLInt },
    }
});

const ElementInput = new GraphQLInputObjectType({
    name: 'ElementInput',
    description: DESCRIPTION,
    fields: {
        key: { type: new GraphQLNonNull(NonSpecialCharactersString) },
        value: { type: AllowedCharactersString },
        values: { type: new GraphQLList(AllowedCharactersString) },
        ordering: { type: DateFilterInput }
        // ToDo: rich text and other complex types
    }
});

export { ElementInput }