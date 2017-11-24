import { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLInt, GraphQLList } from 'graphql';
import {SystemType} from './systemType';
import {ElementType} from './elementType';
import {SearchMetadataType} from './searchMetaDataType';

const ContentItemType = new GraphQLObjectType({
    name: 'ContentItem',
    fields: () => ({
        id: { type: GraphQLID },
        project_id: { type: GraphQLID },

        // ToDo: Is GraphQLID only for the primary key of the record or for every ID property (e.g. foreign key)?
        language_id: { type: GraphQLString },
        compatible_languages: { type: new GraphQLList(GraphQLString) },
        elements: {
            type: new GraphQLList(ElementType),
            resolve: rootData => {
                const keys = Object.keys(rootData.elements);
                return keys.map(key => (Object.assign({ key: key }, rootData.elements[key])))},
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

export { ContentItemType }