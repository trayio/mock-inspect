import * as isObject from "lodash.isobject"
// eslint-disable-next-line no-unused-vars
import {JsonObject, NetworkRequestHeaders} from "../types/generalTypes"
// eslint-disable-next-line no-unused-vars
import {RequestResponseInfo} from "../mockRequest"
// eslint-disable-next-line no-unused-vars
import {GraphQLAutoMockStartupOptions} from "../types/GraphQLAutoMockStartupOptions"
import {
    graphql,
    // eslint-disable-next-line no-unused-vars
    GraphQLMockedContext,
    // eslint-disable-next-line no-unused-vars
    GraphQLMockedRequest,
} from "msw"
import {autoGenerateResponseFromGraphQLSchema} from "./autoGenerateResponseFromGraphQLSchema"
import {setResponseBody} from "../responseHandlers/common"
// eslint-disable-next-line no-unused-vars
import {ResponseComposition} from "msw/lib/types/response"

export interface MswUsedRequestHeaders {
    map: NetworkRequestHeaders
}

export interface QueryParameters {
    [parameterName: string]: string | string[]
}

interface RequestHeadersWithArrayValues {
    [headerName: string]: string[] | string
}

export const normaliseRequestHeaderObject = (
    requestHeaders: NetworkRequestHeaders | RequestHeadersWithArrayValues
): NetworkRequestHeaders => {
    const headers = {}
    Object.keys(requestHeaders).forEach((header) => {
        const headerName = header.toLowerCase()
        if (Array.isArray(requestHeaders[header])) {
            headers[headerName] = requestHeaders[header][0]
        } else {
            headers[headerName] = requestHeaders[header] as string
        }
    })
    return headers
}

export const objectHasKeys = (obj: JsonObject): boolean => {
    return isObject(obj) && Object.keys(obj).length > 0
}

const constructRequestMadeStatusErrorMessage = (expectation: boolean) => {
    return `You expected that the request has${
        expectation === false ? " not" : ""
    } been made, but it was${expectation === true ? " not" : ""}.`
}

export const compareRequestMadeStatusAgainstExpectation = (
    hasRequestBeenDone: boolean,
    expectation: boolean
) => {
    if (hasRequestBeenDone !== expectation) {
        throw new Error(constructRequestMadeStatusErrorMessage(expectation))
    }
}

export const updateRequestResponseInfo = ({
    requestResponseInfo,
    body,
    headers,
    url,
    called,
}: {
    requestResponseInfo: RequestResponseInfo
    body: any
    headers: any
    url: string
    called: boolean
}) => {
    requestResponseInfo.body = body
    requestResponseInfo.headers = headers
    requestResponseInfo.url = url
    requestResponseInfo.called = called
}

export const generateMswGraphQLAutoGenerationHandler = ({
    requestPattern,
    graphQLSchema,
    customTypes,
    fixedArrayLengths,
}: GraphQLAutoMockStartupOptions): any => {
    const specificGraphQLAPI = graphql.link(requestPattern)
    return specificGraphQLAPI.operation(
        (
            req: GraphQLMockedRequest,
            res: ResponseComposition,
            // eslint-disable-next-line no-unused-vars
            ctx: GraphQLMockedContext<unknown>
        ) => {
            const autoGeneratedResponse = autoGenerateResponseFromGraphQLSchema(
                {
                    stringSchema: graphQLSchema,
                    query: req.body.query,
                    variables: req.body.variables,
                    customTypes,
                    fixedArrayLengths,
                }
            )
            return res((response) => {
                setResponseBody(response, autoGeneratedResponse)
                response.headers.delete("x-powered-by")
                return response
            })
        }
    )
}
