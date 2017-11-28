import { GraphQLInputObjectType, GraphQLInt, GraphQLNonNull, GraphQLList } from 'graphql'
import { AllowedCharactersString } from "../scalars/AllowedCharactersString";
import { OrderOption } from "../scalars/OrderOption";

/*
    Element key and element type are only known by the user during the runtime.
    This is a non-specific input object with loose input suggestions to cover the issue.
    A flexibility comes in a trade off for probable confusion of the user.
 */
const ElementInput = new GraphQLInputObjectType({
    name: 'ElementInput',
    description: 'A content item element.\n' +
    'argument "value" is expected if the element found under the key has a single value\n' +
    'argument "values" is expected if the element has an array of values\n' +
    'argument "dateFilter" is expected if the element type is date_time\n' +
    '\nQuery is valid if only one of the arguments "value", "values" and "dateFilter" is given',
    fields: () => ({
        key: { type: new GraphQLNonNull(AllowedCharactersString) },
        value: { type: AllowedCharactersString },
        values: { type: new GraphQLList(AllowedCharactersString) },
        dateFilter: { type: DateFilterInput }
        // ToDo: rich text and other complex types
    })
});


const DateFilterInput = new GraphQLInputObjectType({
    name: 'DateFilterInput',
    description: 'A content item element.\n' +
    'argument "value" is expected if the element found under the key has a single value\n' +
    'argument "values" is expected if the element has an array of values\n' +
    'argument "orderByDate" is expected if the element type is date_time\n' +
    'Query is only valid if one of the arguments "value", "values" and "orderByDate" is given',
    fields: () => ({
        orderByDate: { type: OrderOption },
        firstN: { type: GraphQLInt },
    })
});

export { ElementInput }