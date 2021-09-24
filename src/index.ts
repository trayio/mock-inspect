// eslint-disable-next-line no-unused-vars
import {MockedRequest} from "./MockedRequest"
// eslint-disable-next-line no-unused-vars
import {
    // eslint-disable-next-line no-unused-vars
    MockResponseOptions,
} from "./types/MockResponseOptions"
export {MockedRequest} from "./MockedRequest"
import {mockRequestBase} from "./mockRequest"

export const mockRequest = (mockOpts: MockResponseOptions): MockedRequest => {
    return mockRequestBase(mockOpts)
}
export {
    cleanUpNetworkRequestMocking,
    setUpNetworkRequestMocking,
    tearDownNetworkRequestMocking,
} from "./setupAndTeardown"
export {MockResponseOptions} from "./types/MockResponseOptions"
