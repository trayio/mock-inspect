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

export const fetchFromExampleDomain = async () => {
    const response = await fetch("https://example.com")
    console.log("Response: ", response)
}
