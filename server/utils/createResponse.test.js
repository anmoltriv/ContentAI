import assert from "node:assert/strict";
import { describe, it, beforeEach, afterEach } from "node:test";
import { buildGeminiRequest, generateAIResponse, getGeminiApiKeys } from "./createResponse.js";

describe("Gemini API key handling", () => {
    const originalFetch = globalThis.fetch;

    beforeEach(() => {
        delete process.env.GEMINI_API_KEY;
        delete process.env.GEMINI_API_KEY_2;
        delete process.env.GOOGLE_API_KEY;
        delete process.env.GOOGLE_GENAI_USE_VERTEXAI;
        globalThis.fetch = originalFetch;
    });

    afterEach(() => {
        globalThis.fetch = originalFetch;
    });

    it("trims whitespace and ignores blank values from env", () => {
        process.env.GEMINI_API_KEY = "  test-gemini-key  ";
        process.env.GEMINI_API_KEY_2 = " ";
        process.env.GOOGLE_API_KEY = "google-key";

        assert.deepEqual(getGeminiApiKeys(), ["test-gemini-key", "google-key"]);
    });

    it("sends the API key as x-goog-api-key and never as a Bearer token", () => {
        const { url, options } = buildGeminiRequest({
            apiKey: "test-gemini-key",
            model: "gemini-2.0-flash",
            prompt: "Hello",
        });

        assert.equal(url, "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent");
        assert.equal(options.headers["x-goog-api-key"], "test-gemini-key");
        assert.equal(options.headers.Authorization, undefined);
        assert.equal("authorization" in options.headers, false);
        assert.match(options.body, /Hello/);
    });

    it("can send the API key as a query param without an Authorization header", () => {
        const { url, options } = buildGeminiRequest({
            apiKey: "test-gemini-key",
            model: "gemini-2.0-flash",
            prompt: "Hello",
            useQueryKey: true,
        });

        assert.equal(
            url,
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=test-gemini-key",
        );
        assert.equal(options.headers["x-goog-api-key"], undefined);
        assert.equal(options.headers.Authorization, undefined);
    });

    it("fails with a clear error instead of sending a Google Auth bearer token", async () => {
        await assert.rejects(
            () => generateAIResponse("Write a short article", 50),
            /Missing GEMINI_API_KEY/,
        );
    });

    it("uses the Developer API key on a successful generate call", async () => {
        process.env.GEMINI_API_KEY = "live-test-key";
        let captured;

        globalThis.fetch = async (url, options) => {
            captured = { url, options };
            return {
                ok: true,
                json: async () => ({
                    candidates: [{ content: { parts: [{ text: "Generated article" }] } }],
                }),
            };
        };

        const text = await generateAIResponse("Write about cats", 80);

        assert.equal(text, "Generated article");
        assert.equal(captured.options.headers["x-goog-api-key"], "live-test-key");
        assert.equal(captured.options.headers.Authorization, undefined);
        assert.equal(captured.url.includes("aiplatform.googleapis.com"), false);
        assert.equal(captured.url.includes("generativelanguage.googleapis.com"), true);
    });

    it("surfaces the Gemini API error instead of a Vertex OAuth 401", async () => {
        process.env.GEMINI_API_KEY = "bad-key";

        globalThis.fetch = async () => ({
            ok: false,
            status: 400,
            json: async () => ({
                error: { message: "API key not valid. Please pass a valid API key." },
            }),
        });

        await assert.rejects(
            () => generateAIResponse("Write about cats", 80),
            /API key not valid/,
        );
    });
});
