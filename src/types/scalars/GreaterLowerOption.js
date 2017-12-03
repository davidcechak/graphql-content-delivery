import { GraphQLScalarType, GraphQLError } from 'graphql'

const GreaterLowerOption = new GraphQLScalarType({
    name: 'GreaterLowerOption',
    description: 'Can be of value: \'GREATER\', \'LOWER\', \'GREATER EQUAL\' or \'LOWER EQUAL\'. A choice to order in descending or ascending manner',
    serialize: String,
    parseValue: (value) => {
        switch (value.toUpperCase()) {
            case 'GREATER':
                return '>';
            case 'LOWER':
                return '<';
            case 'GREATER EQUAL':
                return '>=';
            case 'LOWER EQUAL':
                return '<=';
            default:
                throw new GraphQLError(
                    `Query error: ${GreaterLowerOption.name} value can only be of value` +
                    ` 'GREATER', 'LOWER', 'GREATER EQUAL' or 'LOWER EQUAL', got a: ${value}`
                );
        }
    },
    parseLiteral: (ast) => {
        switch (ast.value.toUpperCase()) {
            case 'GREATER':
                return '>';
            case 'LOWER':
                return '<';
            case 'GREATER EQUAL':
                return '>=';
            case 'LOWER EQUAL':
                return '<=';
            default:
                throw new GraphQLError(
                    `Query error: ${GreaterLowerOption.name} value can only be of value` +
                    ` 'GREATER', 'LOWER', 'GREATER EQUAL' or 'LOWER EQUAL', got a: ${ast.value}`,
                    [ast]);
        }
    },
});

export { GreaterLowerOption }