/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    setupFilesAfterEnv: ["./tests/setup.ts"], // For global setup/teardown
    testMatch: ["<rootDir>/tests/**/*.test.ts"], // Only run tests in 'tests' directory
    moduleFileExtensions: ["ts", "js", "json", "node"],
    roots: ["<rootDir>/tests"],
    collectCoverageFrom: ["src/**/*.{ts,js}", "!src/**/*.d.ts"],
};
