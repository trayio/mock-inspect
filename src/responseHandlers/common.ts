import * as isObject from "lodash.isobject"
import {
    // eslint-disable-next-line no-unused-vars
    GraphQLMockedRequest,
    // eslint-disable-next-line no-unused-vars
    MockedRequest as MswMockedRequest,
} from "msw/lib/types"
// eslint-disable-next-line no-unused-vars
import {ResponseComposition} from "msw/lib/types/response"
// eslint-disable-next-line no-unused-vars
import {RequestResponseInfo} from "../mockRequest"
// eslint-disable-next-line no-unused-vars
import {NetworkResponseBody} from "../types/generalTypes"
// eslint-disable-next-line no-unused-vars
import {MockResponseOptions} from "../types/MockResponseOptions"
import {updateRequestResponseInfo} from "../utils"

export const setResponseBody = (response, body) => {
    const isResponseJson = isObject(body)
    if (isResponseJson) {
        response.headers.set("content-type", "application/json")
        response.body = JSON.stringify(body)
    } else {
        response.body = body
    }
}

export const setResponseHeaders = (response, mockOpts: MockResponseOptions) => {
    if (mockOpts.responseHeaders) {
        Object.keys(mockOpts.responseHeaders).forEach((headerKey) => {
            response.headers.set(headerKey, mockOpts.responseHeaders[headerKey])
        })
    }
    response.headers.delete("x-powered-by")
}

export const getResponseType = (
    mswResponder: ResponseComposition,
    mockOpts: MockResponseOptions
) => {
    return mockOpts.persistent === true ? mswResponder : mswResponder.once
}

export const makeMswResponseHandler = ({
    mswResponder,
    mockOpts,
    statusCode,
    body,
    requestResponseInfo,
    mswRequest,
}: {
    mswResponder: ResponseComposition
    mswRequest: GraphQLMockedRequest | MswMockedRequest
    requestResponseInfo: RequestResponseInfo
    body: NetworkResponseBody
    statusCode: number
    mockOpts: MockResponseOptions
}) => {
    const responder = getResponseType(mswResponder, mockOpts)
    return responder((response) => {
        response.status = statusCode
        setResponseBody(response, body)
        setResponseHeaders(response, mockOpts)
        updateRequestResponseInfo({
            requestResponseInfo,
            body: mswRequest.body,
            headers: mswRequest.headers,
            url: (mswRequest.url as unknown) as string,
            called: true,
        })
        return response
    })
}
