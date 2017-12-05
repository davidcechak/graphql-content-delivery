import { NonSpecialCharactersString } from "../scalars/NonSpecialCharactersString";
import { GraphQLInputObjectType } from "graphql";
import { AllowedCharactersString } from "../scalars/AllowedCharactersString";

const SystemInputContentType = new GraphQLInputObjectType({
    name: 'SystemInputContentType',
    fields: {
        name: { type: AllowedCharactersString },
        codename: { type: NonSpecialCharactersString },
        // ToDo: date scalar type
        last_modified: { type: NonSpecialCharactersString }
    },
});


export { SystemInputContentType }