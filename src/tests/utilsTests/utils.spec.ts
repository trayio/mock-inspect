import {objectHasKeys, normaliseRequestHeaderObject} from "../../utils"

describe("Utils", () => {
    describe("Object has keys helper", () => {
        it("Returns true if an object with keys is passed in", () => {
            expect(objectHasKeys({a: 1, b: 2})).toBe(true)
        })

        it("Returns false if an object without keys is passed in", () => {
            expect(objectHasKeys({})).toBe(false)
        })
    })

    describe("Normalise request header object helper", () => {
        it("Converts header values to lower-case if passed as regular string", () => {
            expect(normaliseRequestHeaderObject({
                KeyA: "PropertyA",
            })).toEqual({
                keya: "propertya",
            })
        })
        it("Converts header values to lower-case if passed as array", () => {
            expect(normaliseRequestHeaderObject({
                KeyA: ["PropertyA"],
            })).toEqual({
                keya: "propertya",
            })
        })
        it("Converts header values to lower-case if mixed", () => {
            expect(normaliseRequestHeaderObject({
                KeyA: "PropertyA",
                KeyB: ["Poperty B"],
            })).toEqual({
                keya: "propertya",
                keyb: "poperty b",
            })
        })
    })
})
