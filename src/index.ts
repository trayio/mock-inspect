// eslint-disable-next-line no-unused-vars
import {MockedRequest} from "./MockedRequest"
// eslint-disable-next-line no-unused-vars
import {
    // eslint-disable-next-line no-unused-vars
    MockResponseOptions,
} from "./types/MockResponseOptions"
// eslint-disable-next-line no-unused-vars
import {Contract} from "./types/Contract"
export {MockedRequest} from "./MockedRequest"
import {mockRequestBase} from "./mockRequest"
import {generateStacktraceWithoutMockedRequestInfo} from "./utils"

export const mockRequest = (mockOpts: MockResponseOptions): MockedRequest => {
    const stacktrace = generateStacktraceWithoutMockedRequestInfo()
    return mockRequestBase({mockOpts, stacktrace})
}

export const mockRequestFromContract = (contract: Contract): MockedRequest => {
    const stacktrace = generateStacktraceWithoutMockedRequestInfo()
    return mockRequestBase({
        mockOpts: {
            requestPattern: contract.request.url,
            responseStatus: contract.response.statusCode,
            responseBody: contract.response.body,
            requestMethod: contract.request.method,
            responseHeaders: contract.response.headers,
        },
        contract,
        stacktrace,
    })
}

export {
    cleanUpNetworkRequestMocking,
    setUpNetworkRequestMocking,
    tearDownNetworkRequestMocking,
} from "./setupAndTeardown"
export {logMockedRequests} from "./mockRequest"
export {MockResponseOptions} from "./types/MockResponseOptions"
