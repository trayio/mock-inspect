import * as https from "https"

const fetch = (url) => {
    return new Promise((resolve) => {
        let body = ""
        https.get(url, (res) => {
            res.on("data", (chunk) => (body = body + chunk))
            res.on("end", () => resolve(body))
        })
    })
}

export const fetchFromExampleDomain = async () =>
    await fetch("https://example.com")
