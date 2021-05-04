import {
    compareRequestMadeStatusAgainstExpectation,
    normaliseRequestHeaderObject,
} from "./utils"
import {
    // eslint-disable-next-line no-unused-vars
    RequestResponseInfo,
} from "./mockRequest"
// eslint-disable-next-line no-unused-vars
import {Example} from "./types/Example"
// eslint-disable-next-line no-unused-vars
import {NetworkRequestHeaders} from "./types/generalTypes"
import {MockedRequestInfo} from "./types/MockedRequestInfo"

export class MockedRequest {
    constructor(
        private requestResponseInfo: RequestResponseInfo,
        private stacktrace: string
    ) {
        this.requestResponseInfo = requestResponseInfo
        this.stacktrace = stacktrace
    }

    // PUBLIC METHODS **********************************************************
    public expectRequestToHaveBeenMade() {
        this.expectNetworkRequestToHaveBeenMadeFactory(true)
    }

    public expectRequestToNotHaveBeenMade() {
        this.expectNetworkRequestToHaveBeenMadeFactory(false)
    }

    public inspect(): MockedRequestInfo {
        this.expectRequestToHaveBeenMade()
        const requestBody = this.requestResponseInfo.body
        const requestHeaders = this.getUsedRequestHeaders()
        return {
            requestBody,
            requestHeaders,
        }
    }

    // PRIVATE METHODS *********************************************************
    private expectNetworkRequestToHaveBeenMadeFactory(
        expectedToBeMade: boolean
    ) {
        const hasRequestBeenDone = this.requestResponseInfo.called
        compareRequestMadeStatusAgainstExpectation(
            hasRequestBeenDone,
            expectedToBeMade,
            this.stacktrace
        )
    }

    private getUsedRequestHeaders(): NetworkRequestHeaders {
        const headers = this.requestResponseInfo.headers.map || {}
        return normaliseRequestHeaderObject(headers)
    }
}
