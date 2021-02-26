import {mockRequest} from ".."
import {
    request,
    // eslint-disable-next-line no-unused-vars
    RequestHelperResponse,
} from "./testHelpers/requestHelpers"

const exampleRequestJson = async (
    uri: string
): Promise<RequestHelperResponse> => {
    return await request({
        uri,
        method: "GET",
        json: true,
    })
}

const regexForErrorInThisFile = /Error: \n {4}at .+\/src\/tests\/stacktrace\.spec\.ts:\d+:\d+/i

describe("Stack traces stop at calling function, don't include mock-inspect specifics", () => {
    it("expectNetworkRequestToHaveBeenMade()", () => {
        const req = mockRequest({requestPattern: "/this/is/my/URL"})
        let expectedError
        try {
            req.expectNetworkRequestToHaveBeenMade()
        } catch (error) {
            expectedError = error
        }
        expect(expectedError.stack).toMatch(regexForErrorInThisFile)
    })

    it("expectNetworkRequestToNotHaveBeenMade()", async () => {
        const url = "https://www.google.com/hello"
        const req = mockRequest({requestPattern: url, responseBody: {a: "b"}})
        await exampleRequestJson(url)
        let expectedError
        try {
            req.expectNetworkRequestToNotHaveBeenMade()
        } catch (error) {
            expectedError = error
        }
        expect(expectedError.stack).toMatch(regexForErrorInThisFile)
    })

    it("expectRequestMadeMatching()", async () => {
        const url = "https://www.google.com/hello"
        const req = mockRequest({requestPattern: url, responseBody: {a: "b"}})
        await exampleRequestJson(url)
        let expectedError
        try {
            req.expectRequestMadeMatching({
                requestPayload: {me: "Hello"},
            })
        } catch (error) {
            expectedError = error
        }
        expect(expectedError.stack).toMatch(regexForErrorInThisFile)
    })

    it("expectRequestMadeMatchingContract()", async () => {
        const url = "https://www.google.com/hello"
        const req = mockRequest({requestPattern: url, responseBody: {a: "b"}})
        await exampleRequestJson(url)
        let expectedError
        try {
            req.expectRequestMadeMatchingContract({
                request: {
                    method: "GET",
                    url: "http://www.starwars.de",
                },
                response: {
                    statusCode: 401,
                },
            })
        } catch (error) {
            expectedError = error
        }
        expect(expectedError.stack).toMatch(regexForErrorInThisFile)
    })
})
