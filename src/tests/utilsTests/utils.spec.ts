import {objectHasKeys} from "../../utils"

describe("Utils", () => {
    describe("Object has keys helper", () => {
        it("Returns true if an object with keys is passed in", () => {
            expect(objectHasKeys({a: 1, b: 2})).toBe(true)
        })

        it("Returns false if an object without keys is passed in", () => {
            expect(objectHasKeys({})).toBe(false)
        })
    })
})
