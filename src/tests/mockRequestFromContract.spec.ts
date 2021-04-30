import {mockRequestFromExample} from ".."
import {
    request,
    // eslint-disable-next-line no-unused-vars
    RequestHelperResponse,
} from "./testHelpers/requestHelpers"
// eslint-disable-next-line no-unused-vars
import {Example} from "../types/Example"
// eslint-disable-next-line no-unused-vars
import {NetworkRequestBody} from "../types/generalTypes"

const citiesExample: Example = {
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
            "content-length": "59",
        },
    },
}

const exampleRequestJson = async (
    payload: NetworkRequestBody = undefined
): Promise<RequestHelperResponse> => {
    return await request({
        uri: citiesExample.request.url,
        method: citiesExample.request.method,
        json: true,
        body: payload,
    })
}

describe("mockRequestFromExample", () => {
    it("Can mock a basic GET request from provided example", async () => {
        mockRequestFromExample(citiesExample)
        const res = await exampleRequestJson()
        expect(res.body).toEqual(citiesExample.response.body)
    })
})
