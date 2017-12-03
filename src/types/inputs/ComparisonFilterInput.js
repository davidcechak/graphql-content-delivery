import { GraphQLNonNull, GraphQLInputObjectType } from 'graphql';
import { NonSpecialCharactersString } from "../scalars/NonSpecialCharactersString";
import { GreaterLowerOption } from "../scalars/GreaterLowerOption";
import { AllowedCharactersString } from "../scalars/AllowedCharactersString";


const ComparisonFilterInput = new GraphQLInputObjectType({
    name: 'ComparisonFilterInput',
    fields: {
        field: { type: new GraphQLNonNull(NonSpecialCharactersString) },
        getAllGreaterOrLowerChoice: { type: new GraphQLNonNull(GreaterLowerOption) },
        value: { type: new GraphQLNonNull(AllowedCharactersString) },
    },
});

export { ComparisonFilterInput }