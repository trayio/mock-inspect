import * as isObject from "lodash.isobject"
import {MockedRequest} from "./MockedRequest"
/* eslint-disable no-unused-vars */
import {
    MockResponseOptions,
    ResponseHeadersObject,
} from "./types/MockResponseOptions"
import {NetworkResponseBody, HttpMethod} from "./types/generalTypes"
import {Contract} from "./types/Contract"
/* eslint-enable no-unused-vars */
import {handleGraphQLRequest} from "./responseHandlers/graphql"
import {handleRestRequest} from "./responseHandlers/rest"
export {Contract} from "./types/Contract"
export {MockedRequest} from "./MockedRequest"
// eslint-disable-next-line no-unused-vars
import {MswUsedRequestHeaders} from "./utils"

type InternalRequestInfo = {
    body: any
    headers: any
    path: string
    hostname: string
    protocol: string
}

type InternalResponseInfo = {
    statusCode: number
    body: any
    headers: ResponseHeadersObject
}

export type RequestResponseInfo = {
    request: InternalRequestInfo
    url: string
    called: boolean
    response: InternalResponseInfo
    /**
     * This property is only used for graphQL requests mocking. It should be set
     * to "true" once a request has been used already in terms of graphQL. This
     * is necessary so that we can respond with separate things to the same
     * query.
     */
    graphQLUsed: boolean
    body: NetworkResponseBody
    headers: MswUsedRequestHeaders
}

const createRequestResponseInfo = (
    response: InternalResponseInfo
): RequestResponseInfo => {
    return {
        request: {
            body: undefined,
            headers: {},
            path: "",
            hostname: "",
            protocol: "",
        },
        url: "",
        called: false,
        response,
        graphQLUsed: false,
        body: undefined,
        headers: undefined,
    }
}

const getStatusCode = (mockOpts: MockResponseOptions): number => {
    return mockOpts.responseStatus || 200
}

const getMethod = (mockOpts: MockResponseOptions): HttpMethod => {
    return mockOpts.requestMethod || "GET"
}

const getResponseBody = (
    mockOpts: MockResponseOptions
): NetworkResponseBody => {
    let body
    if (mockOpts.responseBody) {
        body = isObject(mockOpts.responseBody)
            ? JSON.stringify(mockOpts.responseBody)
            : mockOpts.responseBody
    }
    return body
}

const isGraphQLMock = (mockOpts: MockResponseOptions): boolean => {
    let isGraphQL = false
    if (mockOpts.graphQLMutationName || mockOpts.graphQLQueryName) {
        isGraphQL = true
    }
    return isGraphQL
}

const validateMockOptions = (mockOpts: MockResponseOptions): void => {
    if (mockOpts.graphQLMutationName && mockOpts.graphQLQueryName) {
        throw new Error(
            "You passed graphQLMutationName AND graphQLQueryName into the mock options - please pick one, you can't have both."
        )
    }
    if (
        !mockOpts.graphQLMutationName &&
        !mockOpts.graphQLQueryName &&
        !mockOpts.requestPattern
    ) {
        throw new Error(
            "Not enough options passed. When mocking REST requests, we need to know of the `requestPattern` property. When mocking graphQL requests, we need to know of the `graphQLQueryName` OR `graphQLMutationName` property. (With graphQL, you can optionally also pass a requestPattern though to make the mock more specific.)"
        )
    }
}

export const mockRequestBase = ({
    mockOpts,
    stacktrace,
    contract,
}: {
    mockOpts: MockResponseOptions
    stacktrace: string
    contract?: Contract
}): MockedRequest => {
    validateMockOptions(mockOpts)
    const statusCode = getStatusCode(mockOpts)
    const method = getMethod(mockOpts)
    const body = getResponseBody(mockOpts)
    const isGraphQL = isGraphQLMock(mockOpts)

    const requestResponseInfo = createRequestResponseInfo({
        body,
        headers: mockOpts.responseHeaders,
        statusCode,
    })
    if (isGraphQL) {
        handleGraphQLRequest({
            mockOpts,
            body,
            statusCode,
            requestResponseInfo,
        })
    } else {
        handleRestRequest({
            mockOpts,
            method,
            body,
            statusCode,
            requestResponseInfo,
        })
    }

    return new MockedRequest(requestResponseInfo, contract, stacktrace)
}
