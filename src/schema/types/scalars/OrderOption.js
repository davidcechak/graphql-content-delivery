import { GraphQLScalarType, GraphQLError } from 'graphql'

const OrderOption = new GraphQLScalarType({
    name: 'OrderOption',
    description: 'Can be of value: \'DESC\' or \'ASC\'. A choice to order in descending or ascending manner',
    serialize: String,
    parseValue: (value) => {
        if (value.match('DESC')) {
            return 'DESC'
        }
        if (value.match('ASC')) {
            return 'ASC'
        }
        throw new GraphQLError(
            `Query error: ${OrderOption.name} value can only be of value 'DESC' or 'ASC', got a: ${value}`
        );
    },
    parseLiteral: (ast) => {
        if (ast.value.match('DESC')) {
            return 'DESC'
        }
        if (ast.value.match('ASC')) {
            return 'ASC'
        }
        throw new GraphQLError(
            `Query error: ${OrderOption.name} value can only be of value 'DESC' or 'ASC', got a: ${ast.value}`,
            [ast]
        );
    },
});

export { OrderOption }