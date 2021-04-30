// eslint-disable-next-line no-unused-vars
import {NetworkRequestBody, HttpMethod, NetworkRequestHeaders} from "./generalTypes"

export type Contract = {
    response: {
        statusCode: number
        body?: any
        headers?: NetworkRequestHeaders
    }
    request: {
        url: string
        method: HttpMethod
        headers?: NetworkRequestHeaders
        payload?: NetworkRequestBody
    }
    metadata?: AdditionalContractInfo
}

interface AdditionalContractInfo {
    testName?: string
    date: string
}
