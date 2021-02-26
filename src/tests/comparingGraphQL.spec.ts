import {mockRequestFromContract} from ".."
// eslint-disable-next-line no-unused-vars
import {Contract} from "../types/Contract"
import {
    request,
    // eslint-disable-next-line no-unused-vars
    RequestHelperResponse,
} from "./testHelpers/requestHelpers"
// eslint-disable-next-line no-unused-vars
import {NetworkRequestBody, JsonObject} from "../types/generalTypes"

const graphQlContract: Contract = {
    response: {
        statusCode: 200,
        body: {
            data: {
                viewer: {
                    teamMembershipsForUser: {
                        edges: [
                            {
                                node: {
                                    teamRole: "OWNER",
                                    team: {
                                        id: "here_would_go_a_team_ID",
                                        __typename: "Team",
                                    },
                                    __typename: "TeamMembership",
                                },
                                __typename: "TeamMembershipEdge",
                            },
                        ],
                        __typename: "TeamMembershipConnection",
                    },
                    __typename: "Viewer",
                },
            },
        },
        headers: {
            "content-type": "application/json",
        },
    },
    request: {
        url: "https://hostnameishere.amazonaws.com/production/graphql",
        method: "POST",
        headers: {
            authorization: "Bearer heregoesthebearer",
            accept: "application/json",
            "content-type": "application/json",
        },
        payload: {
            query:
                "query { viewer { teamMembershipsForUser { edges { node { teamRole team { id __typename } __typename } __typename } __typename } __typename } }",
        },
    },
}

const exampleRequestJson = async (
    body: NetworkRequestBody
): Promise<RequestHelperResponse> => {
    return await request({
        uri: "https://hostnameishere.amazonaws.com/production/graphql",
        method: "POST",
        body,
        json: true,
    })
}

describe("Comparing GraphQL requests", () => {
    describe("Comparing GraphQL queries", () => {
        it("succeeds when mocking a graphQL request from contract and the request has been made according to contract", async () => {
            const mockedGraphQlCall = mockRequestFromContract(graphQlContract)
            await exampleRequestJson(graphQlContract.request.payload)
            mockedGraphQlCall.expectRequestMadeMatchingContract()
        })

        it("errors when mocking a graphQL request from contract and the request has not been made according to contract", async () => {
            const mockedGraphQlCall = mockRequestFromContract(graphQlContract)
            const requestPayload = {
                ...(graphQlContract.request.payload as JsonObject),
            }
            requestPayload.query = requestPayload.query.replace(
                "teamRole",
                "unknownGraphQLAttribtue"
            )
            await exampleRequestJson(requestPayload)

            let expectedError
            try {
                mockedGraphQlCall.expectRequestMadeMatchingContract()
            } catch (err) {
                expectedError = err
            }
            expect(expectedError.message).toContain(
                "It looks like the query that has been made doesn't match the expectations from the contract."
            )
        })
    })
})
