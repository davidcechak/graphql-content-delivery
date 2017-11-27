import { AllowedCharactersString } from "../scalars/AllowedCharactersString";
import { GraphQLInputObjectType, GraphQLList } from 'graphql';

const Literal = new GraphQLInputObjectType({
    name: 'Literal',
    fields: () => ({
        id: { type: AllowedCharactersString },
        project_id: { type: AllowedCharactersString },
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

export { Literal }