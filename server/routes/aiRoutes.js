import express from 'express';
import multer from 'multer';
import {
    generateArticle,
    generateBlogTitles,
    generateImage,
    getPublishedCreations,
    getUserCreations,
    removeBackground,
    removeObject
} from '../controllers/aiController.js';
import { auth } from '../middlewares/auth.js';

const aiRouter = express.Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
});

aiRouter.post('/generate-article',auth,generateArticle);
aiRouter.post('/generate-blog-titles',auth,generateBlogTitles);
aiRouter.post('/generate-image',auth,generateImage);
aiRouter.post('/remove-background', auth, upload.single('image'), removeBackground);
aiRouter.post('/remove-object',auth,upload.single('image'),removeObject);
aiRouter.get('/creations', auth, getUserCreations);
aiRouter.get('/public-creations', auth, getPublishedCreations);

export default aiRouter
