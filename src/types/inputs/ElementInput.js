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
    description: DESCRIPTION,
    fields: {
        key: { type: new GraphQLNonNull(NonSpecialCharactersString) },
        name: { type: AllowedCharactersString },
        value: { type: new GraphQLList(NonSpecialCharactersString) },
    }
});






const NumberElementInput = new GraphQLInputObjectType({
    name: 'NumberElementInput',
    description: DESCRIPTION,
    fields: {
        key: { type: new GraphQLNonNull(NonSpecialCharactersString) },
        name: { type: AllowedCharactersString },
        value: { type: GraphQLInt },
        ordering: { type: OrderingFilterInput }
    }
});


const TaxonomyValueInput = new GraphQLInputObjectType({
    name: 'TaxonomyValueInput',
    description: DESCRIPTION,
    fields: {
        name: { type: AllowedCharactersString },
        codename: { type: AllowedCharactersString },
    }
});


const TaxonomyElementInput = new GraphQLInputObjectType({
    name: 'TaxonomyElementInput',
    description: DESCRIPTION,
    fields: {
        key: { type: new GraphQLNonNull(NonSpecialCharactersString) },
        name: { type: AllowedCharactersString },
        value: { type: new GraphQLList(TaxonomyValueInput) },
        ordering: { type: OrderingFilterInput },
        taxonomy_group: { type: AllowedCharactersString },
    }
});


const ElementsInput = new GraphQLInputObjectType({
    name: 'ElementsInput',
    description: DESCRIPTION,
    fields: {
        // ToDo: GIve the option yo order by value OR name
        text: { type: TextInput },
        url_slug: { type: UrlSlugInput },
        date: { type: DateInput },
        number: { type: NumberElementInput },
        modular_content: { type: ModularContentInput },


    //Array of objects value elements: multiple_choice, asset, taxonomy
    //rich_text

        taxonomyElementInput: {type: TaxonomyElementInput},
    }
});

export { ElementsInput }