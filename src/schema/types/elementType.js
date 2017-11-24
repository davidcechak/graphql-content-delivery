const {
    GraphQLObjectType,
    GraphQLInt,
    GraphQLString,
    GraphQLList,
    GraphQLID,
    GraphQLUnionType
} = require('graphql');

const defaultElementObject = {
    key: { type: GraphQLString },
    type: { type: GraphQLString },
    name: { type: GraphQLString },
};

const resolveToSingleValue = rootData => rootData.value;
const resolveToMultipleValues = rootData => Object.values(rootData.value);

const TextElementType = new GraphQLObjectType({
    name: 'TextElement',
    fields: () => Object.assign(
        defaultElementObject,
        {
            text: {
                type: GraphQLString,
                resolve: rootData => rootData.value,
            }
        },
    )
});

const ModularContentElementType = new GraphQLObjectType({
    name: 'ModularContentElement',
    fields: () => Object.assign(
        defaultElementObject,
        {
            content: {
                type: new GraphQLList(GraphQLString),
                resolve: rootData => Object.values(rootData.value)
            }
        },
    )
});

const AssetType = new GraphQLObjectType({
    name: 'Asset',
    fields: () => Object.assign(
        defaultElementObject,
        {
            size: { type: GraphQLInt },
            description: { type: GraphQLString },
            url: { type: GraphQLString },
        })
});

const AssetElementType = new GraphQLObjectType({
    name: 'AssetElement',
    fields: () => Object.assign(
        defaultElementObject,
        {
            name: { type: GraphQLString },
            assetContent: {
                type: new GraphQLList(AssetType),
                resolve: rootData => Object.values(rootData.value),
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
    fields: () => Object.assign(
        defaultElementObject,
        {
            multiple_choice_value: {
                type: new GraphQLList(MultipleChoiceType),
                resolve: rootData => Object.values(rootData.value),
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
    fields: () => Object.assign(
        defaultElementObject,
        {
            taxonomy_group: { type: GraphQLString },
            taxonomy_value: {
                type: new GraphQLList(TaxonomyType),
                resolve: rootData => Object.values(rootData.value),
            },
        })
});

const UrlSlugElementType = new GraphQLObjectType({
    name: 'UrlSlugElement',
    fields: () => Object.assign(
        defaultElementObject,
        {
            url_slug_value: {
                type: GraphQLString,
                resolve: rootData => rootData.value,
            },
        })
});

const NumberElementType = new GraphQLObjectType({
    name: 'NumberElement',
    fields: () => Object.assign(
        defaultElementObject,
        {
            number_value: {
                type: GraphQLString,
                resolve: rootData => rootData.value,
            },
        })
});

const DateElementType = new GraphQLObjectType({
    name: 'DateElement',
    fields: () => Object.assign(
        defaultElementObject,
        {
            date_value: {
                type: GraphQLString,
                resolve: rootData => rootData.value,
            },
        })
});

const DateTimeElementType = new GraphQLObjectType({
    name: 'DateTimeElement',
    fields: () => Object.assign(
        defaultElementObject,
        {
            dateTime_value: {
                type: GraphQLString,
                resolve: rootData => rootData.value,
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
    fields: () => Object.assign(
        defaultElementObject,
        {
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

export { ElementType };
