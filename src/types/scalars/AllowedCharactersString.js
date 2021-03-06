import { GraphQLScalarType, GraphQLError } from 'graphql';

const AllowedCharactersString = new GraphQLScalarType({
    name: 'AllowedCharactersString',
    description: 'Represents a string with limited special characters',
    serialize: String,
    parseValue: (value) => {
        if (value.match(/^([A-Za-z]|\s|_|-|:|\.|[0-9])+$/)) {
            return value
        }
        throw new GraphQLError(
            `Query error: ${AllowedCharactersString.name} value can only consist of 
            letters, numbers, white spaces and characters _ - : . got a: ${value}`
        );
    },
    parseLiteral: (ast) => {
        if (ast.value.match(/^([A-Za-z]|\s|_|-|:|\.|[0-9])+$/)) {
            return ast.value
        }
        throw new GraphQLError(
            `Query error: ${AllowedCharactersString.name} value can only consist of 
            letters, numbers, white spaces and characters _ - : . got a: ${value}`,
            [ast]
        );
    }
});

export { AllowedCharactersString }