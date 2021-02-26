import {mockRequest, logMockedRequests} from "../"

describe("logMockedRequests", () => {
    let originalConsoleLog
    beforeEach(() => {
        originalConsoleLog = console.log
        console.log = jest.fn()
    })
    afterEach(() => {
        console.log = originalConsoleLog
    })

    it("Logs the entirety of the internal mock store to the console", () => {
        mockRequest({
            requestPattern: "https://www.secure.com/with/many/paths?and=query",
        })
        mockRequest({
            requestPattern: "http://www.insecure.io/",
        })
        mockRequest({
            requestPattern: /\/graphql/i,
        })
        logMockedRequests()
        const output = (console.log as any).mock.calls[0][0]
        const internalReferences = Object.keys(output)
        expect(internalReferences.length).toBeGreaterThanOrEqual(3)
        internalReferences.forEach((internalRef) => {
            expect(output[internalRef]).toHaveProperty("request")
            expect(output[internalRef]).toHaveProperty("response")
        })
    })
})
