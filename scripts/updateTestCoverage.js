const fetch = require("node-fetch")
const {parseCoverageFromFile} = require("./parseCoverageFromFile")

const sendCoverageDataToTrayWorkflow = (coverageData) => {
    fetch("https://fd1c2abf-efd3-41ea-8f2f-4ea5e9823014.trayapp.io", {
    method: "POST",
    body: JSON.stringify(coverageData),
    headers: {
        "Content-Type": "application/json",
        "X-Csrf-Token": process.env.TRAY_DEV_ACCOUNT_WORKFLOW_UNIVERSAL_CSRF_TOKEN,
    },
})

}

const coverageData = parseCoverageFromFile()
sendCoverageDataToTrayWorkflow(coverageData)
