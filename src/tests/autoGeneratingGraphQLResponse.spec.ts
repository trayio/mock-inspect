import {
    expectToMatchSchema,
    numberType,
    strictObject,
    stringType,
    uuidType,
} from "jest-json-schema-extended"
import {mockRequest} from ".."
// eslint-disable-next-line no-unused-vars
import {JsonObject} from "../types/generalTypes"
// eslint-disable-next-line no-unused-vars
import {NumberTuple} from "../types/MockResponseOptions"
import {simpleGraphQLExampleSchemaString} from "./fixtures/simpleGraphQLSchemaString"
import {graphQLSchemaWithCustomTypes} from "./fixtures/graphQLSchemaWithCustomScalarTypesString"
import {
    request,
    // eslint-disable-next-line no-unused-vars
    RequestHelperResponse,
} from "./testHelpers/requestHelpers"

const exampleGraphQLPostRequestJson = async (
    query: string,
    variables?: JsonObject
): Promise<RequestHelperResponse> => {
    return await request({
        uri: `https://myCoolAPI.com/graphql`,
        method: "POST",
        body: {query, variables},
        json: true,
        headers: {
            "content-type": "application/json",
        },
    })
}

describe("Automatic generation of graphQL responses depending on query and supplied schema", () => {
    it("Passed graphQL schema auto-generates responses for every query that is being made", async () => {
        const mockedGQLRequestWithSchema = mockRequest({
            requestPattern: /\/graphql/i,
            requestMethod: "POST",
            graphQLQueryName: "MyCoolQuery",
            graphQLAutoMocking: {
                schema: simpleGraphQLExampleSchemaString,
            },
        })
        const response = await exampleGraphQLPostRequestJson(`
                query MyCoolQuery {
                    me {
                        name,
                        id,
                        age,
                        height
                    }
                }
            `)
        mockedGQLRequestWithSchema.expectNetworkRequestToHaveBeenMade()
        expectToMatchSchema(
            response.body as JsonObject,
            strictObject({
                data: strictObject({
                    me: strictObject({
                        name: stringType,
                        id: uuidType,
                        age: numberType,
                        height: numberType,
                    }),
                }),
            })
        )
    })

    it("Passed graphQL schema auto-generates responses for every query with arguments that is being made", async () => {
        const mockedGQLRequestWithSchema = mockRequest({
            requestPattern: /\/graphql/i,
            requestMethod: "POST",
            graphQLQueryName: "MyCoolQuery",
            graphQLAutoMocking: {
                schema: simpleGraphQLExampleSchemaString,
            },
        })
        const response = await exampleGraphQLPostRequestJson(`
                query MyCoolQuery {
                    user (name: "Darth Vader") {
                        name,
                        id,
                        age,
                        height
                    }
                }
            `)
        mockedGQLRequestWithSchema.expectNetworkRequestToHaveBeenMade()
        expectToMatchSchema(
            response.body as JsonObject,
            strictObject({
                data: strictObject({
                    user: strictObject({
                        name: stringType,
                        id: uuidType,
                        age: numberType,
                        height: numberType,
                    }),
                }),
            })
        )
    })

    it("Passed graphQL schema auto-generates responses for every query with variables that is being made", async () => {
        const mockedGQLRequestWithSchema = mockRequest({
            requestPattern: /\/graphql/i,
            requestMethod: "POST",
            graphQLQueryName: "MyCoolQuery",
            graphQLAutoMocking: {
                schema: simpleGraphQLExampleSchemaString,
            },
        })
        const response = await exampleGraphQLPostRequestJson(
            `
                query MyCoolQuery($nameToSearchBy: String!) {
                    user (name: $nameToSearchBy) {
                        name,
                        id,
                        age,
                        height
                    }
                }
            `,
            {
                nameToSearchBy: "Darth Vader",
            }
        )
        mockedGQLRequestWithSchema.expectNetworkRequestToHaveBeenMade()
        expectToMatchSchema(
            response.body as JsonObject,
            strictObject({
                data: strictObject({
                    user: strictObject({
                        name: stringType,
                        id: uuidType,
                        age: numberType,
                        height: numberType,
                    }),
                }),
            })
        )
    })

    it("When graphQL schema and responseBody are passed, auto-generation is ignored and the fixed responseBody is used", async () => {
        const fixedResponse = {
            this: "is a fixed response set via the responseBody property",
        }
        const mockedGQLRequestWithSchema = mockRequest({
            requestPattern: /\/graphql/i,
            requestMethod: "POST",
            graphQLQueryName: "MyCoolQuery",
            responseBody: fixedResponse,
            graphQLAutoMocking: {
                schema: simpleGraphQLExampleSchemaString,
            },
        })
        const response = await exampleGraphQLPostRequestJson(`
                query MyCoolQuery {
                    me {
                        name,
                        id,
                        age,
                        height
                    }
                }
            `)
        mockedGQLRequestWithSchema.expectNetworkRequestToHaveBeenMade()
        expect(response.body).toEqual(fixedResponse)
    })

    it("I can override default graphQL types", async () => {
        const customString = "This is the custom string response I set up"
        const mockedGQLRequestWithSchema = mockRequest({
            requestPattern: /\/graphql/i,
            requestMethod: "POST",
            graphQLQueryName: "MyCoolQuery",
            graphQLAutoMocking: {
                schema: simpleGraphQLExampleSchemaString,
                customTypes: {
                    String: () => customString,
                },
            },
        })
        const response = await exampleGraphQLPostRequestJson(`
                query MyCoolQuery {
                    me {
                        name
                    }
                }
            `)
        mockedGQLRequestWithSchema.expectNetworkRequestToHaveBeenMade()
        expect((response.body as JsonObject).data.me.name).toEqual(customString)
    })

    it("I can attach mocks for custom graphQL types", async () => {
        const customString = "This is the custom string response I set up"
        const mockedGQLRequestWithSchema = mockRequest({
            requestPattern: /\/graphql/i,
            requestMethod: "POST",
            graphQLQueryName: "MyCoolQuery",
            graphQLAutoMocking: {
                schema: graphQLSchemaWithCustomTypes,
                customTypes: {
                    Json: () => customString,
                },
            },
        })
        const response = (await exampleGraphQLPostRequestJson(`
        query MyCoolQuery {
            allStarships {
            edges {
              node {
                model
              }
            }
          }
        }
            `)) as JsonObject
        mockedGQLRequestWithSchema.expectNetworkRequestToHaveBeenMade()
        expect(response.body.data.allStarships.edges[0].node.model).toBe(
            customString
        )
    })

    it("Throws an error if my schema has custom types which the auto-generation can't mock and tells me what to do", async () => {
        mockRequest({
            requestPattern: /\/graphql/i,
            requestMethod: "POST",
            graphQLQueryName: "MyCoolQuery",
            graphQLAutoMocking: {
                schema: graphQLSchemaWithCustomTypes,
            },
        })

        let expectedError
        try {
            await exampleGraphQLPostRequestJson(`
            query MyCoolQuery {
                allStarships {
                    edges {
                        node {
                            model
                        }
                    }
                }
            }
            `)
        } catch (error) {
            expectedError = error
        }
        expect(expectedError.message).toContain(
            "There has been a problem on trying to auto-generate a graphQL response for your query matching your schema (see below). This is most likely due to your schema having some custom types which we don't know about yet. You can define what value we should auto-generate for these custom types by populating the object `graphQLAutoMocking.customTypes`."
        )
    })

    it("Returns an error as response if I make a bad query", async () => {
        mockRequest({
            requestPattern: /\/graphql/i,
            requestMethod: "POST",
            graphQLQueryName: "MyCoolQuery",
            graphQLAutoMocking: {
                schema: graphQLSchemaWithCustomTypes,
            },
        })

        const response = await exampleGraphQLPostRequestJson(`
        query MyCoolQuery {
            allStarships {
                edges {
                    node {
                        thisPropertyDoesnotExistOnTheSchema
                    }
                }
            }
        }
        `)
        expect((response.body as any).errors[0].message).toContain(
            `Cannot query field "thisPropertyDoesnotExistOnTheSchema" on type "Starship"`
        )
    })

    it("I can choose a fixed array length of auto-generated arrays", async () => {
        const fixedLength = 7
        const mockedGQLRequestWithSchema = mockRequest({
            requestPattern: /\/graphql/i,
            requestMethod: "POST",
            graphQLQueryName: "MyCoolQuery",
            graphQLAutoMocking: {
                schema: simpleGraphQLExampleSchemaString,
                fixedArrayLengths: {
                    "Query.users": fixedLength,
                },
            },
        })
        const response = await exampleGraphQLPostRequestJson(`
                query MyCoolQuery {
                    users {
                        id,
                        email,
                    }
                }
            `)
        mockedGQLRequestWithSchema.expectNetworkRequestToHaveBeenMade()
        expect((response as JsonObject).body.data.users.length).toBe(
            fixedLength
        )
    })

    it("I can choose a fixed array range of auto-generated arrays", async () => {
        const fixedLength = [5, 9] as NumberTuple
        const mockedGQLRequestWithSchema = mockRequest({
            requestPattern: /\/graphql/i,
            requestMethod: "POST",
            graphQLQueryName: "MyCoolQuery",
            graphQLAutoMocking: {
                schema: simpleGraphQLExampleSchemaString,
                fixedArrayLengths: {
                    "Query.users": fixedLength,
                },
            },
        })
        const response = await exampleGraphQLPostRequestJson(`
                query MyCoolQuery {
                    users {
                        id,
                        email,
                    }
                }
            `)
        mockedGQLRequestWithSchema.expectNetworkRequestToHaveBeenMade()
        expect(
            (response as JsonObject).body.data.users.length
        ).toBeGreaterThanOrEqual(fixedLength[0])
        expect(
            (response as JsonObject).body.data.users.length
        ).toBeLessThanOrEqual(fixedLength[1])
    })
})
