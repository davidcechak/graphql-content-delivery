import { GraphQLInputObjectType, GraphQLNonNull } from 'graphql'
import { NonSpecialCharactersString } from "../scalars/NonSpecialCharactersString";
import { AllowedCharactersString } from "../scalars/AllowedCharactersString";


const TermInput = new GraphQLInputObjectType({
    name: 'TermInput',
    fields: {
        name: { type: new GraphQLNonNull(AllowedCharactersString) },
        codename: { type: new GraphQLNonNull(NonSpecialCharactersString) },
    },
});

export { TermInput }