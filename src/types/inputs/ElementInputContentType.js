import { GraphQLInputObjectType, GraphQLInt, GraphQLNonNull, GraphQLList, GraphQLString } from 'graphql'
import { AllowedCharactersString } from "../scalars/AllowedCharactersString";
import { OrderOption } from "../scalars/OrderOption";
import { NonSpecialCharactersString } from "../scalars/NonSpecialCharactersString";
import { NameCodenamePair } from "./NameCodenamePair";

/*
    Element key and element type are only known by the user during the runtime.
    This is a non-specific input object with loose input suggestions to cover the issue.
    A flexibility comes in a trade off for possible confusion of the user.
 */


const UrlSlugContentTypeInput = new GraphQLInputObjectType({
    name: 'UrlSlugContentType',
    fields: {
        key: { type: new GraphQLNonNull(NonSpecialCharactersString) },
        name: { type: AllowedCharactersString },
    }
});


const TextContentTypeInput = new GraphQLInputObjectType({
    name: 'TextContentType',
    fields: {
        key: { type: new GraphQLNonNull(NonSpecialCharactersString) },
        name: { type: AllowedCharactersString },
    }
});


const DateContentTypeInput = new GraphQLInputObjectType({
    name: 'DateContentType',
    fields: {
        key: { type: new GraphQLNonNull(NonSpecialCharactersString) },
        name: { type: AllowedCharactersString },
    }
});


const ModularContentContentTypeInput = new GraphQLInputObjectType({
    name: 'ModularContentContentType',
    fields: {
        key: { type: new GraphQLNonNull(NonSpecialCharactersString) },
        name: { type: AllowedCharactersString },
    }
});


const NumberElementContentTypeInput = new GraphQLInputObjectType({
    name: 'NumberElementContentType',
    fields: {
        key: { type: new GraphQLNonNull(NonSpecialCharactersString) },
        name: { type: AllowedCharactersString },
    }
});


const TaxonomyContentTypeInput = new GraphQLInputObjectType({
    name: 'TaxonomyContentType',
    fields: {
        key: { type: new GraphQLNonNull(NonSpecialCharactersString) },
        name: { type: AllowedCharactersString },
        taxonomy_group: { type: AllowedCharactersString },
    }
});


const MultipleChoiceContentTypeInput = new GraphQLInputObjectType({
    name: 'MultipleChoiceContentType',
    fields: {
        key: { type: new GraphQLNonNull(NonSpecialCharactersString) },
        name: { type: AllowedCharactersString },
        options: { type: new GraphQLList(NameCodenamePair) },
    }
});


const AssetContentTypeInput = new GraphQLInputObjectType({
    name: 'AssetContentType',
    fields: {
        key: { type: new GraphQLNonNull(NonSpecialCharactersString) },
        name: { type: AllowedCharactersString },
    }
});


const RichTextContentTypeInput = new GraphQLInputObjectType({
    name: 'RichTextContentType',
    fields: {
        key: { type: new GraphQLNonNull(NonSpecialCharactersString) },
        name: { type: AllowedCharactersString },
    }
});


const ElementInputContentType = new GraphQLInputObjectType({
    name: 'ElementInputContentType',
    fields: {
        text: { type: TextContentTypeInput },
        url_slug: { type: UrlSlugContentTypeInput },
        date: { type: DateContentTypeInput },
        number: { type: NumberElementContentTypeInput },
        modular_content: { type: ModularContentContentTypeInput },
        taxonomy: {type: TaxonomyContentTypeInput},
        multiple_choice: {type: MultipleChoiceContentTypeInput},
        asset: {type: AssetContentTypeInput},
        rich_text: {type: RichTextContentTypeInput},
    }
});

export { ElementInputContentType }