import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load server/.env from this file's location so the Gemini key is available
// even when the process is started from the repo root instead of /server.
dotenv.config({
    path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.env"),
});

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

function createGeminiClient(apiKey, vertexai = false) {
    // Always pass a real apiKey and an explicit vertexai flag.
    // If apiKey is omitted, @google/genai falls back to Google Auth and
    // sends Authorization: Bearer <ADC token> instead of x-goog-api-key.
    // If GOOGLE_GENAI_USE_VERTEXAI is set in the environment, the SDK would
    // otherwise prefer project/location auth and drop the API key entirely.
    return new GoogleGenAI({
        apiKey,
        vertexai,
    });
}

function extractText(response) {
    if (response?.text && response.text.trim()) {
        return response.text;
    }

    const parts = response?.candidates?.[0]?.content?.parts;
    if (Array.isArray(parts)) {
        const text = parts.map((part) => part?.text || "").join("").trim();
        if (text) return text;
    }

    return "";
}

async function generateWithClient(ai, contents) {
    const models = ["gemini-2.5-flash", "gemini-2.0-flash"];
    let lastError = null;

    for (const model of models) {
        try {
            const response = await ai.models.generateContent({
                model,
                contents,
            });

            const text = extractText(response);
            if (text) {
                return text;
            }
            throw new Error("Empty response returned");
        } catch (err) {
            console.warn(`[Fallback] Model ${model} failed: ${err.message}. Trying next model...`);
            lastError = err;
        }
    }

    throw lastError || new Error("All fallback models failed to generate content");
}

async function generateWithFallback(contents) {
    const apiKeys = getGeminiApiKeys();

    if (apiKeys.length === 0) {
        throw new Error("Missing GEMINI_API_KEY. Add it to your server .env file.");
    }

    let lastError = null;

    for (const apiKey of apiKeys) {
        // Gemini Developer API first (x-goog-api-key, no Bearer token).
        // Vertex Express Mode second for AQ.* keys that only work on aiplatform.googleapis.com.
        for (const vertexai of [false, true]) {
            try {
                const ai = createGeminiClient(apiKey, vertexai);
                return await generateWithClient(ai, contents);
            } catch (err) {
                console.warn(
                    `[Fallback] Gemini request failed (vertexai=${vertexai}): ${err.message}. Trying next auth mode...`,
                );
                lastError = err;
            }
        }
    }

    throw lastError || new Error("All fallback models failed to generate content");
}

export { getGeminiApiKeys, createGeminiClient };

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
