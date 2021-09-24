import {
    expectToMatchSchema,
    numberType,
    strictObject,
    stringType,
    uuidType,
} from "jest-json-schema-extended"
import {autoGenerateResponseFromGraphQLSchema} from "../../utils/autoGenerateResponseFromGraphQLSchema"
import {simpleGraphQLExampleSchemaString} from "../fixtures/simpleGraphQLSchemaString"
import {graphQLSchemaWithCustomTypes} from "../fixtures/graphQLSchemaWithCustomScalarTypesString"

describe("autoGenerateResponseFromGraphQLSchema", () => {
    it("Generated graphQL response when strings are requested and string schema is given", () => {
        const autoGeneratedResponse = autoGenerateResponseFromGraphQLSchema({
            stringSchema: simpleGraphQLExampleSchemaString,
            query: `
        query MyCoolQuery {
            me {
                name,
                id,
                age,
                height
            }
        }
        `,
        })
        expectToMatchSchema(
            autoGeneratedResponse.data,
            strictObject({
                me: strictObject({
                    name: stringType,
                    id: uuidType,
                    age: numberType,
                    height: numberType,
                }),
            })
        )
    })

    it("Generated graphQL response using custom types when strings are requested and string schema is given", () => {
        const customStringType = "This is my custom type"
        const autoGeneratedResponse = autoGenerateResponseFromGraphQLSchema({
            stringSchema: simpleGraphQLExampleSchemaString,
            query: `
      query MyCoolQuery {
          me {
              name
          }
      }
      `,
            customTypes: {
                String: () => customStringType,
            },
        })
        expect(autoGeneratedResponse.data.me.name).toBe(customStringType)
    })

    it("Allows to add new types that are not supported by default in graphQL", () => {
        const customString = "This is fake"
        const autoGeneratedResponse = autoGenerateResponseFromGraphQLSchema({
            stringSchema: graphQLSchemaWithCustomTypes,
            query: `
            query MyCoolQuery {
                allStarships {
                    edges {
                        node {
                            model
                        }
                    }
                }
            }
            `,
            customTypes: {
                Json: () => customString,
            },
        })
        expect(
            autoGeneratedResponse.data.allStarships.edges[0].node.model
        ).toBe(customString)
    })

    it("I can set a fixed amount for array items to respond with", () => {
        const autoGeneratedResponse = autoGenerateResponseFromGraphQLSchema({
            stringSchema: simpleGraphQLExampleSchemaString,
            query: `
            query {
                users {
                    id,
                    email,
                    friends {
                        id,
                        email
                    }
                    posts {
                        id
                    }
                }
            }
            `,
            fixedArrayLengths: {
                "User.friends": 8,
                "User.posts": 6,
            },
        })
        autoGeneratedResponse.data.users.forEach((user) => {
            expect(user.friends.length).toBe(8)
            expect(user.posts.length).toBe(6)
        })
    })

    it("Throws an error if the fixedArrayLenghts object key doesn't use format Type.property", () => {
        let expectedError: Error
        try {
            autoGenerateResponseFromGraphQLSchema({
                stringSchema: simpleGraphQLExampleSchemaString,
                query: `
                query {
                    users {
                        id,
                        email,
                        friends {
                            id,
                            email
                        }
                        posts {
                            id
                        }
                    }
                }
                `,
                fixedArrayLengths: {
                    "User - friends": 8,
                    "User - posts": 6,
                },
            })
        } catch (error) {
            expectedError = error
        }
        expect(expectedError.message).toBe(
            'We have been unable to pass the settings you put into `graphQLAutoMocking.fixedArrayLengths`. The object key needs to be a string of format "type.property", i.e. "User.posts".'
        )
    })
})