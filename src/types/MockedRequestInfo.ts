import {NetworkRequestHeaders, NetworkResponseBody} from "./generalTypes"

export interface MockedRequestInfo {
    requestBody: NetworkResponseBody
    requestHeaders: NetworkRequestHeaders
}
