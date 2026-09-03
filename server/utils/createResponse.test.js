import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import { createGeminiClient, getGeminiApiKeys } from "./createResponse.js";

describe("Gemini API key handling", () => {
    beforeEach(() => {
        delete process.env.GEMINI_API_KEY;
        delete process.env.GEMINI_API_KEY_2;
        delete process.env.GOOGLE_API_KEY;
        delete process.env.GOOGLE_GENAI_USE_VERTEXAI;
    });

    it("trims whitespace and ignores blank values from env", () => {
        process.env.GEMINI_API_KEY = "  test-gemini-key  ";
        process.env.GEMINI_API_KEY_2 = " ";
        process.env.GOOGLE_API_KEY = "google-key";

        assert.deepEqual(getGeminiApiKeys(), ["test-gemini-key", "google-key"]);
    });

    it("constructs the SDK with the explicit API key instead of Vertex ADC", () => {
        const ai = createGeminiClient("test-gemini-key", false);

        assert.equal(ai.apiKey, "test-gemini-key");
        assert.equal(ai.vertexai, false);
    });

    it("does not drop the API key when Vertex Express mode is requested", () => {
        process.env.GOOGLE_GENAI_USE_VERTEXAI = "true";
        process.env.GOOGLE_CLOUD_PROJECT = "some-project";
        process.env.GOOGLE_CLOUD_LOCATION = "us-central1";

        const ai = createGeminiClient("AQ.test-express-key", true);

        assert.equal(ai.apiKey, "AQ.test-express-key");
        assert.equal(ai.vertexai, true);
        assert.equal(ai.project, undefined);
        assert.equal(ai.location, undefined);
    });

    it("fails with a clear error instead of sending a Google Auth bearer token", async () => {
        const { generateAIResponse } = await import("./createResponse.js");

        await assert.rejects(
            () => generateAIResponse("Write a short article", 50),
            /Missing GEMINI_API_KEY/,
        );
    });
});
