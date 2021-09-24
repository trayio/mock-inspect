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

describe("Stack traces continue to calling function, include mock-inspect specifics", () => {
    it("expectRequestToHaveBeenMade()", () => {
        const req = mockRequest({requestPattern: "/this/is/my/URL"})
        let expectedError
        try {
            req.expectRequestToHaveBeenMade()
        } catch (error) {
            expectedError = error
        }
        expect(expectedError.stack).not.toMatch(regexForErrorInThisFile)
    })

    it("expectRequestToNotHaveBeenMade()", async () => {
        const url = "https://www.google.com/hello"
        const req = mockRequest({requestPattern: url, responseBody: {a: "b"}})
        await exampleRequestJson(url)
        let expectedError
        try {
            req.expectRequestToNotHaveBeenMade()
        } catch (error) {
            expectedError = error
        }
        expect(expectedError.stack).not.toMatch(regexForErrorInThisFile)
    })
})
