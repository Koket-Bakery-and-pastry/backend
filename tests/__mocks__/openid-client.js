class MockIssuer {
    static async discover() {
        return {
            Client: class {
                constructor() { }
                authorizationUrl() {
                    return "https://mock/auth";
                }
                async callback() {
                    return {
                        claims: () => ({ email: "test@example.com", sub: "google-sub", name: "Test User" }),
                    };
                }
            },
        };
    }
}

const generators = {
    state: () => "state",
    codeVerifier: () => "verifier",
    codeChallenge: () => "challenge",
};

module.exports = {
    Issuer: MockIssuer,
    generators,
};
