import { GraphQLScalarType, GraphQLError } from 'graphql';

const NonSpecialCharactersString = new GraphQLScalarType({
    name: 'NonSpecialCharactersString',
    description: 'Represents a string with limited special characters',
    serialize: String,
    parseValue: (value) => {
        if (value.match(/^([A-Za-z]|_|-|[0-9])+$/)) {
            return value
        }
        throw new GraphQLError(
            `Query error: ${NonSpecialCharactersString.name} value can only consist of`
            + ` letters, numbers and characters _ - : . got a: ${value}`
        );
    },
    parseLiteral: (ast) => {
        if (ast.value.match(/^([A-Za-z]|_|-|[0-9])+$/)) {
            return ast.value
        }
        throw new GraphQLError(
            `Query error: ${NonSpecialCharactersString.name} value can only consist of`
            + ` letters, numbers and characters _ - : . got a: ${ast.value}`,
            [ast]
        );
    }
});

export { NonSpecialCharactersString }