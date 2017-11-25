import { ContentItem } from './types/contentItem/ContentItem';
import { ContentType } from "./types/contentType/ContentType";
import {
    getContentItemMemoized,
    getContentTypeMemoized,
    getProjectItemsMemoized
} from '../dbCommunication';
import {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLList,
    GraphQLID
} from 'graphql';

const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'Query',
        fields: () => ({
            contentItem: {
                type: ContentItem,
                args: {
                    id: { type: GraphQLID },
                },
                // root - is parent data (if it is a nested structure)
                resolve: (root, args) => getContentItemMemoized(args.id).then(response => response),
            },
            projectContentItems: {
                type: new GraphQLList(ContentItem),
                args: {
                    project_id: { type: GraphQLID },
                    language_id: { type: GraphQLID },
                },
                resolve: (root, args) => getProjectItemsMemoized(args.project_id, args.language_id).then(response => response),
            },
            contentType: {
                type: ContentType,
                args: {
                    id: { type: GraphQLID },
                },
                resolve: (root, args) => getContentTypeMemoized(args.id).then(response => response),
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

export { schema }