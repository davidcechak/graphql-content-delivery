import {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLInt,
    GraphQLList,
    GraphQLUnionType
} from 'graphql';


const GeneralContentTypeElement = new GraphQLObjectType({
    name: 'GeneralContentTypeElement',
    fields: () => ({
        key: { type: GraphQLString },
        type: { type: GraphQLString },
        name: { type: GraphQLString }
    })
});

const MultipleChoiceOption = new GraphQLObjectType({
    name: 'MultipleChoiceOption',
    fields: () => ({
        key: { type: GraphQLString },
        name: { type: GraphQLString },
        codename: { type: GraphQLString },
    })
});

const MultipleChoiceContentTypeElement = new GraphQLObjectType({
    name: 'MultipleChoiceContentTypeElement',
    fields: () => ({
        key: { type: GraphQLString },
        type: { type: GraphQLString },
        name: { type: GraphQLString },
        options: {
            type: new GraphQLList(MultipleChoiceOption),
            resolve: rootData => {
                const keys = Object.keys(rootData.options);
                return keys.map(key => (Object.assign({ key: key }, rootData.options[key])))
            },
        }
    })
});

const TaxonomyContentTypeElement = new GraphQLObjectType({
    name: 'TaxonomyContentTypeElement',
    fields: () => ({
        name: { type: GraphQLString },
        codename: { type: GraphQLString },
        taxonomy_group: { type: GraphQLString }
    })
});

const ContentTypeElement = new GraphQLUnionType({
    name: 'ContentTypeElement',
    types: [
        MultipleChoiceContentTypeElement,
        TaxonomyContentTypeElement,
        GeneralContentTypeElement,
    ],
    resolveType(element) {
        switch (element.type) {
            case 'multiple_choice': {
                return MultipleChoiceContentTypeElement;
            }
            case 'taxonomy': {
                return TaxonomyContentTypeElement;
            }
            default: {
                return GeneralContentTypeElement;
            }
        }
    }
});

const SystemContentType = new GraphQLObjectType({
    name: 'SystemContentType',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        codename: { type: GraphQLString },
        last_modified: { type: GraphQLString },
    })
});

const ContentType = new GraphQLObjectType({
    name: 'ContentType',
    fields: () => ({
        id: { type: GraphQLID },
        project_id: { type: GraphQLID },
        object_type: { type: GraphQLString },

        elements: {
            type: new GraphQLList(ContentTypeElement),
            resolve: rootData => {
                const keys = Object.keys(rootData.elements);
                return keys.map(key => (Object.assign({ key: key }, rootData.elements[key])))
            },
        },
        system: {
            type: SystemContentType,
            resolve: rootData => rootData.system
        },
        dependencies: { type: new GraphQLList(GraphQLString) },

        // Properties with underscore are important for database or communication with it.
        // There is no use of them for the client.
        _rid: { type: GraphQLString },
        _self: { type: GraphQLString },
        _etag: { type: GraphQLString },
        _attachments: { type: GraphQLString },
        _ts: { type: GraphQLInt },
    })
});

export { ContentType }