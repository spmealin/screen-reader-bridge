module.exports = {
    preset: "ts-jest",
    testEnvironment: "jsdom",
    testMatch: ["**/test/**/*.test.ts"],
    globals: {
        "ts-jest": {
            tsconfig: "tsconfig.spec.json"
        }
    }
};
