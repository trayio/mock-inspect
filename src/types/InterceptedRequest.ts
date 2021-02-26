// eslint-disable-next-line no-unused-vars
import {ClientRequest, RequestOptions as CoreRequestOptions} from "http"

/**
 * Construct a type with a set of properties K of type T
 */
type Record<K extends keyof any, T> = {
    [P in K]: T
}

interface RequestOptions extends CoreRequestOptions {
    /**
     * The path name of the request only, i.e. /graphql
     */
    pathname: string
    /**
     * The full URL of the request, i.e.
     * https://mycoolapi.com/graphql?and=somequerystrings
     */
    href: string
    /**
     * The query segment of the request, i.e.
     * and=somequerystrings&plus=anotherone - note that it comes without the
     * question mark.
     */
    query: string
}

export interface InterceptedRequest extends ClientRequest {
    headers: Record<string, string>
    options: RequestOptions
}
