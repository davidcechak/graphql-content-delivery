import { GraphQLScalarType } from 'graphql';

const AllowedCharactersString = new GraphQLScalarType({
    name: 'AllowedCharactersString',
    description: 'Represents a string with limited special characters',
    serialize: String,
    parseValue: (value) => {
        if (value.match(/^([A-Za-z]|\s|_|-|:|\.|[0-9])+$/)) {
            return value
        }
        console.log(value)
        return null
    },
    parseLiteral: (ast) => {
        if (ast.value.match(/^([A-Za-z]|\s|_|-|:|\.|[0-9])+$/)) {
            return ast.value
        }
        console.log(ast.value)
        return null
    }
});

export { AllowedCharactersString }