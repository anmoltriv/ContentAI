import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ensureCloudinaryConfig = () => {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        throw new Error("Missing Cloudinary credentials. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your server .env file.");
    }
};

export const removeBackgroundFromImage = async (file) => {
    ensureCloudinaryConfig();

    if (!file?.buffer) {
        throw new Error("Image file buffer is missing.");
    }

    const mimeType = file.mimetype || "image/png";
    const dataUri = `data:${mimeType};base64,${file.buffer.toString("base64")}`;

    const uploadResult = await cloudinary.uploader.upload(dataUri, {
        folder: "quickai/remove-background",
        resource_type: "image",
    });

    const processedImageUrl = cloudinary.url(uploadResult.public_id, {
        secure: true,
        format: "png",
        transformation: [
            { effect: "background_removal" },
        ],
    });

    return {
        originalImageUrl: uploadResult.secure_url,
        processedImageUrl,
        publicId: uploadResult.public_id,
    };
};



export const removeObjectFromImage = async (file, prompt) => {
    ensureCloudinaryConfig();

    if (!file?.buffer) {
        throw new Error("Image file buffer is missing.");
    }

    const mimeType = file.mimetype || "image/png";
    const dataUri = `data:${mimeType};base64,${file.buffer.toString("base64")}`;

    const uploadResult = await cloudinary.uploader.upload(dataUri, {
        folder: "quickai/object-removal",
        resource_type: "image",
    });

    // Cloudinary expects spaces to be completely handled; using standard prompt formatting
    // Note: If you run into issues with complex prompts, Cloudinary syntax normally uses: gen_remove:prompt_your prompt here
    const removalEffect = `gen_remove:prompt_${encodeURIComponent(prompt)}`;

    const processedImageUrl = cloudinary.url(uploadResult.public_id, {
        secure: true,
        format: "png",
        transformation: [
            { effect: removalEffect },
        ],
    });

    return {
        originalImageUrl: uploadResult.secure_url,
        processedImageUrl,
        publicId: uploadResult.public_id,
    };
};