import {request} from "./testHelpers/requestHelpers"
// eslint-disable-next-line no-unused-vars
import {Contract} from "../types/Contract"
import * as cloneDeep from "lodash.clonedeep"
import {mockRequest} from ".."

const citiesContract: Contract = {
    response: {
        statusCode: 200,
        body: {
            loginId:
                "c950eae440dc4a8c98d64faea1877c006aa4233e339f45f6b70f26a022adc384",
            lastSeen: 1571840997797,
            castleSignature: "PHKzGCVvZTz2vwBYHou/EPQu1xrMi53GCNDifWDDXgc=",
        },
        headers: {
            date: "Wed, 23 Oct 2019 14:54:59 GMT",
            "content-type": "application/json",
            "content-length": "168",
            connection: "close",
            "x-tray-verification-required": "false",
            "access-control-expose-headers":
                "X-Tray-Verification-Required, X-Tray-Session-Expired",
        },
    },
    request: {
        url: "https://www.google.com/some/cities/here",
        method: "POST",
        headers: {
            accept: "application/json",
            "content-type": "application/json",
            "content-length": 59,
        },
    },
}

const citiesGetRequestMockRequestOptions = {
    requestPattern: /\/cities/,
    requestMethod: "GET",
    responseBody: "Here is your fake response",
}

describe("Contract Helpers", () => {
    it("Can check that a the code made a request matching the contracts", async () => {
        const citiesRequest = mockRequest(citiesGetRequestMockRequestOptions)
        await request({
            uri: "https://www.google.com/some/cities/here",
        })
        citiesRequest.expectRequestMadeMatchingContract(citiesContract)
    })

    it("Errors if you want to call expectRequestMadeMatchingContract() without a contract if the network request mock hasn't been created from a contract either", async () => {
        const citiesRequest = mockRequest(citiesGetRequestMockRequestOptions)
        await request({
            uri: "https://www.google.com/some/cities/here",
        })

        let expectedError
        try {
            citiesRequest.expectRequestMadeMatchingContract()
        } catch (error) {
            expectedError = error
        }
        expect(expectedError.message).toBe(
            `You cannot use the method "expectRequestMadeMatchingContract" like this. It looks like this mocked request was not created from a contract - if you don't create a network request from a contract, please pass in a contract into expectRequestMadeMatchingContract() manually so that we know what to assert against.`
        )
    })

    describe("Matching hostname", () => {
        it("Errors if the hostname that was used didn't match the contract", async () => {
            const citiesRequest = mockRequest(
                citiesGetRequestMockRequestOptions
            )
            await request({
                uri: "https://thisisnotgoogle.com/some/cities/here",
            })

            let expectedError
            try {
                citiesRequest.expectRequestMadeMatchingContract(citiesContract)
            } catch (error) {
                expectedError = error
            }
            expect(expectedError.message).toContain(
                "The hostname used in this request doesn't match the expectations"
            )
        })

        it("Succeeds if the hostname that was used matches the contract", async () => {
            const citiesRequest = mockRequest(
                citiesGetRequestMockRequestOptions
            )
            await request({
                uri: "https://www.google.com/some/cities/here",
            })
            citiesRequest.expectRequestMadeMatchingContract(citiesContract)
        })
    })

    describe("Matching protocol", () => {
        it("Succeeds if the protocol that was used matches the contract", async () => {
            const citiesRequest = mockRequest(
                citiesGetRequestMockRequestOptions
            )
            await request({
                uri: "https://www.google.com/some/cities/here",
            })
            citiesRequest.expectRequestMadeMatchingContract(citiesContract)
        })

        it("Errors if the protocol that was used doesn't match the contract", async () => {
            const citiesRequest = mockRequest(
                citiesGetRequestMockRequestOptions
            )
            await request({
                uri: "http://www.google.com/some/cities/here",
            })

            let expectedError
            try {
                citiesRequest.expectRequestMadeMatchingContract(citiesContract)
            } catch (error) {
                expectedError = error
            }
            expect(expectedError.message).toContain(
                "The protocol used in this request doesn't match the expectations"
            )
        })
    })

    describe("Matching paths", () => {
        it("Succeeds if the path that was used matches the contract", async () => {
            const citiesRequest = mockRequest({
                ...citiesGetRequestMockRequestOptions,
                requestPattern: /.*/,
            })
            await request({
                uri: "https://www.google.com/some/cities/here",
            })
            citiesRequest.expectRequestMadeMatchingContract(citiesContract)
        })

        it("Errors if the path that was used doesn't match the contract", async () => {
            const incorrectPath = `/this/is/not/the/right/path`
            const citiesRequest = mockRequest({
                ...citiesGetRequestMockRequestOptions,
                requestPattern: /.*/,
            })
            await request({
                uri: `https://www.google.com${incorrectPath}`,
            })

            const pathThatWasExpected = new URL(citiesContract.request.url)
                .pathname
            let expectedError
            try {
                citiesRequest.expectRequestMadeMatchingContract(citiesContract)
            } catch (error) {
                expectedError = error
            }
            expect(expectedError.message).toContain(
                `The request path does not match the contracts.\nPath requested by your code: ${incorrectPath}\nExpected path to be called: ${pathThatWasExpected}`
            )
        })
    })

    describe("Matching query parameters", () => {
        it("Succeeds if the query parameters that were used match the contract", async () => {
            const citiesRequest = mockRequest(
                citiesGetRequestMockRequestOptions
            )
            await request({
                uri:
                    "https://www.google.com/some/cities/here?paramOne=A_New_Hope&paramTwo=The_Empire_Strikes_Back&paramThree=Return_Of_The_Jedi",
            })
            const contractWithQueryParams = cloneDeep(
                citiesContract
            ) as Contract
            contractWithQueryParams.request.url = `${contractWithQueryParams.request.url}?paramOne=A_New_Hope&paramTwo=The_Empire_Strikes_Back&paramThree=Return_Of_The_Jedi`
            citiesRequest.expectRequestMadeMatchingContract(
                contractWithQueryParams
            )
        })

        it("Errors if the query parameters that were used don't match the contract", async () => {
            const citiesRequest = mockRequest(
                citiesGetRequestMockRequestOptions
            )
            await request({
                uri:
                    "https://www.google.com/some/cities/here?paramOne=A_New_Hope&paramTwo=The_Empire_Strikes_Back&paramThree=Return_Of_The_Jedi",
            })
            const contractWithQueryParams = cloneDeep(
                citiesContract
            ) as Contract
            contractWithQueryParams.request.url = `${contractWithQueryParams.request.url}?paramOne=The_Fellowship_Of_The_Ring`

            let expectedError
            try {
                citiesRequest.expectRequestMadeMatchingContract(
                    contractWithQueryParams
                )
            } catch (error) {
                expectedError = error
            }
            expect(expectedError.message).toContain(
                "The query parameters the app used do not match the query parameters expected by the contracts."
            )
        })

        it("Errors if query parameters were used but the contracts didn't expect any", async () => {
            const citiesRequest = mockRequest(
                citiesGetRequestMockRequestOptions
            )
            await request({
                uri:
                    "https://www.google.com/some/cities/here?paramOne=The_Fellowship_Of_The_Ring",
            })

            let expectedError
            try {
                citiesRequest.expectRequestMadeMatchingContract(citiesContract)
            } catch (error) {
                expectedError = error
            }
            expect(expectedError.message).toContain(
                "The query parameters the app is using for the request should have been empty."
            )
        })
    })
})
