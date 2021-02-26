// eslint-disable-next-line no-unused-vars
import {MockResponseOptions} from "../types/MockResponseOptions"
import {rest} from "msw"
// eslint-disable-next-line no-unused-vars
import {NetworkResponseBody} from "../types/generalTypes"
// eslint-disable-next-line no-unused-vars
import {InternalReference} from "../mockRequest"
import {makeMswResponseHandler} from "./common"
import {server} from "../setupAndTeardown"

const removeQueryStringsFromPathString = (pattern: string): string => {
    const patternWithoutQueryStrings = pattern.replace(/\?.*/, "")
    return patternWithoutQueryStrings
}

const makeMswCompliantMockPattern = (
    mockOpts: MockResponseOptions
): string | RegExp => {
    try {
        new URL(mockOpts.requestPattern as any)
        return mockOpts.requestPattern
    } catch (error) {
        if (typeof mockOpts.requestPattern === "string") {
            const pathOnly = removeQueryStringsFromPathString(
                mockOpts.requestPattern
            )
            return new RegExp(pathOnly)
        }
        return mockOpts.requestPattern
    }
}

export const handleRestRequest = ({
    mockOpts,
    method,
    body,
    statusCode,
    reference,
}: {
    mockOpts: MockResponseOptions
    method: string
    body: NetworkResponseBody
    statusCode: number
    reference: InternalReference
}) => {
    const restMethod = rest[method.toLowerCase()]
    if (!restMethod) {
        throw new Error(
            `The HTTP method "${method}" is not supported by the underlying mocking framework we are using, sorry.`
        )
    }
    const pattern = makeMswCompliantMockPattern(mockOpts)
    server.use(
        // eslint-disable-next-line no-unused-vars
        restMethod(pattern, (req, res, ctx) => {
            return makeMswResponseHandler({
                mswResponder: res,
                mswRequest: req,
                body,
                statusCode,
                mockOpts,
                reference,
            })
        })
    )
}
