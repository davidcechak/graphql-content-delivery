import { GraphQLInputObjectType, GraphQLInt, GraphQLNonNull, GraphQLList, GraphQLString } from 'graphql'
import { AllowedCharactersString } from "../scalars/AllowedCharactersString";
import { OrderOption } from "../scalars/OrderOption";
import { NonSpecialCharactersString } from "../scalars/NonSpecialCharactersString";

/*
    Element key and element type are only known by the user during the runtime.
    This is a non-specific input object with loose input suggestions to cover the issue.
    A flexibility comes in a trade off for possible confusion of the user.
 */


const UrlSlugInput = new GraphQLInputObjectType({
    name: 'UrlSlug',
    fields: {
        key: { type: new GraphQLNonNull(NonSpecialCharactersString) },
        name: { type: AllowedCharactersString },
    }
});


const TextInput = new GraphQLInputObjectType({
    name: 'Text',
    fields: {
        key: { type: new GraphQLNonNull(NonSpecialCharactersString) },
        name: { type: AllowedCharactersString },
    }
});


const DateInput = new GraphQLInputObjectType({
    name: 'Date',
    fields: {
        key: { type: new GraphQLNonNull(NonSpecialCharactersString) },
        name: { type: AllowedCharactersString },
    }
});


const ModularContentInput = new GraphQLInputObjectType({
    name: 'ModularContentInput',
    fields: {
        key: { type: new GraphQLNonNull(NonSpecialCharactersString) },
        name: { type: AllowedCharactersString },
    }
});


const NumberElementInput = new GraphQLInputObjectType({
    name: 'NumberElementInput',
    fields: {
        key: { type: new GraphQLNonNull(NonSpecialCharactersString) },
        name: { type: AllowedCharactersString },
    }
});


const NameCodenamePair = new GraphQLInputObjectType({
    name: 'NameCodenamePair',
    fields: {
        name: { type: AllowedCharactersString },
        codename: { type: AllowedCharactersString },
    }
});


const TaxonomyInput = new GraphQLInputObjectType({
    name: 'TaxonomyInput',
    fields: {
        key: { type: new GraphQLNonNull(NonSpecialCharactersString) },
        name: { type: AllowedCharactersString },
        taxonomy_group: { type: AllowedCharactersString },
    }
});


const MultipleChoiceInput = new GraphQLInputObjectType({
    name: 'MultipleChoiceInput',
    fields: {
        key: { type: new GraphQLNonNull(NonSpecialCharactersString) },
        name: { type: AllowedCharactersString },
        options: { type: new GraphQLList(NameCodenamePair) },
    }
});


const AssetInput = new GraphQLInputObjectType({
    name: 'AssetInput',
    fields: {
        key: { type: new GraphQLNonNull(NonSpecialCharactersString) },
        name: { type: AllowedCharactersString },
    }
});


const RichTextInput = new GraphQLInputObjectType({
    name: 'RichTextInput',
    fields: {
        key: { type: new GraphQLNonNull(NonSpecialCharactersString) },
        name: { type: AllowedCharactersString },
    }
});


const ElementInputContentType = new GraphQLInputObjectType({
    name: 'ElementInputContentType',
    fields: {
        text: { type: TextInput },
        url_slug: { type: UrlSlugInput },
        date: { type: DateInput },
        number: { type: NumberElementInput },
        modular_content: { type: ModularContentInput },
        taxonomy: {type: TaxonomyInput},
        multiple_choice: {type: MultipleChoiceInput},
        asset: {type: AssetInput},
        rich_text: {type: RichTextInput},
    }
});

export { ElementInputContentType }