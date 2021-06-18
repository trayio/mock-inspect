import {mockRequest} from "../../src/index"
import {fetchFromExampleDomain} from "./index"

describe("Node.js example", () => {
    it("should send a request to https://example.com", async () => {
        // Set up your mockRequest:
        const mockedRequest = mockRequest({
            requestPattern: "https://example.com",
            requestMethod: "GET",
            responseStatus: 200,
            responseBody: "Example mocked body",
        })

        // You can assert that the request has not been made in this test:
        let expectedErrorWhenRequestNotMade
        try {
            mockedRequest.expectRequestToHaveBeenMade()
        } catch (error) {
            expectedErrorWhenRequestNotMade = error
        }
        expect(expectedErrorWhenRequestNotMade.message).toMatch(
            "You expected that the request has been made, but it was not."
        )

        // Ater calling the endpoint from this test:
        await fetchFromExampleDomain()

        // expectRequestToHaveBeenMade should not throw an error:
        mockedRequest.expectRequestToHaveBeenMade()
    })
})
