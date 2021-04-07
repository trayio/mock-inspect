import {mockRequest} from ".."
import {
    request,
    // eslint-disable-next-line no-unused-vars
    RequestHelperResponse,
} from "./testHelpers/requestHelpers"

const exampleGraphQLPostRequestJson = async (
    query: string,
    uri?: string
): Promise<RequestHelperResponse> => {
    return await request({
        uri: uri || "https://mycoolapi.com/graphql",
        method: "POST",
        body: {query},
        json: true,
        headers: {"content-type": "application-json"},
    })
}

const exampleGraphQLGetRequestJson = async (
    query: string
): Promise<RequestHelperResponse> => {
    return await request({
        uri: `https://mycoolapi.com/graphql?and=somequerystrings&query=${encodeURIComponent(
            query
        )}`,
        method: "GET",
        json: true,
    })
}

describe("Mocking graphQL requests", () => {
    it("It can mock multiple graphQL requests to the same URL but using the query name found in the request payload to have mock-inspect determine what to send when", async () => {
        const firstThings = {entries: "one une uno eins"}
        const secondThings = {entries: "deux zwei two duo"}
        const firstMockedRequest = mockRequest({
            graphQLQueryName: "GetFirstThings",
            responseBody: firstThings,
            requestMethod: "POST",
        })
        const secondMockedRequest = mockRequest({
            graphQLQueryName: "GetSecondThings",
            responseBody: secondThings,
            requestMethod: "POST",
        })

        const firstCalledButSecondMocked = await exampleGraphQLPostRequestJson(
            `query GetSecondThings { animals { cats } }`
        )
        secondMockedRequest.expectRequestToHaveBeenMade()
        firstMockedRequest.expectRequestToNotHaveBeenMade()
        expect(firstCalledButSecondMocked.body).toEqual(secondThings)

        const secondCalledButFirstMocked = await exampleGraphQLPostRequestJson(
            `query GetFirstThings { animals { cats } }`
        )
        secondMockedRequest.expectRequestToHaveBeenMade()
        expect(secondCalledButFirstMocked.body).toEqual(firstThings)
    })

    it("It can mock multiple graphQL requests to the same URL but using the query name found in the query parameters to have mock-inspect determine what to send when", async () => {
        const firstMockedRequest = mockRequest({
            graphQLQueryName: "GetFirstThings",
            responseBody: {entries: "one une uno eins"},
            requestMethod: "GET",
        })
        const secondMockedRequest = mockRequest({
            graphQLQueryName: "GetSecondThings",
            responseBody: {entries: "two deux duo zwei"},
            requestMethod: "GET",
        })

        const firstCalledButSecondMocked = await exampleGraphQLGetRequestJson(
            `query GetSecondThings { animals { cats } }`
        )
        secondMockedRequest.expectRequestToHaveBeenMade()
        const secondCalledButFirstMocked = await exampleGraphQLGetRequestJson(
            `query GetFirstThings { animals { cats } }`
        )
        firstMockedRequest.expectRequestToHaveBeenMade()

        expect(firstCalledButSecondMocked.body).toEqual({
            entries: "two deux duo zwei",
        })
        expect(secondCalledButFirstMocked.body).toEqual({
            entries: "one une uno eins",
        })
    })

    it("expectRequestToHaveBeenMade() applies to the request that was made using the query name, order doesn't matter", async () => {
        const firstReponse = {entries: "one une uno eins"}
        const secondResponse = {entries: "deux zwei two duo"}
        const firstMockedRequest = mockRequest({
            graphQLQueryName: "GetFirstThings",
            responseBody: firstReponse,
            requestMethod: "POST",
        })
        const secondMockedRequest = mockRequest({
            graphQLQueryName: "GetSecondThings",
            responseBody: secondResponse,
            requestMethod: "POST",
        })

        let expectedErrorOnCheckIfFirstMockedRequestWasCalled
        try {
            firstMockedRequest.expectRequestToHaveBeenMade()
        } catch (error) {
            expectedErrorOnCheckIfFirstMockedRequestWasCalled = error
        }
        expect(
            expectedErrorOnCheckIfFirstMockedRequestWasCalled.message
        ).toMatch(
            "You expected that the request has been made, but it was not."
        )

        const secondMockedCalled = await exampleGraphQLPostRequestJson(
            `query GetSecondThings { animals { cats } }`
        )
        secondMockedRequest.expectRequestToHaveBeenMade()
        expect(secondMockedCalled.body).toEqual(secondResponse)

        let expectedErrorOnCheckIfFirstMockedRequestWasStillNotCalled
        try {
            firstMockedRequest.expectRequestToHaveBeenMade()
        } catch (error) {
            expectedErrorOnCheckIfFirstMockedRequestWasStillNotCalled = error
        }
        expect(
            expectedErrorOnCheckIfFirstMockedRequestWasStillNotCalled.message
        ).toMatch(
            "You expected that the request has been made, but it was not."
        )

        const firstMockedCalled = await exampleGraphQLPostRequestJson(
            `query GetFirstThings { animals { cats } }`
        )
        firstMockedRequest.expectRequestToHaveBeenMade()
        expect(firstMockedCalled.body).toEqual(firstReponse)
    })

    it("Throws an error if graphQLQueryName AND graphQLMutationName is given", () => {
        let expectedError
        try {
            mockRequest({
                graphQLQueryName: "GetFirstThings",
                graphQLMutationName: "GetFirstThings",
                responseBody: "bla bla",
                requestMethod: "POST",
            })
        } catch (error) {
            expectedError = error
        }

        expect(expectedError.message).toMatch(
            "You passed graphQLMutationName AND graphQLQueryName into the mock options - please pick one, you can't have both."
        )
    })

    it("When mocking graphQL, the request pattern matters passed as string - it doesn't just respond to any graphQL request", async () => {
        const apiOneResponse = {msg: "GraphQL API 1 says one"}
        const apiTwoResponse = {msg: "GraphQL API 2 says two"}
        mockRequest({
            graphQLQueryName: "GetThings",
            requestPattern: "https://graphqlAPI1.com/graphql",
            responseBody: apiOneResponse,
            requestMethod: "POST",
        })
        mockRequest({
            graphQLQueryName: "GetThings",
            requestPattern: "https://graphqlAPI2.com/graphql",
            responseBody: apiTwoResponse,
            requestMethod: "POST",
        })
        const firstAPIResponse = await exampleGraphQLPostRequestJson(
            `query GetThings { animals { cats } }`,
            "https://graphqlAPI1.com/graphql"
        )
        const secondAPIResponse = await exampleGraphQLPostRequestJson(
            `query GetThings { animals { cats } }`,
            "https://graphqlAPI2.com/graphql"
        )
        expect(firstAPIResponse.body).toEqual(apiOneResponse)
        expect(secondAPIResponse.body).toEqual(apiTwoResponse)
    })

    it("When mocking graphQL, the request pattern matters passed as regex - it doesn't just respond to any graphQL request", async () => {
        const apiOneResponse = {msg: "GraphQL API 1 says one"}
        const apiTwoResponse = {msg: "GraphQL API 2 says two"}
        mockRequest({
            graphQLQueryName: "GetThings",
            requestPattern: /graphqlAPI1\.com\/graphql/i,
            responseBody: apiOneResponse,
            requestMethod: "POST",
        })
        mockRequest({
            graphQLQueryName: "GetThings",
            requestPattern: /graphqlAPI2\.com\/graphql/i,
            responseBody: apiTwoResponse,
            requestMethod: "POST",
        })
        const firstAPIResponse = await exampleGraphQLPostRequestJson(
            `query GetThings { animals { cats } }`,
            "https://graphqlAPI1.com/graphql"
        )
        const secondAPIResponse = await exampleGraphQLPostRequestJson(
            `query GetThings { animals { cats } }`,
            "https://graphqlAPI2.com/graphql"
        )
        expect(firstAPIResponse.body).toEqual(apiOneResponse)
        expect(secondAPIResponse.body).toEqual(apiTwoResponse)
    })
})
