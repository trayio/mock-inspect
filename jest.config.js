const path = require("path")

const rootDir = path.join(__dirname, "src")
const testsDir = path.join(rootDir, "tests/")
const projectDirectory = __dirname

module.exports = {
    testMatch: [path.join(testsDir, "**/*.spec.ts")],
    testPathIgnorePatterns: ["node_modules/"],
    rootDir,
    setupFilesAfterEnv: [path.join(testsDir, "testHelpers/setup.ts")],
    verbose: false,
    collectCoverageFrom: ["**/*.ts", "!**/tests/**"],
    preset: "ts-jest",
    testEnvironment: "node",
    coverageDirectory: path.join(projectDirectory, "coverage/"),
    coveragePathIgnorePatterns: [
        path.join(projectDirectory, "scripts/"),
        path.join(projectDirectory, "node_modules/"),
        path.join(projectDirectory, "coverage/"),
    ],
}
