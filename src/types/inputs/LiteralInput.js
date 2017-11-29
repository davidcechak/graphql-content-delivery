import { AllowedCharactersString } from "../scalars/AllowedCharactersString";
import { GraphQLInputObjectType, GraphQLList, GraphQLNonNull } from 'graphql';

const LiteralInput = new GraphQLInputObjectType({
    name: 'LiteralInput',
    fields: () => ({
        id: { type: AllowedCharactersString },
        project_id: { type: new GraphQLNonNull(AllowedCharactersString) },
        language_id: { type: AllowedCharactersString },
        compatible_languages: { type: new GraphQLList(AllowedCharactersString) },
        systemId: { type: AllowedCharactersString },
        systemName: { type: AllowedCharactersString },
        systemCodename: { type: AllowedCharactersString },
        systemLanguage: { type: AllowedCharactersString },
        systemType: { type: AllowedCharactersString },
        systemSitemap_locations: { type: new GraphQLList(AllowedCharactersString) },
        systemLast_modified: { type: AllowedCharactersString },
    })
});

export { LiteralInput }