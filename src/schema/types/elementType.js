const {
    GraphQLObjectType,
    GraphQLInt,
    GraphQLString,
    GraphQLList,
    GraphQLID,
    GraphQLUnionType
} = require('graphql');

const resolveToSingleValue = rootData => rootData.value;
const resolveToMultipleValues = rootData => Object.values(rootData.value);

const TextElementType = new GraphQLObjectType({
    name: 'TextElement',
    fields: () => ({
        key: { type: GraphQLString },
        type: { type: GraphQLString },
        name: { type: GraphQLString },
        text: {
            type: GraphQLString,
            resolve: resolveToSingleValue,
        },
    })
});

const ModularContentElementType = new GraphQLObjectType({
    name: 'ModularContentElement',
    fields: () => ({
        key: { type: GraphQLString },
        type: { type: GraphQLString },
        name: { type: GraphQLString },
        content: {
            type: new GraphQLList(GraphQLString),
            resolve: resolveToMultipleValues
        },
    })
});

const AssetType = new GraphQLObjectType({
    name: 'Asset',
    fields: () => ({
        key: { type: GraphQLString },
        name: { type: GraphQLString },
        type: { type: GraphQLString },
        size: { type: GraphQLInt },
        description: { type: GraphQLString },
        url: { type: GraphQLString },
    })
});

const AssetElementType = new GraphQLObjectType({
    name: 'AssetElement',
    fields: () => ({
        key: { type: GraphQLString },
        type: { type: GraphQLString },
        name: { type: GraphQLString },
        assetContent: {
            type: new GraphQLList(AssetType),
            resolve: resolveToMultipleValues,
        },
    })
});

const MultipleChoiceType = new GraphQLObjectType({
    name: 'MultipleChoice',
    fields: () => ({
        name: { type: GraphQLString },
        codename: { type: GraphQLString },

    })
});

const MultipleChoiceElementType = new GraphQLObjectType({
    name: 'MultipleChoiceElement',
    fields: () => ({
        key: { type: GraphQLString },
        type: { type: GraphQLString },
        name: { type: GraphQLString },
        multiple_choice_value: {
            type: new GraphQLList(MultipleChoiceType),
            resolve: resolveToMultipleValues,
        },
    })
});

const TaxonomyType = new GraphQLObjectType({
    name: 'Taxonomy',
    fields: () => ({
        name: { type: GraphQLString },
        codename: { type: GraphQLString },

    })
});

const TaxonomyElementType = new GraphQLObjectType({
    name: 'TaxonomyElement',
    fields: () => ({
        key: { type: GraphQLString },
        type: { type: GraphQLString },
        name: { type: GraphQLString },
        taxonomy_group: { type: GraphQLString },
        taxonomy_value: {
            type: new GraphQLList(TaxonomyType),
            resolve: resolveToMultipleValues,
        },
    })
});

const UrlSlugElementType = new GraphQLObjectType({
    name: 'UrlSlugElement',
    fields: () => ({
        key: { type: GraphQLString },
        type: { type: GraphQLString },
        name: { type: GraphQLString },
        url_slug_value: {
            type: GraphQLString,
            resolve: resolveToSingleValue,
        },
    })
});

const NumberElementType = new GraphQLObjectType({
    name: 'NumberElement',
    fields: () => ({
        key: { type: GraphQLString },
        type: { type: GraphQLString },
        name: { type: GraphQLString },
        number_value: {
            type: GraphQLString,
            resolve: resolveToSingleValue,
        },
    })
});

const DateElementType = new GraphQLObjectType({
    name: 'DateElement',
    fields: () => ({
        key: { type: GraphQLString },
        type: { type: GraphQLString },
        name: { type: GraphQLString },
        date_value: {
            type: GraphQLString,
            resolve: resolveToSingleValue,
        },
    })
});

const DateTimeElementType = new GraphQLObjectType({
    name: 'DateTimeElement',
    fields: () => ({
        key: { type: GraphQLString },
        type: { type: GraphQLString },
        name: { type: GraphQLString },
        dateTime_value: {
            type: GraphQLString,
            resolve: resolveToSingleValue,
        },
    })
});

const ImageType = new GraphQLObjectType({
    name: 'Image',
    fields: () => ({
        image_id: { type: GraphQLID },
        description: { type: GraphQLString },
        url: { type: GraphQLString },
    })
});

const LinkType = new GraphQLObjectType({
    name: 'Link',
    fields: () => ({
        key: { type: GraphQLID },
        type: { type: GraphQLString },
        codename: { type: GraphQLString },
        url_slug: { type: GraphQLString },
    })
});

const RichTextElementType = new GraphQLObjectType({
    name: 'RichTextElement',
    description: '...',
    fields: () => ({
        key: { type: GraphQLString },
        type: { type: GraphQLString },
        name: { type: GraphQLString },
        // ToDO: Test if images actually works. In DB there are no data with not empty images
        images: {
            type: new GraphQLList(ImageType),
            args: {
                id: { type: GraphQLID },
            },
            // ToDO: Test if resolve works
            resolve: (rootData, args) => {
                if (args.id) {
                    return new Array(rootData.images(args.id));
                }
                return Object.values(rootData.images);
            }
        },

        /*
        ToDO: What is the type of links? In the DB I have found only one example:
        "id": "5e74e393-338f-4357-af18-0e153275a4d2;2f267f28-898d-4e1d-8e6e-c6fc4702e7f1",
         */
        links: {
            type: new GraphQLList(LinkType),
            resolve: rootData => {
                const keys = Object.keys(rootData.links);
                return keys.map(key => (Object.assign({ key: key }, rootData.links[key])));
            }
        },
        modular_content: { type: new GraphQLList(GraphQLString) },
        value: { type: GraphQLString }
    })
});

const ElementType = new GraphQLUnionType({
    name: 'Element',
    description: 'Instead of \'value\' an alias have to be used, because for the field \'value\'' +
    'there are conflicting types in the types of ElementType',

    types: [
        TextElementType,
        AssetElementType,
        ModularContentElementType,
        RichTextElementType,
        DateTimeElementType,
        DateElementType,
        NumberElementType,
        UrlSlugElementType,
        TaxonomyElementType,
        MultipleChoiceElementType
    ],
    resolveType(element) {
        switch (element.type) {
            case 'text': {
                return TextElementType;
            }
            case 'asset': {
                return AssetElementType;
            }
            case 'modular_content': {
                return ModularContentElementType;
            }
            case 'rich_text': {
                return RichTextElementType;
            }
            case 'date_time': {
                return DateTimeElementType;
            }
            case 'date': {
                return DateElementType;
            }
            case 'number': {
                return NumberElementType;
            }
            case 'url_slug': {
                return UrlSlugElementType;
            }
            case 'taxonomy': {
                return TaxonomyElementType;
            }
            case 'multiple_choice': {
                return MultipleChoiceElementType;
            }
        }
    }
});

export {ElementType};
