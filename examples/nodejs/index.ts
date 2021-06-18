import * as https from "https"

export const fetchFromExampleDomain = () => {
    https.get("https://example.com")
}
