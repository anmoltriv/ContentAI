
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
// Keep your helper function import
import { generateAIResponse, generateBlogTitlesResponse, generateImageResponse } from "../utils/createResponse.js";
import { removeBackgroundFromImage } from "../utils/modifyImage.js";

const formatCreation = (creation) => ({
    ...creation,
    likes: Array.isArray(creation.likes) ? creation.likes : [],
    publish: Boolean(creation.publish),
});

export const generateArticle = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt, length } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        // 1. Guard check for free tier limits
        if (plan !== 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: "Limit Reached. Upgrade to Continue" });
        }

        // 2. FIXED: Added 'await' so execution pauses until Gemini returns the actual text
        const content = await generateAIResponse(prompt, length);

        // 3. Database Insertion (now correctly receives a real text string)
        await sql`INSERT INTO CREATIONS (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, 'article')`;

        // 4. Update usage quotas inside Clerk metadata for free tier accounts
        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1
                }
            });
        }
        
        // 5. Success dispatch back to the React client
        return res.json({ success: true, content });

    } catch (error) {
        console.error("Error in generateArticle controller:", error.message);
        return res.json({ success: false, message: error.message });
    }
};

export const generateBlogTitles = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { keyword, category } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (!keyword || !category) {
            return res.json({ success: false, message: "Keyword and category are required." });
        }

        if (plan !== 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: "Limit Reached. Upgrade to Continue" });
        }

        const content = await generateBlogTitlesResponse(keyword, category);

        await sql`INSERT INTO CREATIONS (user_id, prompt, content, type) VALUES (${userId}, ${`Generate a blog title for the keyword ${keyword} in the category ${category}.`}, ${content}, 'blog-title')`;

        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1
                }
            });
        }

        return res.json({ success: true, content });
    } catch (error) {
        console.error("Error in generateBlogTitles controller:", error.message);
        return res.json({ success: false, message: error.message });
    }
};

export const generateImage = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt, style, publish = false } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (!prompt || !style) {
            return res.json({ success: false, message: "Prompt and style are required." });
        }

        if (plan !== 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: "Limit Reached. Upgrade to Continue" });
        }

        const content = await generateImageResponse(prompt, style);

        await sql`
            INSERT INTO CREATIONS (user_id, prompt, content, type, publish)
            VALUES (${userId}, ${`Generate an image for "${prompt}" in the ${style} style.`}, ${content}, 'image', ${publish})
        `;

        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1
                }
            });
        }

        return res.json({ success: true, content });
    } catch (error) {
        console.error("Error in generateImage controller:", error.message);
        return res.json({ success: false, message: error.message });
    }
};

export const getUserCreations = async (req, res) => {
    try {
        const { userId } = req.auth();

        const creations = await sql`
            SELECT id, user_id, prompt, content, type, publish, likes, created_at, updated_at
            FROM creations
            WHERE user_id = ${userId}
            ORDER BY created_at DESC, id DESC
        `;

        return res.json({
            success: true,
            creations: creations.map(formatCreation),
        });
    } catch (error) {
        console.error("Error in getUserCreations controller:", error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getPublishedCreations = async (req, res) => {
    try {
        const creations = await sql`
            SELECT id, user_id, prompt, content, type, publish, likes, created_at, updated_at
            FROM creations
            WHERE type = 'image' AND publish = true
            ORDER BY created_at DESC, id DESC
        `;

        return res.json({
            success: true,
            creations: creations.map(formatCreation),
        });
    } catch (error) {
        console.error("Error in getPublishedCreations controller:", error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const removeBackground = async (req, res) => {
    try {
        const { userId } = req.auth();
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (!req.file) {
            return res.status(400).json({ success: false, message: "Image file is required." });
        }

        if (plan !== "premium" && free_usage >= 10) {
            return res.json({ success: false, message: "Limit Reached. Upgrade to Continue" });
        }

        const result = await removeBackgroundFromImage(req.file);

        if (plan !== "premium") {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1
                }
            });
        }

        return res.json({
            success: true,
            originalImage: result.originalImageUrl,
            content: result.processedImageUrl,
            publicId: result.publicId,
        });
    } catch (error) {
        console.error("Error in removeBackground controller:", error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};
