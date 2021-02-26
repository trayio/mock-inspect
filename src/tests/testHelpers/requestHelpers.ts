import fetch from "node-fetch"
// eslint-disable-next-line no-unused-vars
import {NetworkResponseBody} from "../../types/generalTypes"

interface RequestOptions {
    uri: string
    method?: string
    body?: Object
    json?: boolean
    headers?: {[headerName: string]: string}
}

export interface RequestHelperResponse {
    headers: {
        [headerName: string]: string
    }
    body: NetworkResponseBody
}

export const request = ({
    uri,
    method = "GET",
    body,
    json,
    headers,
}: RequestOptions): Promise<RequestHelperResponse> => {
    return new Promise((resolve, reject) => {
        const requestPayload =
            typeof body === "string" ? body : JSON.stringify(body)
        fetch(uri, {
            method: method,
            body: requestPayload,
            headers,
        })
            .then(async (response) => {
                const body = json
                    ? await response.json()
                    : await response.text()
                resolve({
                    headers: response.headers.raw(),
                    body,
                })
            })
            .catch((err) => reject(err))
    })
}
