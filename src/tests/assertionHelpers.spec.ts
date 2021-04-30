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

    describe("inspect returns information about how the request was made", () => {
        it("returns information if request was made", async () => {
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
            expect(requestInfo.requestHeaders.header_name_1).toBe(
                "header_value_1"
            )
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

        it("Fails if request hasn't been made yet", () => {
            const citiesRequest = mockRequest({
                requestPattern: /\/cities/,
                requestMethod: "GET",
                responseBody: "Here is your fake response",
            })
            let expectedErrorWhenRequestNotMade
            try {
                citiesRequest.inspect()
            } catch (error) {
                expectedErrorWhenRequestNotMade = error
            }
            expect(expectedErrorWhenRequestNotMade.message).toMatch(
                "You expected that the request has been made, but it was not."
            )
        })
    })
})
