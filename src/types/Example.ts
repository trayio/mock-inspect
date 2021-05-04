// eslint-disable-next-line no-unused-vars
import {
    NetworkRequestBody,
    HttpMethod,
    NetworkRequestHeaders,
} from "./generalTypes"

export type Example = {
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
    metadata?: AdditionalExampleInfo
}

interface AdditionalExampleInfo {
    testName?: string
    date: string
}
