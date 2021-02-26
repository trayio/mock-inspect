// eslint-disable-next-line no-unused-vars
import {
    expectToMatchSchema,
    numberType,
    strictObject,
    uuidType,
} from "jest-json-schema-extended"
import {mockRequest} from ".."
// eslint-disable-next-line no-unused-vars
import {JsonObject} from "../types/generalTypes"
import {
    request,
    // eslint-disable-next-line no-unused-vars
    RequestHelperResponse,
} from "./testHelpers/requestHelpers"

const exampleGraphQLPostRequestJson = async (
    uri: string,
    query: string
): Promise<RequestHelperResponse> => {
    return await request({
        uri,
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json",
        },
        body: {query},
    })
}

const graphQLURLConfiguredInSetup = "https://thisdomaindoesnotexist.com/graphql"

/**
 * These tests works based on the fact that in our jest setup file `setup.ts`,
 * we are setting these persistent auto-generated graphQL mocks.
 */
describe("Startup mocks", () => {
    it("Persisent graphQL auto-generated mocks can be set in setUpNetworkRequestMocking before msw server start up", async () => {
        const responseOne = await exampleGraphQLPostRequestJson(
            graphQLURLConfiguredInSetup,
            `
            query GetHero {
                me {
                    age
                }
            }
        `
        )
        expectToMatchSchema(
            responseOne.body as JsonObject,
            strictObject({
                data: strictObject({
                    me: strictObject({
                        age: numberType,
                    }),
                }),
            })
        )
        const responseTwo = await exampleGraphQLPostRequestJson(
            graphQLURLConfiguredInSetup,
            `
            query GetHero {
                me {
                    id
                }
            }
        `
        )
        expectToMatchSchema(
            responseTwo.body as JsonObject,
            strictObject({
                data: strictObject({
                    me: strictObject({
                        id: uuidType,
                    }),
                }),
            })
        )
    })

    it("GraphQL urls that aren't exactly the one defined in the setup still go through as usual", async () => {
        const graphQLURLThatIsNotSetUp =
            "https://differentnogodomain.com/graphql"

        let expectedError
        try {
            await exampleGraphQLPostRequestJson(
                graphQLURLThatIsNotSetUp,
                `
                query GetHero {
                    me {
                        id
                    }
                }
            `
            )
        } catch (error) {
            expectedError = error
        }
        expect(expectedError.message).toMatch(
            new RegExp(
                `request to ${graphQLURLThatIsNotSetUp} failed.+request without a corresponding request handler`,
                "is"
            )
        )
    })

    it("Persistent mocks can be overridden during the test if necessary", async () => {
        const responseOne = await exampleGraphQLPostRequestJson(
            graphQLURLConfiguredInSetup,
            `
            query GetHero {
                me {
                    age
                }
            }
        `
        )
        expectToMatchSchema(
            responseOne.body as JsonObject,
            strictObject({
                data: strictObject({
                    me: strictObject({
                        age: numberType,
                    }),
                }),
            })
        )

        const customResponse = {msg: "I am a custom response"}
        mockRequest({
            requestPattern: graphQLURLConfiguredInSetup,
            graphQLQueryName: "GetHero",
            responseBody: customResponse,
        })
        const responseTwo = await exampleGraphQLPostRequestJson(
            graphQLURLConfiguredInSetup,
            `
            query GetHero {
                me {
                    id
                }
            }
        `
        )
        expect(responseTwo.body).toEqual(customResponse)
    })
})
