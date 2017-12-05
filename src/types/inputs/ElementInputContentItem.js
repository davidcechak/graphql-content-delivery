import { GraphQLInputObjectType, GraphQLInt, GraphQLNonNull, GraphQLList, GraphQLString } from 'graphql'
import { AllowedCharactersString } from "../scalars/AllowedCharactersString";
import { OrderOption } from "../scalars/OrderOption";
import { NonSpecialCharactersString } from "../scalars/NonSpecialCharactersString";
import { NameCodenamePair } from "./NameCodenamePair";

/*
    Element key and element type are only known by the user during the runtime.
    This is a non-specific input object with loose input suggestions to cover the issue.
    A flexibility comes in a trade off for probable confusion of the user.
 */
const DESCRIPTION =
    'Query IS ONLY VALID IF one of the arguments "value", "values" or' +
    '"ordering" is given together with "key" argument.\n\n' +
    'A content item element.\n' +
    '"key" have to be specified together with only one of the options below:\n' +
    'argument "value" is expected if the element found under the key has a single value\n' +
    'argument "values" is expected if the element has an array of values\n' +
    'argument "ordering" is expected if the element type is date_time';

const SINGLE_VALUE_TYPES_DESCRIPTION =
    '"key" \n' +
    'argument "value" is expected if the element found under the key has a single value\n' +
    'argument "values" is expected if the element has an array of values\n' +
    'argument "ordering" is expected if the element type is date_time';


const OrderingFilterInput = new GraphQLInputObjectType({
    name: 'OrderingFilterInput',
    description: DESCRIPTION,
    fields: {
        method: { type: OrderOption },
        firstN: { type: GraphQLInt },
    }
});


const UrlSlugContentItemInput = new GraphQLInputObjectType({
    name: 'UrlSlugContentItem',
    description: SINGLE_VALUE_TYPES_DESCRIPTION,
    fields: {
        key: { type: new GraphQLNonNull(NonSpecialCharactersString) },
        name: { type: AllowedCharactersString },
        value: { type: GraphQLString },
    }
});


const TextContentItemInput = new GraphQLInputObjectType({
    name: 'TextContentItem',
    description: SINGLE_VALUE_TYPES_DESCRIPTION,
    fields: {
        key: { type: new GraphQLNonNull(NonSpecialCharactersString) },
        name: { type: AllowedCharactersString },
        value: { type: AllowedCharactersString },
    }
});


const DateContentItemInput = new GraphQLInputObjectType({
    name: 'DateContentItem',
    description: SINGLE_VALUE_TYPES_DESCRIPTION,
    fields: {
        key: { type: new GraphQLNonNull(NonSpecialCharactersString) },
        name: { type: AllowedCharactersString },
        value: { type: AllowedCharactersString },
    }
});


const ModularContentContentItemInput = new GraphQLInputObjectType({
    name: 'ModularContentContentItem',
    fields: {
        key: { type: new GraphQLNonNull(NonSpecialCharactersString) },
        name: { type: AllowedCharactersString },
        value: { type: new GraphQLList(NonSpecialCharactersString) },
    }
});


const NumberElementContentItemInput = new GraphQLInputObjectType({
    name: 'NumberElementContentItem',
    fields: {
        key: { type: new GraphQLNonNull(NonSpecialCharactersString) },
        name: { type: AllowedCharactersString },
        value: { type: GraphQLInt },
    }
});


const TaxonomyContentItemInput = new GraphQLInputObjectType({
    name: 'TaxonomyContentItem',
    fields: {
        key: { type: new GraphQLNonNull(NonSpecialCharactersString) },
        name: { type: AllowedCharactersString },
        value: { type: new GraphQLList(NameCodenamePair) },
        taxonomy_group: { type: AllowedCharactersString },
    }
});


const MultipleChoiceContentItemInput = new GraphQLInputObjectType({
    name: 'MultipleChoiceContentItem',
    fields: {
        key: { type: new GraphQLNonNull(NonSpecialCharactersString) },
        name: { type: AllowedCharactersString },
        value: { type: new GraphQLList(NameCodenamePair) },
    }
});


const AssetValue = new GraphQLInputObjectType({
    name: 'AssetValue',
    fields: {
        name: { type: AllowedCharactersString },
        type: { type: AllowedCharactersString },
        size: { type: GraphQLInt },
        description: { type: AllowedCharactersString },
        url: { type: GraphQLString },
    }
});


const AssetContentItemInput = new GraphQLInputObjectType({
    name: 'AssetContentItem',
    fields: {
        key: { type: new GraphQLNonNull(NonSpecialCharactersString) },
        name: { type: AllowedCharactersString },
        value: { type: new GraphQLList(AssetValue) },
    }
});


const RichTextImage = new GraphQLInputObjectType({
    name: 'RichTextImage',
    fields: {
        /*
            Even though key and image_id are the same for images, their are not for links.
            The key is included for consistency which leads to easier processing
        */
        key: { type: new GraphQLNonNull(NonSpecialCharactersString) },
        image_id: { type: NonSpecialCharactersString },
        description: { type: GraphQLString },
        url: { type: GraphQLString }
    }
});


const RichTextLink = new GraphQLInputObjectType({
    name: 'RichTextLink',
    fields: {
        key: { type: new GraphQLNonNull(NonSpecialCharactersString) },
        codename: { type: NonSpecialCharactersString },
        type: { type: NonSpecialCharactersString },
        url_slug: { type: GraphQLString }
    }
});


const RichTextContentItemInput = new GraphQLInputObjectType({
    name: 'RichTextContentItem',
    fields: {
        key: { type: new GraphQLNonNull(NonSpecialCharactersString) },
        name: { type: AllowedCharactersString },
        images: { type: new GraphQLList(RichTextImage) },
        links: { type: new GraphQLList(RichTextLink) },
        modular_content: { type: new GraphQLList(NonSpecialCharactersString) },
        value: { type: GraphQLString },
    }
});


const ElementInputContentItem = new GraphQLInputObjectType({
    name: 'ElementInputContentItem',
    fields: {
        text: { type: TextContentItemInput },
        url_slug: { type: UrlSlugContentItemInput },
        date: { type: DateContentItemInput },
        number: { type: NumberElementContentItemInput },
        modular_content: { type: ModularContentContentItemInput },
        taxonomy: {type: TaxonomyContentItemInput},
        multiple_choice: {type: MultipleChoiceContentItemInput},
        asset: {type: AssetContentItemInput},
        rich_text: {type: RichTextContentItemInput},
    }
});

export { ElementInputContentItem }