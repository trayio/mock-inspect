// eslint-disable-next-line no-unused-vars
import {NetworkRequestBody} from "./generalTypes"

export interface RequestHeadersNormalised {
    [headerName: string]: string
}

export interface ExpectRequestMadeMatchingInput {
    requestPayload?: NetworkRequestBody
    requestHeaders?: RequestHeadersNormalised
}
