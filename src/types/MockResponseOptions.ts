// eslint-disable-next-line no-unused-vars
import {HttpMethod, NetworkRequestHeaders} from "./generalTypes"

export type Pattern = string | RegExp
export interface GraphQLAutoMockingCustomTypes {
    [typeName: string]: () => any
}

export type NumberTuple = [number, number]

export interface GraphQLAutoMockingFixedArrayLengths {
    [typeNameDotItem: string]: number | NumberTuple
}

export interface MockResponseOptions {
    /**
     * The URL of the network request you want to mock. String or Regular
     * Expression. When mocking graphQL requests, you can leave out this
     * property; in that case we would simply apply the mock to any graphQL
     * request matching the query or mutation name, no matter to which URL. But
     * you can still pass the requestPattern also with graphQL, that way we
     * would bind the mock responses only to the specific pattern given - useful
     * if your test needs to ping two different graphQL APIs. Optional.
     */
    requestPattern?: Pattern
    /**
     * If you are mocking a graphQL query, enter the query name. If neither
     * `graphQLQueryName` nor `graphQLMutationName` are present, we will assume
     * you are mocking a REST API. Optional.
     */
    graphQLQueryName?: string
    /**
     * If you are mocking a graphQL mutation, enter the mutation name. If
     * neither `graphQLQueryName` nor `graphQLMutationName` are present, we will
     * assume you are mocking a REST API. Optional.
     */
    graphQLMutationName?: string
    /**
     * That status code that the mocked response should return. Number type.
     * Defaults to 200. Optional.
     */
    responseStatus?: number
    /**
     * The response body that the mocked response should return. String or
     * JavaScript object type. Empty by default. Optional.
     */
    responseBody?: any
    /**
     * The HTTP method of the network request you want to mock. String type.
     * Defaults to "GET". Optional.
     */
    requestMethod?: HttpMethod
    /**
     * The headers the mocked response should return. Object type, key-value
     * pairs of header name and header value. Empty by default. Optional.
     */
    responseHeaders?: NetworkRequestHeaders
    /**
     * By default, the mocks you set up only last for one request and the response
     * handler gets cleared after the request has been made. If this flag is
     * passed as "true", the response handler will stay persistent _throughtout
     * the remainder of your test_, **not** your entire test suite. Optional.
     */
    persistent?: boolean
    graphQLAutoMocking?: {
        /**
         * If you are mocking a graphQL request, you can provide a graphQL
         * schema that should match the query your network request will make. If
         * given, we will generate an automatic response - that way you can
         * avoid having to pass the `responseBody` option. If you pass a schema
         * *and* the `responseBody` property, we will use your custom response
         * instead. Required if you want to use auto mocking.
         */
        schema: string
        /**
         * An object with overrides for graphQL types, also a place to introduce
         * custom scalar types. Use as a key name the name of the graphQL type
         * and as value a function returning whatever value you want the mock to
         * return. Optional.
         */
        customTypes?: GraphQLAutoMockingCustomTypes
        /**
         * This setting can be used if you want to have a graphQL response
         * auto-generated that includes arrays and if you want to have a fixed
         * length for certain arrays. The object key will be "type.property" and
         * the object value will be the number of fixed length.
         * An example - Consider the following graphQL type:
         *     type Query {
         *       hello: String
         *       me: User
         *       users: [User]
         *       user(name: String!): User
         *     }
         * If we want that the "users" array should always have a length of 5,
         * then we would pass into `fixedArrayLengths`:   { "Query.users": 5 }
         * You could also request an optional range, i.e. to always receive an
         * array of length between 5 and 9:          { "Query.users": [5, 9] }
         * Optional.
         */
        fixedArrayLengths?: GraphQLAutoMockingFixedArrayLengths
    }
}
