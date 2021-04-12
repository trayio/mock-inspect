import {mockRequestFromContract} from ".."
import {
    request,
    // eslint-disable-next-line no-unused-vars
    RequestHelperResponse,
} from "./testHelpers/requestHelpers"
// eslint-disable-next-line no-unused-vars
import {Contract} from "../types/Contract"
// eslint-disable-next-line no-unused-vars
import {NetworkRequestBody} from "../types/generalTypes"

const citiesContract: Contract = {
    response: {
        statusCode: 200,
        body: {
            loginId:
                "c950eae440dc4a8c98d64faea1877c006aa4233e339f45f6b70f26a022adc384",
            lastSeen: 1571840997797,
            castleSignature: "PHKzGCVvZTz2vwBYHou/EPQu1xrMi53GCNDifWDDXgc=",
        },
        headers: {
            date: "Wed, 23 Oct 2019 14:54:59 GMT",
            "content-type": "application/json",
            "content-length": "168",
            connection: "close",
            "x-tray-verification-required": "false",
            "access-control-expose-headers":
                "X-Tray-Verification-Required, X-Tray-Session-Expired",
        },
    },
    request: {
        url: "https://www.google.com/some/cities/here",
        method: "POST",
        headers: {
            accept: "application/json",
            "content-type": "application/json",
            "content-length": 59,
        },
    },
}

const citiesContractWithPayload: Contract = {
    response: {...citiesContract.response},
    request: {...citiesContract.request, payload: {"An example": "payload"}},
}

const exampleRequestJson = async (
    payload: NetworkRequestBody = undefined
): Promise<RequestHelperResponse> => {
    return await request({
        uri: citiesContract.request.url,
        method: citiesContract.request.method,
        json: true,
        body: payload,
    })
}

describe("mockRequestFromContract examples", () => {
    it("Can mock a basic GET request from provided contract", async () => {
        mockRequestFromContract(citiesContract)
        const res = await exampleRequestJson()
        expect(res.body).toEqual(citiesContract.response.body)
    })

    it("Can call expectRequestMadeMatchingContract() when a request was made from a contract, without having to pass in a contract again", async () => {
        const mock = mockRequestFromContract(citiesContract)
        await exampleRequestJson()
        mock.expectRequestMadeMatchingContract()
    })

    it("Responds with the response headers that are specified in the contract", async () => {
        mockRequestFromContract(citiesContract)
        const res = await exampleRequestJson()
        const expectedHeaders = Object.keys(
            citiesContract.response.headers
        ).reduce((prev, curr) => {
            return {
                ...prev,
                [curr]: [citiesContract.response.headers[curr]],
            }
        }, {})
        expect(res.headers).toEqual(expectedHeaders)
    })

    it("Errors if you want to pass in a contract to expectRequestMadeMatchingContract() if the mocked request has been created with a contract", async () => {
        const mock = mockRequestFromContract(citiesContract)
        await exampleRequestJson()

        let expectedError
        try {
            mock.expectRequestMadeMatchingContract(citiesContract)
        } catch (error) {
            expectedError = error
        }
        expect(expectedError.message).toBe(
            `You cannot use the method "expectRequestMadeMatchingContract" like this. It looks like this mocked request was created from a contract; in that case, you cannot pass in a contract to expectRequestMadeMatchingContract(). Just call it without any arguments, we will do the rest for you!`
        )
    })

    it("Errors if the request that was made uses a payload but the contract does not", async () => {
        const mock = mockRequestFromContract(citiesContract)
        await exampleRequestJson({thisIsMyUnexpected: "payload"})

        let expectedError
        try {
            mock.expectRequestMadeMatchingContract()
        } catch (error) {
            expectedError = error
        }

        expect(expectedError.message).toContain(
            `The network request has been made, but the body with which the request was made does not match the expectations.`
        )
    })

    it("Errors if the request that was made does not use a payload but the contract requires ones", async () => {
        const mock = mockRequestFromContract(citiesContractWithPayload)
        await exampleRequestJson()

        let expectedError
        try {
            mock.expectRequestMadeMatchingContract()
        } catch (error) {
            expectedError = error
        }

        expect(expectedError.message).toContain(
            `The network request has been made, but the body with which the request was made does not match the expectations.`
        )
    })
})
