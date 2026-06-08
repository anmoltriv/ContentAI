// // Middleware to check the userId and hasPremiumPlan

// import { clerkClient } from "@clerk/express";

// export const auth = async (req, res, next) => {
//     try {
//         const { userId, has } = await req.auth();
//         const hasPremiumPlan = await has({ plan: 'premium' });
//         const user = await clerkClient.users.getUser(userId);
//         if (!hasPremiumPlan && user.privateMetadata.free_usage) {
//             req.free_usage = user.privateMetadata.free_usage;
//         } else{
//             await clerkClient.users.updateUserMetadata(userId, {
//                 privateMetadata:{
//                     free_usage: 0
//                 }
//             })
//             req.free_usage = 0;
//         }
//         req.plan = hasPremiumPlan? 'premium' : 'free';
//         next();
//     } catch (error) {
//         res.json({success: false  , message : error.message});

//     }
// }

import { clerkClient } from "@clerk/express";

export const auth = async (req, res, next) => {
    try {
        console.log("1. Incoming Auth Header:", req.headers.authorization ? "Present" : "MISSING");
        const auth = req.auth();
        console.log("2. Clerk Auth User:", auth?.userId || "MISSING");
        const { userId, has } = auth;

        // Hard stop if there's no authenticated session before running metadata logic
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized token" });
        }

        // Check plan status via Clerk's helper method
        const hasPremiumPlan = await has({ plan: 'premium' });
        const user = await clerkClient.users.getUser(userId);
        
        // Read existing usage or fall back cleanly
        const existingUsage = user.privateMetadata?.free_usage;

        if (!hasPremiumPlan && existingUsage !== undefined) {
            req.free_usage = existingUsage;
        } else {
            // Initialize metadata to 0 if it doesn't exist or if they are premium resetting
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: 0
                }
            });
            req.free_usage = 0;
        }
        
        req.plan = hasPremiumPlan ? 'premium' : 'free';
        next(); // Hand control off to generateArticle controller
        
    } catch (error) {
        console.error("Error in custom auth middleware:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};
