export interface JsonObject {
    [key: string]: any
}

export type ResponseStatusCode = number
export type NetworkResponseBody = JsonObject | string
export type NetworkRequestBody = JsonObject | string
export type HttpMethod = "POST" | "PUT" | "GET" | "PATCH" | "DELETE" | "OPTIONS"
