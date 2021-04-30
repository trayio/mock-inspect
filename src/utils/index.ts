import * as jestExpect from "expect"
import * as isObject from "lodash.isobject"
import * as queryStringParser from "query-string"
// eslint-disable-next-line no-unused-vars
import {
    NetworkRequestBody,
    JsonObject,
    NetworkRequestHeaders,
} from "../types/generalTypes"
import {graphQlQueryToJson} from "graphql-query-to-json"
// eslint-disable-next-line no-unused-vars
import {RequestHeadersNormalised} from "../types/ExpectRequestMadeMatchingInput"
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

export const throwErrorWithExtraMessageAndFixedStracktrace = (
    message: string,
    error: Error,
    stacktrace: string
): string => {
    const newError = error
    newError.message = `${message}\n\n${error.message}`
    if (process.env.AVOID_CLIPPED_STACKTRACE !== "true") {
        newError.stack = stacktrace
    }
    throw newError
}

const convertPotentialJsonStringToJsonObject = (
    potentialJsonStringOrObject: string | JsonObject
): string | JsonObject => {
    try {
        if (typeof potentialJsonStringOrObject === "string") {
            return JSON.parse(potentialJsonStringOrObject)
        }
        return potentialJsonStringOrObject
    } catch (error) {
        return potentialJsonStringOrObject
    }
}

export const compareRequestBodies = (
    usedRequestBody: NetworkRequestBody,
    contractRequestBody: NetworkRequestBody,
    stacktrace: string
) => {
    try {
        if (contractRequestBody === undefined) {
            jestExpect(["", undefined]).toContainEqual(usedRequestBody)
        } else {
            jestExpect(
                convertPotentialJsonStringToJsonObject(usedRequestBody)
            ).toEqual(
                convertPotentialJsonStringToJsonObject(contractRequestBody)
            )
        }
    } catch (error) {
        throwErrorWithExtraMessageAndFixedStracktrace(
            `The network request has been made, but the body with which the request was made does not match the expectations.\nRequest body used by your code: ${usedRequestBody}\nExpected request body: ${contractRequestBody}`,
            error,
            stacktrace
        )
    }
}

interface RequestHeadersWithArrayValues {
    [headerName: string]: string[] | string
}

export const normaliseRequestHeaderObject = (
    requestHeaders: NetworkRequestHeaders | RequestHeadersWithArrayValues
): RequestHeadersNormalised => {
    const headers = {}
    Object.keys(requestHeaders).forEach((header) => {
        const headerName = header.toLowerCase()
        if (Array.isArray(requestHeaders[header])) {
            headers[headerName] = requestHeaders[header][0].toLowerCase()
        } else {
            headers[headerName] = (requestHeaders[
                header
            ] as string).toLowerCase()
        }
    })
    return headers
}

export const checkRequestContainedDesiredHeaders = (
    usedRequestHeaders: MswUsedRequestHeaders,
    desiredRequestHeaders: NetworkRequestHeaders,
    stacktrace: string
) => {
    const desiredHeaders = normaliseRequestHeaderObject(desiredRequestHeaders)
    const usedHeaders = normaliseRequestHeaderObject(usedRequestHeaders.map)
    try {
        Object.entries(desiredHeaders).forEach((desiredHeader) => {
            jestExpect(usedHeaders[desiredHeader[0]]).toBe(desiredHeader[1])
        })
    } catch (error) {
        throwErrorWithExtraMessageAndFixedStracktrace(
            `The network request has been made, but the headers with which the request was made don't contain all the headers that were expected.\nExpected headers: ${JSON.stringify(
                desiredHeaders
            )}\nActual headers: ${JSON.stringify(usedHeaders)}`,
            error,
            stacktrace
        )
    }
}

export const compareEndpointPaths = (
    usedUriPath: string,
    contractUriPath: string,
    stacktrace: string
) => {
    try {
        jestExpect(usedUriPath).toEqual(contractUriPath)
    } catch (error) {
        throwErrorWithExtraMessageAndFixedStracktrace(
            `The request path does not match the contracts.\nPath requested by your code: ${usedUriPath}\nExpected path to be called: ${contractUriPath}`,
            error,
            stacktrace
        )
    }
}

const compareTwoSetsOfQueryParameters = (
    usedQueryParams: string,
    contractQueryParams: string,
    stacktrace: string
) => {
    const usedParams = queryStringParser.parse(usedQueryParams)
    const contractParams = queryStringParser.parse(contractQueryParams)
    try {
        jestExpect(usedParams).toEqual(contractParams)
    } catch (error) {
        throwErrorWithExtraMessageAndFixedStracktrace(
            `The query parameters the app used do not match the query parameters expected by the contracts.`,
            error,
            stacktrace
        )
    }
}

const checkThatNoQueryParametersWereUsed = (
    usedQueryParams: string,
    stacktrace: string
) => {
    try {
        jestExpect(usedQueryParams).toEqual("")
    } catch (error) {
        throwErrorWithExtraMessageAndFixedStracktrace(
            `The query parameters the app is using for the request should have been empty.\nApp used query parameters: ${JSON.stringify(
                usedQueryParams
            )}\nExpected query parameters: none`,
            error,
            stacktrace
        )
    }
}

export const compareQueryParameters = (
    usedQueryParams: string,
    contractQueryParams: string | null,
    stacktrace: string
) => {
    if (contractQueryParams === "") {
        checkThatNoQueryParametersWereUsed(usedQueryParams, stacktrace)
    } else {
        compareTwoSetsOfQueryParameters(
            usedQueryParams,
            contractQueryParams,
            stacktrace
        )
    }
}

export const objectHasKeys = (obj: JsonObject): boolean => {
    return isObject(obj) && Object.keys(obj).length > 0
}

export const compareHostNames = (
    usedHostName: string,
    expectedHostName: string,
    stacktrace: string
) => {
    try {
        jestExpect(usedHostName).toEqual(expectedHostName)
    } catch (error) {
        throwErrorWithExtraMessageAndFixedStracktrace(
            `The hostname used in this request doesn't match the expectations`,
            error,
            stacktrace
        )
    }
}

export const compareProtocols = (
    usedProtocol: string,
    expectedProtocol: string,
    stacktrace: string
) => {
    try {
        jestExpect(usedProtocol).toEqual(expectedProtocol)
    } catch (error) {
        throwErrorWithExtraMessageAndFixedStracktrace(
            `The protocol used in this request doesn't match the expectations`,
            error,
            stacktrace
        )
    }
}

const constructRequestMadeStatusErrorMessage = (expectation: boolean) => {
    return `You expected that the request has${
        expectation === false ? " not" : ""
    } been made, but it was${expectation === true ? " not" : ""}.`
}

export const compareRequestMadeStatusAgainstExpectation = (
    hasRequestBeenDone: boolean,
    expectation: boolean,
    stacktrace: string
) => {
    try {
        jestExpect(hasRequestBeenDone).toBe(expectation)
    } catch (error) {
        throwErrorWithFixedStacktrace(
            constructRequestMadeStatusErrorMessage(expectation),
            stacktrace
        )
    }
}

export const convertGraphQlRequestBodyToJson = (
    reqBody: NetworkRequestBody
) => {
    const madeRequestBody =
        typeof reqBody === "string"
            ? JSON.parse(reqBody)
            : (reqBody as JsonObject)
    return objectHasKeys(madeRequestBody.variables)
        ? graphQlQueryToJson(madeRequestBody.query, {
              variables: madeRequestBody.variables,
          })
        : graphQlQueryToJson(madeRequestBody.query)
}

export const isGraphQL = (urlPath: string): boolean => {
    // TODO: This assertion is pretty dumb. While the URI is **usually** /graphql
    // (see https://graphql.org/learn/serving-over-http/#uris-routes), this is
    // not a given. There should be a different way of finding out whether a
    // request is a graphQL request or not.
    return /\/graphql/i.test(urlPath)
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

export const throwErrorWithFixedStacktrace = (
    message: string,
    stacktrace: string
) => {
    const err = Error(message)
    err.stack = stacktrace
    throw err
}

export const generateStacktraceWithoutMockedRequestInfo = () => {
    const stacktrace = new Error().stack
    const lines = stacktrace.split("\n")
    const regexForThisFile = /(dist|src)\/utils\/index\.(js|ts):\d+:\d+/
    const regexForEntryPoint = /(dist|src)\/index\.(js|ts):\d+:\d+/
    const linesWithoutInternals = lines.filter((line) => {
        return !regexForThisFile.test(line) && !regexForEntryPoint.test(line)
    })
    const stacktraceCleaned = linesWithoutInternals.join("\n")
    return stacktraceCleaned
}
