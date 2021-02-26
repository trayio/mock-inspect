import {
    // eslint-disable-next-line no-unused-vars
    GraphQLAutoMockingCustomTypes,
    // eslint-disable-next-line no-unused-vars
    GraphQLAutoMockingFixedArrayLengths,
} from "./MockResponseOptions"

export interface GraphQLAutoMockStartupOptions {
    /**
     * The path to which the graphQL API is bound.
     */
    requestPattern: string
    /**
     * The string schema of the graphQL API.
     */
    graphQLSchema: string
    /**
     * Optional override to introduce custom scalar types - see property `customTypes`
     * on the mockRequest options for more info.
     */
    customTypes?: GraphQLAutoMockingCustomTypes
    /**
     * Optional setting to determine a fixed length or range for auto-generated
     * graphQL responses. See property `fixedArrayLengths` on the mockRequest
     * options for more info.
     */
    fixedArrayLengths?: GraphQLAutoMockingFixedArrayLengths
}
