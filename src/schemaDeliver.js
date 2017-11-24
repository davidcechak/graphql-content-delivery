import { getItemMemoized, getProjectItemsMemoized } from "./dbCommunication";

const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLInt,
    GraphQLString,
    GraphQLList,
    GraphQLUnionType,
    GraphQLID
} = require('graphql');


const TextElementType = new GraphQLObjectType({
    name: 'TextElement',
    description: '...',
    fields: () => ({
        type: { type: GraphQLString },
        name: { type: GraphQLString },
        text: {
            type: GraphQLString,
            resolve: rootData => rootData.value,
        },
    })
});

const ModularContentElementType = new GraphQLObjectType({
    name: 'ModularContentElement',
    fields: () => ({
        type: { type: GraphQLString },
        name: { type: GraphQLString },
        content: {
            type: new GraphQLList(GraphQLString),
            resolve: rootData => Object.values(rootData.value)
        },
    })
});

const AssetType = new GraphQLObjectType({
    name: 'Asset',
    fields: () => ({
        name: { type: GraphQLString },
        type: { type: GraphQLString },
        size: { type: GraphQLInt },
        description: { type: GraphQLString },
        url: { type: GraphQLString },
    })
});

const AssetElementType = new GraphQLObjectType({
    name: 'AssetElement',
    description: '...',
    fields: () => ({
        type: { type: GraphQLString },
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
    fields: () => ({
        type: { type: GraphQLString },
        name: { type: GraphQLString },
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
    fields: () => ({
        type: { type: GraphQLString },
        name: { type: GraphQLString },
        taxonomy_group: { type: GraphQLString },
        taxonomy_value: {
            type: new GraphQLList(TaxonomyType),
            resolve: rootData => Object.values(rootData.value),
        },
    })
});

const UrlSlugElementType = new GraphQLObjectType({
    name: 'UrlSlugElement',
    fields: () => ({
        type: { type: GraphQLString },
        name: { type: GraphQLString },
        url_slug_value: {
            type: GraphQLString,
            resolve: rootData => rootData.value,
        },
    })
});

const NumberElementType = new GraphQLObjectType({
    name: 'NumberElement',
    fields: () => ({
        type: { type: GraphQLString },
        name: { type: GraphQLString },
        number_value: {
            type: GraphQLString,
            resolve: rootData => rootData.value,
        },
    })
});

const DateElementType = new GraphQLObjectType({
    name: 'DateElement',
    fields: () => ({
        type: { type: GraphQLString },
        name: { type: GraphQLString },
        date_value: {
            type: GraphQLString,
            resolve: rootData => rootData.value,
        },
    })
});

const DateTimeElementType = new GraphQLObjectType({
    name: 'DateTimeElement',
    fields: () => ({
        type: { type: GraphQLString },
        name: { type: GraphQLString },
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
    description: '...',
    fields: () => ({
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

const SystemType = new GraphQLObjectType({
    name: 'System',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        codename: { type: GraphQLString },
        language: { type: GraphQLString },
        type: { type: GraphQLString },
        sitemap_locations: { type: new GraphQLList(GraphQLString) },
        last_modified: { type: GraphQLString },
    })
});

const SystemMetadataType = new GraphQLObjectType({
    name: 'SystemMetadata',
    fields: () => ({
        sitemap_locations: { type: new GraphQLList(GraphQLString) },
    })
});

const ElementMetadataType = new GraphQLObjectType({
    name: 'ElementsMetadata',
    fields: () => ({
        key: { type: GraphQLString },
        value: { type: new GraphQLList(GraphQLString) },
    })
});

const SearchMetadataType = new GraphQLObjectType({
    name: 'SearchMetadata',
    fields: () => ({
        system: {
            type: SystemMetadataType,
            resolve: rootData => rootData.system
        },
        elements: {
            type: new GraphQLList(ElementMetadataType),
            resolve: rootData => {
                const keys = Object.keys(rootData.elements);
                return keys.map(key => (Object.assign({ key: key }, rootData.elements[key])));
            }
        }
    })
});

const ContentItemType = new GraphQLObjectType({
    name: 'ContentItem',
    description: '...',
    fields: () => ({
        id: { type: GraphQLID },
        project_id: { type: GraphQLID },

        // ToDo: Is GraphQLID only for the primary key of the record or for every ID property (e.g. foreign key)?
        language_id: { type: GraphQLString },
        compatible_languages: { type: new GraphQLList(GraphQLString) },
        elements: {
            type: new GraphQLList(ElementType),
            resolve: rootData => Object.values(rootData.elements)
        },
        system: {
            type: SystemType,
            resolve: rootData => rootData.system
        },
        dependencies: { type: new GraphQLList(GraphQLString) },
        search_metadata: { type: SearchMetadataType },

        // Properties with underscore are important for database or communication with it.
        // There is no use of them for the client.
        _rid: { type: GraphQLString },
        _self: { type: GraphQLString },
        _etag: { type: GraphQLString },
        _attachments: { type: GraphQLString },
        _ts: { type: GraphQLInt },
    })
});

module.exports = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'Query',
        description: '...',
        fields: () => ({
            item: {
                type: ContentItemType,
                args: {
                    id: { type: GraphQLID },
                },
                // root - is parent data (if it is a nested structure)
                resolve: (root, args) => getItemMemoized(args.id).then(response => response)
            },
            projectItems: {
                type: new GraphQLList(ContentItemType),
                args: {
                    project_id: { type: GraphQLID },
                    language_id: { type: GraphQLID },
                },
                resolve: (root, args) => getProjectItemsMemoized(args.project_id, args.language_id).then(response => response),
            }
        })
    })
});


const preprocessItemForSchema = (item) => {
    const elementsArray = Object.values(item.elements);
    console.log(elementsArray);
    // For the unification of item.elements[x].value type. It could be an array of strings or a string
    const itemElements = elementsArray.map(x => {
        console.log(x);
        x.value = x.value instanceof Array ? x.value : [x.value];
        console.log(x);
    });
    return Object.assign(item, ({ elements: { itemElements } }));
};