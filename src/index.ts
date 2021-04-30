// eslint-disable-next-line no-unused-vars
import {MockedRequest} from "./MockedRequest"
// eslint-disable-next-line no-unused-vars
import {
    // eslint-disable-next-line no-unused-vars
    MockResponseOptions,
} from "./types/MockResponseOptions"
// eslint-disable-next-line no-unused-vars
import {Example} from "./types/Example"
export {MockedRequest} from "./MockedRequest"
import {mockRequestBase} from "./mockRequest"
import {generateStacktraceWithoutMockedRequestInfo} from "./utils"

export const mockRequest = (mockOpts: MockResponseOptions): MockedRequest => {
    const stacktrace = generateStacktraceWithoutMockedRequestInfo()
    return mockRequestBase({mockOpts, stacktrace})
}

export const mockRequestFromExample = (example: Example): MockedRequest => {
    const stacktrace = generateStacktraceWithoutMockedRequestInfo()
    return mockRequestBase({
        mockOpts: {
            requestPattern: example.request.url,
            responseStatus: example.response.statusCode,
            responseBody: example.response.body,
            requestMethod: example.request.method,
            responseHeaders: example.response.headers,
        },
        stacktrace,
    })
}

export {
    cleanUpNetworkRequestMocking,
    setUpNetworkRequestMocking,
    tearDownNetworkRequestMocking,
} from "./setupAndTeardown"
export {MockResponseOptions} from "./types/MockResponseOptions"
