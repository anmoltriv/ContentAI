import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load server/.env from this file's location so the Gemini key is available
// even when the process is started from the repo root instead of /server.
dotenv.config({
    path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.env"),
});

const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash"];
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

function getGeminiApiKeys() {
    const keys = [
        process.env.GEMINI_API_KEY,
        process.env.GEMINI_API_KEY_2,
        process.env.GOOGLE_API_KEY,
    ]
        .map((value) => (typeof value === "string" ? value.trim() : ""))
        .filter(Boolean);

    return [...new Set(keys)];
}

function buildGeminiRequest({ apiKey, model, prompt, useQueryKey = false }) {
    const endpoint = `${GEMINI_API_BASE}/models/${encodeURIComponent(model)}:generateContent`;
    const url = useQueryKey ? `${endpoint}?key=${encodeURIComponent(apiKey)}` : endpoint;
    const headers = {
        "Content-Type": "application/json",
    };

    // Gemini Developer API authenticates with x-goog-api-key (or ?key=).
    // Do not send Authorization: Bearer — Vertex/Google Cloud treats that as
    // a broken OAuth token and returns 401 "Expected OAuth 2 access token".
    if (!useQueryKey) {
        headers["x-goog-api-key"] = apiKey;
    }

    return {
        url,
        options: {
            method: "POST",
            headers,
            body: JSON.stringify({
                contents: [
                    {
                        role: "user",
                        parts: [{ text: prompt }],
                    },
                ],
            }),
        },
    };
}

function extractText(data) {
    const parts = data?.candidates?.[0]?.content?.parts;
    if (Array.isArray(parts)) {
        const text = parts.map((part) => part?.text || "").join("").trim();
        if (text) return text;
    }

    return "";
}

function parseGeminiError(data, status) {
    const message = data?.error?.message || data?.message;
    if (typeof message === "string" && message.trim()) {
        return message.trim();
    }

    return `Gemini API responded with status ${status}`;
}

async function requestGemini({ apiKey, model, prompt, useQueryKey }) {
    const { url, options } = buildGeminiRequest({ apiKey, model, prompt, useQueryKey });
    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(parseGeminiError(data, response.status));
    }

    const text = extractText(data);
    if (!text) {
        throw new Error("Empty response returned");
    }

    return text;
}

async function generateWithFallback(prompt) {
    const apiKeys = getGeminiApiKeys();

    if (apiKeys.length === 0) {
        throw new Error("Missing GEMINI_API_KEY. Add it to your server .env file.");
    }

    let lastError = null;

    for (const apiKey of apiKeys) {
        for (const model of GEMINI_MODELS) {
            // Header first, then ?key= if a proxy or client strips custom headers.
            // Never fall back to Vertex AI — that endpoint rejects API keys and
            // asks for OAuth, which is the 401 the UI was showing.
            for (const useQueryKey of [false, true]) {
                try {
                    return await requestGemini({ apiKey, model, prompt, useQueryKey });
                } catch (err) {
                    console.warn(
                        `[Fallback] Gemini ${model} failed (${useQueryKey ? "query key" : "x-goog-api-key"}): ${err.message}`,
                    );
                    lastError = err;
                }
            }
        }
    }

    throw lastError || new Error("All fallback models failed to generate content");
}

export { getGeminiApiKeys, buildGeminiRequest };

export async function generateAIResponse(promptText, length) {
    try {
        const contents = `${promptText} The Length of the article should be ${length} words`;
        return await generateWithFallback(contents);
    } catch (err) {
        console.error("Error in AI helper function:", err);
        throw err;
    }
}

export async function generateBlogTitlesResponse(keyword, category) {
    try {
        const contents = `Generate 10 engaging blog titles for the keyword "${keyword}" in the "${category}" category. Return only the titles, one per line, without any intro or explanation.`;
        return await generateWithFallback(contents);
    } catch (err) {
        console.error("Error in blog title helper function:", err);
        throw err;
    }
}


export async function generateImageResponse(prompt, style) {
    // Read the Pollinations secret key (sk_...) from your environment variables
    const apiKey = process.env.POLLINATIONS_API_KEY;

    if (!apiKey) {
        throw new Error("Missing Pollinations API Key. Add POLLINATIONS_API_KEY to your .env file.");
    }

    // Combine the prompt and style, and cleanly encode it for a URL string
    const styledPrompt = style ? `${prompt}, ${style} style` : prompt;
    const encodedPrompt = encodeURIComponent(styledPrompt);

    // Using the new base URL format shown in your documentation screenshots
    // We append '?model=flux' as an example query parameter, but you can change this to any supported model
    const pollinationsUrl = `https://gen.pollinations.ai/image/${encodedPrompt}?model=flux`;

    try {
        // Fetch the image while providing the Secret Key in the Authorization Header
        const response = await fetch(pollinationsUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });

        if (!response.ok) {
            throw new Error(`Pollinations API responded with status: ${response.status}`);
        }

        // Get the Content-Type header (defaults to image/jpeg)
        const mimeType = response.headers.get('content-type') || 'image/jpeg';

        // Convert the response to an ArrayBuffer
        const arrayBuffer = await response.arrayBuffer();

        // Convert the ArrayBuffer data into a Base64 string
        const base64Data = Buffer.from(arrayBuffer).toString('base64');

        // Return the exact base64 structure your frontend expects
        return `data:${mimeType};base64,${base64Data}`;

    } catch (err) {
        console.error("Pollinations Image Generation Error:", err);
        throw new Error("Failed to generate image from Pollinations.ai");
    }
}
