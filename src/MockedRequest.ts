import {
    compareEndpointPaths,
    compareRequestBodies,
    compareQueryParameters,
    checkRequestContainedDesiredHeaders,
    compareHostNames,
    compareProtocols,
    compareRequestMadeStatusAgainstExpectation,
    convertGraphQlRequestBodyToJson,
    throwErrorWithExtraMessageAndFixedStracktrace,
    isGraphQL,
    throwErrorWithFixedStacktrace,
    normaliseRequestHeaderObject,
} from "./utils"
import {
    // eslint-disable-next-line no-unused-vars
    RequestResponseInfo,
} from "./mockRequest"
// eslint-disable-next-line no-unused-vars
import {Contract} from "./types/Contract"
import * as jestExpect from "expect"
// eslint-disable-next-line no-unused-vars
import {NetworkRequestBody, NetworkRequestHeaders} from "./types/generalTypes"
// eslint-disable-next-line no-unused-vars
import {ExpectRequestMadeMatchingInput} from "./types/ExpectRequestMadeMatchingInput"
import {MockedRequestInfo} from "./types/MockedRequestInfo"

export class MockedRequest {
    constructor(
        private requestResponseInfo: RequestResponseInfo,
        private contract: Contract,
        private stacktrace: string
    ) {
        this.requestResponseInfo = requestResponseInfo
        this.contract = contract
        this.stacktrace = stacktrace
    }

    // PUBLIC METHODS **********************************************************
    public expectRequestToHaveBeenMade() {
        this.expectNetworkRequestToHaveBeenMadeFactory(true)
    }

    public expectRequestToNotHaveBeenMade() {
        this.expectNetworkRequestToHaveBeenMadeFactory(false)
    }

    private getUsedRequestHeaders(): NetworkRequestHeaders {
        const headers = this.requestResponseInfo.headers.map || {}
        return normaliseRequestHeaderObject(headers)
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

    public expectRequestMadeMatchingContract(passedInContract?: Contract) {
        const contract = this.getContractForMockedRequest(
            this.stacktrace,
            passedInContract
        )
        this.expectRequestToHaveBeenMade()
        const requestMade = this.requestResponseInfo
        const requestPayload = requestMade.body
        const contractUrlPieces = new URL(contract.request.url)
        const requestMadeUrlPieces = new URL(requestMade.url)

        compareProtocols(
            requestMadeUrlPieces.protocol,
            contractUrlPieces.protocol,
            this.stacktrace
        )
        compareHostNames(
            requestMadeUrlPieces.hostname,
            contractUrlPieces.hostname,
            this.stacktrace
        )
        compareEndpointPaths(
            requestMadeUrlPieces.pathname,
            contractUrlPieces.pathname,
            this.stacktrace
        )
        if (this.isGraphQLRequest()) {
            this.compareGraphQlQueries(
                requestPayload,
                contract,
                this.stacktrace
            )
        } else {
            this.compareRestRequests(requestPayload, requestMade, contract)
        }
    }

    public expectRequestMadeMatching({
        requestPayload,
        requestHeaders,
    }: ExpectRequestMadeMatchingInput) {
        this.expectRequestToHaveBeenMade()
        const requestMade = this.requestResponseInfo
        if (requestPayload) {
            compareRequestBodies(
                requestMade.body,
                requestPayload,
                this.stacktrace
            )
        }
        if (requestHeaders) {
            checkRequestContainedDesiredHeaders(
                requestMade.headers,
                requestHeaders,
                this.stacktrace
            )
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

    private compareGraphQlQueries(
        requestPayload: NetworkRequestBody,
        contract: Contract,
        stacktrace: string
    ) {
        const queryMade = convertGraphQlRequestBodyToJson(requestPayload)
        const queryExpected = convertGraphQlRequestBodyToJson(
            contract.request.payload
        )
        try {
            jestExpect(queryMade).toEqual(queryExpected)
        } catch (error) {
            throwErrorWithExtraMessageAndFixedStracktrace(
                "It looks like the query that has been made doesn't match the expectations from the contract.",
                error,
                stacktrace
            )
        }
    }

    private compareRestRequests(
        requestPayload: NetworkRequestBody,
        requestMade: RequestResponseInfo,
        contract: Contract
    ) {
        compareRequestBodies(
            requestPayload,
            contract.request.payload,
            this.stacktrace
        )
        const contractUrlPieces = new URL(contract.request.url)
        const requestMadeUrlPieces = new URL(requestMade.url)
        compareQueryParameters(
            requestMadeUrlPieces.search,
            contractUrlPieces.search,
            this.stacktrace
        )
    }

    private wasInvokedWithContractAndAlsoPassed(
        passedInContract: Contract
    ): boolean {
        if (passedInContract && this.contract) {
            return true
        }
        return false
    }

    private wasNeitherInvokedWithContractNorPassed(
        passedInContract: Contract
    ): boolean {
        return !passedInContract && !this.contract
    }

    private getContractForMockedRequest(
        stacktrace: string,
        passedInContract?: Contract
    ): Contract {
        if (this.wasInvokedWithContractAndAlsoPassed(passedInContract)) {
            throwErrorWithFixedStacktrace(
                `You cannot use the method "expectRequestMadeMatchingContract" like this. It looks like this mocked request was created from a contract; in that case, you cannot pass in a contract to expectRequestMadeMatchingContract(). Just call it without any arguments, we will do the rest for you!`,
                stacktrace
            )
        }
        if (this.wasNeitherInvokedWithContractNorPassed(passedInContract)) {
            throwErrorWithFixedStacktrace(
                `You cannot use the method "expectRequestMadeMatchingContract" like this. It looks like this mocked request was not created from a contract - if you don't create a network request from a contract, please pass in a contract into expectRequestMadeMatchingContract() manually so that we know what to assert against.`,
                stacktrace
            )
        }
        return passedInContract || this.contract
    }

    private isGraphQLRequest(): boolean {
        const requestMade = this.requestResponseInfo
        return isGraphQL(requestMade.url)
    }
}
