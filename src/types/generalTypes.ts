export interface JsonObject {
    [key: string]: any
}

export interface NetworkRequestHeaders {
    [headerName: string]: string
}

export type ResponseStatusCode = number
export type NetworkResponseBody = JsonObject | string
export type NetworkRequestBody = JsonObject | string
export type HttpMethod = string
