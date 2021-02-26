// eslint-disable-next-line no-unused-vars
import {NetworkRequestBody, HttpMethod} from "./generalTypes"

export type Contract = {
    response: {
        statusCode: number
        body?: any
        headers?: Record<string, string | number>
    }
    request: {
        url: string
        method: HttpMethod
        headers?: Record<string, string | number>
        payload?: NetworkRequestBody
    }
    metadata?: AdditionalContractInfo
}

interface AdditionalContractInfo {
    testName?: string
    date: string
}
