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
} from "./utils"
import {
    mockedRequests,
    // eslint-disable-next-line no-unused-vars
    MockedRequestInternalEntry,
} from "./mockRequest"
// eslint-disable-next-line no-unused-vars
import {Contract} from "./types/Contract"
import * as jestExpect from "expect"
// eslint-disable-next-line no-unused-vars
import {NetworkRequestBody} from "./types/generalTypes"
// eslint-disable-next-line no-unused-vars
import {ExpectRequestMadeMatchingInput} from "./types/ExpectRequestMadeMatchingInput"

export class MockedRequest {
    constructor(
        private reference: string,
        private contract: Contract,
        private stacktrace: string
    ) {
        this.reference = reference
        this.contract = contract
        this.stacktrace = stacktrace
    }

    // PUBLIC METHODS **********************************************************
    public expectNetworkRequestToHaveBeenMade() {
        this.expectNetworkRequestToHaveBeenMadeFactory(true)
    }

    public expectNetworkRequestToNotHaveBeenMade() {
        this.expectNetworkRequestToHaveBeenMadeFactory(false)
    }

    public expectRequestMadeMatchingContract(passedInContract?: Contract) {
        const contract = this.getContractForMockedRequest(
            this.stacktrace,
            passedInContract
        )
        this.expectNetworkRequestToHaveBeenMade()
        const requestMade = mockedRequests[this.reference]
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
        this.expectNetworkRequestToHaveBeenMade()
        const requestMade = mockedRequests[this.reference]
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
        const hasRequestBeenDone = mockedRequests[this.reference].called
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
        requestMade: MockedRequestInternalEntry,
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

    private getContractForMockedRequest(
        stacktrace: string,
        passedInContract?: Contract
    ): Contract {
        if (passedInContract && this.contract) {
            throwErrorWithFixedStacktrace(
                `You cannot use the method "expectRequestMadeMatchingContract" like this. It looks like this mocked request was created from a contract - in that case, you cannot pass in a contract to expectRequestMadeMatchingContract(). Just call it without any arguments, we will do the rest for you!`,
                stacktrace
            )
        }
        if (!passedInContract && !this.contract) {
            throwErrorWithFixedStacktrace(
                `You cannot use the method "expectRequestMadeMatchingContract" like this. It looks like this mocked request was not created from a contract - if you don't create a network request from a contract, please pass in a contract into expectRequestMadeMatchingContract() manually so that we know what to assert against.`,
                stacktrace
            )
        }
        return passedInContract || this.contract
    }

    private isGraphQLRequest(): boolean {
        const requestMade = mockedRequests[this.reference]
        return isGraphQL(requestMade.url)
    }
}
