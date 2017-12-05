import { GraphQLInputObjectType } from 'graphql';
import { AllowedCharactersString } from "../scalars/AllowedCharactersString";


const NameCodenamePair = new GraphQLInputObjectType({
    name: 'NameCodenamePair',
    fields: {
        name: { type: AllowedCharactersString },
        codename: { type: AllowedCharactersString },
    }
});

export { NameCodenamePair }
