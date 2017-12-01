import { GraphQLInputObjectType, GraphQLInt, GraphQLNonNull, GraphQLList, GraphQLString } from 'graphql'
import { AllowedCharactersString } from "../scalars/AllowedCharactersString";
import { OrderOption } from "../scalars/OrderOption";
import { NonSpecialCharactersString } from "../scalars/NonSpecialCharactersString";

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


const UrlSlugInput = new GraphQLInputObjectType({
    name: 'UrlSlug',
    description: SINGLE_VALUE_TYPES_DESCRIPTION,
    fields: {
        key: { type: new GraphQLNonNull(NonSpecialCharactersString) },
        name: { type: AllowedCharactersString },
        value: { type: GraphQLString },
        ordering: { type: OrderingFilterInput }
    }
});


const TextInput = new GraphQLInputObjectType({
    name: 'Text',
    description: SINGLE_VALUE_TYPES_DESCRIPTION,
    fields: {
        key: { type: new GraphQLNonNull(NonSpecialCharactersString) },
        name: { type: AllowedCharactersString },
        value: { type: AllowedCharactersString },
        ordering: { type: OrderingFilterInput }
    }
});


const DateInput = new GraphQLInputObjectType({
    name: 'Date',
    description: SINGLE_VALUE_TYPES_DESCRIPTION,
    fields: {
        key: { type: new GraphQLNonNull(NonSpecialCharactersString) },
        name: { type: AllowedCharactersString },
        value: { type: AllowedCharactersString },
        ordering: { type: OrderingFilterInput }
    }
});


const ModularContentInput = new GraphQLInputObjectType({
    name: 'ModularContentInput',
    fields: {
        key: { type: new GraphQLNonNull(NonSpecialCharactersString) },
        name: { type: AllowedCharactersString },
        value: { type: new GraphQLList(NonSpecialCharactersString) },
    }
});


const NumberElementInput = new GraphQLInputObjectType({
    name: 'NumberElementInput',
    fields: {
        key: { type: new GraphQLNonNull(NonSpecialCharactersString) },
        name: { type: AllowedCharactersString },
        value: { type: GraphQLInt },
        ordering: { type: OrderingFilterInput }
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
        value: { type: new GraphQLList(NameCodenamePair) },
        ordering: { type: OrderingFilterInput },
        taxonomy_group: { type: AllowedCharactersString },
    }
});


const MultipleChoiceInput = new GraphQLInputObjectType({
    name: 'MultipleChoiceInput',
    fields: {
        key: { type: new GraphQLNonNull(NonSpecialCharactersString) },
        name: { type: AllowedCharactersString },
        value: { type: new GraphQLList(NameCodenamePair) },
        ordering: { type: OrderingFilterInput },
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


const AssetInput = new GraphQLInputObjectType({
    name: 'AssetInput',
    fields: {
        key: { type: new GraphQLNonNull(NonSpecialCharactersString) },
        name: { type: AllowedCharactersString },
        value: { type: new GraphQLList(AssetValue) },
        ordering: { type: OrderingFilterInput },
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


const RichTextInput = new GraphQLInputObjectType({
    name: 'RichTextInput',
    fields: {
        key: { type: new GraphQLNonNull(NonSpecialCharactersString) },
        name: { type: AllowedCharactersString },
        images: { type: new GraphQLList(RichTextImage) },
        links: { type: new GraphQLList(RichTextLink) },
        modular_content: { type: new GraphQLList(NonSpecialCharactersString) },
        value: { type: GraphQLString },
        ordering: { type: OrderingFilterInput },
    }
});


const ElementsInput = new GraphQLInputObjectType({
    name: 'ElementsInput',
    fields: {
        // ToDo: GIve the option yo order by value OR name
        text: { type: TextInput },
        url_slug: { type: UrlSlugInput },
        date: { type: DateInput },
        number: { type: NumberElementInput },
        modular_content: { type: ModularContentInput },
        taxonomy: {type: TaxonomyInput},
        multiple_choice: {type: MultipleChoiceInput},
        asset: {type: AssetInput},
        rich_text: {type: RichTextInput},


    //rich_text

    }
});

export { ElementsInput }