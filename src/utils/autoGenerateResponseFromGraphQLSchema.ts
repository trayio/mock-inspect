import {makeExecutableSchema, addMocksToSchema, MockList} from "graphql-tools"
import {
    graphqlSync,
    // eslint-disable-next-line no-unused-vars
    GraphQLSchema,
} from "graphql"
import * as uuidReadable from "uuid-readable"
// eslint-disable-next-line no-unused-vars
import {JsonObject} from "../types/generalTypes"
import {
    // eslint-disable-next-line no-unused-vars
    GraphQLAutoMockingCustomTypes,
    // eslint-disable-next-line no-unused-vars
    GraphQLAutoMockingFixedArrayLengths,
} from "../types/MockResponseOptions"

interface FixedArrayLengthDirectives {
    [typeName: string]: () => {
        [propertyName: string]: () => MockList
    }
}

const getFixedArrayLengthMocks = (
    fixedArrayLengths: GraphQLAutoMockingFixedArrayLengths
): FixedArrayLengthDirectives => {
    const arrayLengthDirectiveObjects: {
        [typeName: string]: {
            [propertyName: string]: () => MockList
        }
    } = {}
    fixedArrayLengths &&
        Object.keys(fixedArrayLengths).forEach((typeDotProperty) => {
            const fixedLength = fixedArrayLengths[typeDotProperty]
            const [type, property] = typeDotProperty.split(".")
            if (!property) {
                throw new Error(
                    'We have been unable to pass the settings you put into `graphQLAutoMocking.fixedArrayLengths`. The object key needs to be a string of format "type.property", i.e. "User.posts".'
                )
            }
            if (!arrayLengthDirectiveObjects[type]) {
                arrayLengthDirectiveObjects[type] = {
                    [property]: () => new MockList(fixedLength),
                }
            } else {
                arrayLengthDirectiveObjects[type] = {
                    ...arrayLengthDirectiveObjects[type],
                    [property]: () => new MockList(fixedLength),
                }
            }
        })
    const fixedArrayLengthDirectives = {}
    Object.keys(arrayLengthDirectiveObjects).forEach((type) => {
        fixedArrayLengthDirectives[type] = () =>
            arrayLengthDirectiveObjects[type]
    })
    return fixedArrayLengthDirectives
}

const generateSchemaWithMocks = ({
    stringSchema,
    customTypes,
    fixedArrayLengths,
}: {
    stringSchema: string
    customTypes?: GraphQLAutoMockingCustomTypes
    fixedArrayLengths?: GraphQLAutoMockingFixedArrayLengths
}): GraphQLSchema => {
    const executableSchema = makeExecutableSchema({typeDefs: stringSchema})
    const fixedArrayLengthMocks = getFixedArrayLengthMocks(fixedArrayLengths)
    return addMocksToSchema({
        schema: executableSchema,
        mocks: {
            String: () => uuidReadable.generate(),
            ...customTypes,
            ...fixedArrayLengthMocks,
        },
    })
}

export const autoGenerateResponseFromGraphQLSchema = ({
    stringSchema,
    query,
    variables,
    customTypes,
    fixedArrayLengths,
}: {
    stringSchema: string
    query: string
    variables?: JsonObject
    customTypes?: GraphQLAutoMockingCustomTypes
    fixedArrayLengths?: GraphQLAutoMockingFixedArrayLengths
}): JsonObject => {
    const schemaWithMocks = generateSchemaWithMocks({
        stringSchema,
        customTypes,
        fixedArrayLengths,
    })
    const {data, errors} = graphqlSync(
        schemaWithMocks,
        query,
        undefined,
        undefined,
        variables
    )
    if (errors) {
        const unknownTypeErrors = []
        errors.forEach((err) => {
            const isErrorDueToMockNotDefined = /no mock defined for type/i.test(
                err.message
            )
            if (isErrorDueToMockNotDefined) {
                unknownTypeErrors.push(err)
            }
        })
        if (unknownTypeErrors.length > 0) {
            const errMsg = `There has been a problem on trying to auto-generate a graphQL response for your query matching your schema (see below). This is most likely due to your schema having some custom types which we don't know about yet. You can define what value we should auto-generate for these custom types by populating the object \`graphQLAutoMocking.customTypes\`.\n${errors}`
            throw new Error(errMsg)
        }
        return {data, errors}
    }
    return {data, errors}
}
