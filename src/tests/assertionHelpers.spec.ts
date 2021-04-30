import { inspect } from "node:util"
import {mockRequest} from ".."
import {request} from "./testHelpers/requestHelpers"

describe("Assertion Helpers", () => {
    it("Can tell whether a network request has been made or not", async () => {
        const citiesRequest = mockRequest({
            requestPattern: /\/cities/,
            requestMethod: "GET",
            responseBody: "Here is your fake response",
        })
        citiesRequest.expectRequestToNotHaveBeenMade()
        await request({
            uri: "https://www.google.com/some/cities/here",
        })
        citiesRequest.expectRequestToHaveBeenMade()
    })

    it("Fails if expectation of network request having been made is incorrect", async () => {
        const citiesRequest = mockRequest({
            requestPattern: /\/cities/,
            requestMethod: "GET",
            responseBody: "Here is your fake response",
        })
        let expectedErrorWhenRequestNotMade
        try {
            citiesRequest.expectRequestToHaveBeenMade()
        } catch (error) {
            expectedErrorWhenRequestNotMade = error
        }
        expect(expectedErrorWhenRequestNotMade.message).toMatch(
            "You expected that the request has been made, but it was not."
        )

        await request({
            uri: "https://www.google.com/some/cities/here",
        })

        let expectedErrorWhenRequestMade
        try {
            citiesRequest.expectRequestToNotHaveBeenMade()
        } catch (error) {
            expectedErrorWhenRequestMade = error
        }
        expect(expectedErrorWhenRequestMade.message).toMatch(
            "You expected that the request has not been made, but it was."
        )
    })

    describe("Can tell whether the request has been made matching certain conditions", () => {
        it("Can tell if the request has been made matching an expected request body", async () => {
            const citiesRequest = mockRequest({
                requestPattern: /\/cities/,
                requestMethod: "POST",
                responseBody: "Here is your fake response",
            })
            const jsonPostBody = JSON.stringify({a: 1, b: 2, c: 3})
            await request({
                uri: "https://www.google.com/some/cities/here",
                method: "POST",
                body: jsonPostBody,
            })
            citiesRequest.expectRequestMadeMatching({
                requestPayload: jsonPostBody,
            })
        })

        it("Will error if the request has not been made matching an expected request body", async () => {
            const citiesRequest = mockRequest({
                requestPattern: /\/cities/,
                requestMethod: "POST",
                responseBody: "Here is your fake response",
            })
            const usedRequestBody = JSON.stringify({a: 1, b: 2, c: 3})
            const expectedRequestBody = JSON.stringify({Mickey: "Mouse"})

            await request({
                uri: "https://www.google.com/some/cities/here",
                method: "POST",
                body: usedRequestBody,
            })

            let error
            try {
                citiesRequest.expectRequestMadeMatching({
                    requestPayload: expectedRequestBody,
                })
            } catch (e) {
                error = e
            }
            const expectedError = `The network request has been made, but the body with which the request was made does not match the expectations.\nRequest body used by your code: ${usedRequestBody}\nExpected request body: ${expectedRequestBody}`
            expect(error.message).toContain(expectedError)
        })

        it("Should match request headers", async () => {
            const citiesRequest = mockRequest({
                requestPattern: /\/cities/,
                requestMethod: "GET",
                responseBody: "Here is your fake response",
            })
            const headersAddedToRequest = {
                header_name_1: "header_value_1",
            }
            await request({
                uri: "https://www.google.com/some/cities/here",
                method: "GET",
                headers: headersAddedToRequest,
            })
            citiesRequest.expectRequestMadeMatching({
                requestHeaders: headersAddedToRequest,
            })
        })

        it("Will error if the request headers used were not the ones expected", async () => {
            const citiesRequest = mockRequest({
                requestPattern: /\/cities/,
                requestMethod: "GET",
                responseBody: "Here is your fake response",
            })
            const expectedHeaders = {
                name_2: "value_2",
            }
            const actualHeaders = {
                name_1: "value_1",
            }
            await request({
                uri: "https://www.google.com/some/cities/here",
                method: "GET",
                headers: actualHeaders,
            })

            let error
            try {
                citiesRequest.expectRequestMadeMatching({
                    requestHeaders: expectedHeaders,
                })
            } catch (e) {
                error = e
            }
            const expectedError = `The network request has been made, but the headers with which the request was made don't contain all the headers that were expected.\nExpected headers: ${JSON.stringify(
                expectedHeaders
            )}\nActual headers: {"name_1":"value_1"`
            expect(error.message).toContain(expectedError)
        })

        it("Should treat all as lowercase when matching request headers", async () => {
            const citiesRequest = mockRequest({
                requestPattern: /\/cities/,
                requestMethod: "GET",
                responseBody: "Here is your fake response",
            })
            await request({
                uri: "https://www.google.com/some/cities/here",
                method: "GET",
                headers: {
                    HEADER_NAME_1: "HEADER_VALUE_1",
                },
            })
            citiesRequest.expectRequestMadeMatching({
                requestHeaders: {
                    header_name_1: "header_value_1",
                },
            })
        })

        it("Can match request headers AND post body simultaneously", async () => {
            const citiesRequest = mockRequest({
                requestPattern: /\/cities/,
                requestMethod: "POST",
                responseBody: "Here is your fake response",
            })
            const jsonPostBody = JSON.stringify({a: 1, b: 2, c: 3})
            const headersAddedToRequest = {
                header_name_1: "header_value_1",
            }
            await request({
                uri: "https://www.google.com/some/cities/here",
                method: "POST",
                body: jsonPostBody,
                headers: headersAddedToRequest,
            })
            citiesRequest.expectRequestMadeMatching({
                requestPayload: jsonPostBody,
                requestHeaders: headersAddedToRequest,
            })
        })
    })

    describe.only("inspect returns information about how the request was made", () => {
        it("returns information if POST request was made", async () => {
            const citiesRequest = mockRequest({
                requestPattern: /\/cities/,
                requestMethod: "POST",
                responseBody: "Here is your fake response",
            })
            const headersUsed = {
                HEADER_NAME_1: "HEADER_VALUE_1",
            }
            const bodyUsed = JSON.stringify({hello: "world"})
            await request({
                uri: "https://www.google.com/some/cities/here",
                method: "POST",
                headers: headersUsed,
                body: bodyUsed,
            })
            const requestInfo = citiesRequest.inspect()
            expect(requestInfo.requestBody).toEqual(bodyUsed)
            expect(requestInfo.requestHeaders.header_name_1).toBe("header_value_1")
        })

        it("returns empty string for requestBody if POST request was made without payload", async () => {
            const citiesRequest = mockRequest({
                requestPattern: /\/cities/,
                requestMethod: "POST",
                responseBody: "Here is your fake response",
            })
            await request({
                uri: "https://www.google.com/some/cities/here",
                method: "POST",
            })
            const requestInfo = citiesRequest.inspect()
            expect(requestInfo.requestBody).toEqual("")
        })

        it("returns empty string for requestBody if GET request was made (no payload)", async () => {
            const citiesRequest = mockRequest({
                requestPattern: /\/cities/,
                requestMethod: "GET",
                responseBody: "Here is your fake response",
            })
            await request({
                uri: "https://www.google.com/some/cities/here",
                method: "GET",
            })
            const requestInfo = citiesRequest.inspect()
            expect(requestInfo.requestBody).toEqual("")
        })
    })
})
