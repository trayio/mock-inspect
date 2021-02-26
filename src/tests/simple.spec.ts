import {mockRequest} from ".."
import {
    request,
    // eslint-disable-next-line no-unused-vars
    RequestHelperResponse,
} from "./testHelpers/requestHelpers"

const host = "https://thiswebpagedoesntexist.com"
const requestPath = "/todos/1"
const requestUri = `${host}${requestPath}`
const mockedResponse = {
    message: "This response is not real, it is mocked!",
}

const exampleRequestJson = async (
    method: string = "GET"
): Promise<RequestHelperResponse> => {
    return await request({
        uri: requestUri,
        method,
        json: true,
    })
}

describe("Simple examples", () => {
    it("Can mock a basic GET request when using the full URL as request pattern", async () => {
        mockRequest({
            requestPattern: requestUri,
            requestMethod: "GET",
            responseBody: mockedResponse,
        })
        const res = await exampleRequestJson()
        expect(res.body).toEqual(mockedResponse)
    })

    it("Can mock a basic GET request when using only the path (as string) request pattern", async () => {
        mockRequest({
            requestPattern: requestPath,
            requestMethod: "GET",
            responseBody: mockedResponse,
        })
        const res = await exampleRequestJson()
        expect(res.body).toEqual(mockedResponse)
    })

    it("Can mock non-JSON responses", async () => {
        const nonJsonText = "This is some regular non-JSON text"
        mockRequest({
            requestPattern: requestUri,
            requestMethod: "GET",
            responseBody: nonJsonText,
        })
        const res = await request({
            uri: requestUri,
            method: "GET",
        })
        expect(res.body).toEqual(nonJsonText)
    })

    it("Request method is optional and will be assumed as GET", async () => {
        mockRequest({
            requestPattern: requestUri,
            responseBody: mockedResponse,
        })
        const res = await exampleRequestJson()
        expect(res.body).toEqual(mockedResponse)
    })

    it("Only mocks requests that match the specified request method", async () => {
        mockRequest({
            requestPattern: requestUri,
            requestMethod: "PUT",
            responseBody: mockedResponse,
        })

        let error
        try {
            await exampleRequestJson("POST")
        } catch (e) {
            error = e
        }
        expect(error.message).toMatch(
            new RegExp(
                `request to ${requestUri} failed.+request without a corresponding request handler`,
                "is"
            )
        )
    })

    it("Pattern can accept the full URL as string", async () => {
        mockRequest({
            requestPattern: requestUri,
            requestMethod: "GET",
            responseBody: mockedResponse,
        })
        const res = await exampleRequestJson()
        expect(res.body).toEqual(mockedResponse)
    })

    it("Pattern can be a regex matching parts of the URL", async () => {
        const requestLongPathUrl = async () =>
            await request({
                uri:
                    "https://www.google.com/continents/europe/countries/england/cities/london",
                method: "GET",
                json: true,
            })

        mockRequest({
            requestPattern: /\/cities/,
            requestMethod: "GET",
            responseBody: mockedResponse,
        })
        const res = await requestLongPathUrl()
        expect(res.body).toEqual(mockedResponse)

        mockRequest({
            requestPattern: /\/continents/,
            requestMethod: "GET",
            responseBody: mockedResponse,
        })
        const secondRes = await requestLongPathUrl()
        expect(secondRes.body).toEqual(mockedResponse)

        mockRequest({
            requestPattern: /\/continents.*\/london/,
            requestMethod: "GET",
            responseBody: mockedResponse,
        })
        const thirdRes = await requestLongPathUrl()
        expect(thirdRes.body).toEqual(mockedResponse)
    })

    it("Mocks live on for multiple requests if the `persistent` flag is passed", async () => {
        mockRequest({
            requestPattern: requestUri,
            requestMethod: "GET",
            responseBody: mockedResponse,
        })
        const res = await exampleRequestJson()
        expect(res.body).toEqual(mockedResponse)

        let expectedError
        try {
            await exampleRequestJson()
        } catch (error) {
            expectedError = error
        }
        expect(expectedError.message).toMatch(
            new RegExp(
                `request to ${requestUri} failed.+request without a corresponding request handler`,
                "is"
            )
        )

        mockRequest({
            requestPattern: requestUri,
            requestMethod: "GET",
            responseBody: mockedResponse,
            persistent: true,
        })
        const persistentResOne = await exampleRequestJson()
        expect(persistentResOne.body).toEqual(mockedResponse)
        const persistentResTwo = await exampleRequestJson()
        expect(persistentResTwo.body).toEqual(mockedResponse)
    })

    it("Throws an error if you are trying to mock a request with an HTTP method that isn't supported by msw", () => {
        const requestMethod = "PURGE" as any
        let expectedError
        try {
            mockRequest({
                requestPattern: requestUri,
                requestMethod,
                responseBody: mockedResponse,
            })
        } catch (error) {
            expectedError = error
        }
        expect(expectedError.message).toEqual(
            `The HTTP method "${requestMethod}" is not supported by the underlying mocking framework we are using, sorry.`
        )
    })

    it("Throws an error if neither request pattern nor query or mutation name have been given", () => {
        let expectedError
        try {
            mockRequest({})
        } catch (error) {
            expectedError = error
        }
        expect(expectedError.message).toEqual(
            "Not enough options passed. When mocking REST requests, we need to know of the `requestPattern` property. When mocking graphQL requests, we need to know of the `graphQLQueryName` OR `graphQLMutationName` property. (With graphQL, you can optionally also pass a requestPattern though to make the mock more specific.)"
        )
    })

    it("Can mock only passing the path with query strings", async () => {
        const pathOnlyPatternWithQueryStrings =
            "/api/json?tree=jobs[name]&pretty=true"
        const host = "https://system.starwars.com"
        const fullRequestUrl = `${host}${pathOnlyPatternWithQueryStrings}`
        const fixedResponse = {hello: "world"}
        mockRequest({
            requestPattern: pathOnlyPatternWithQueryStrings,
            responseBody: fixedResponse,
        })
        const res = await request({
            uri: fullRequestUrl,
            json: true,
        })
        expect(res.body).toEqual(fixedResponse)
    })
})
