import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { clerkMiddleware } from '@clerk/express'; // removed requireAuth from here
import aiRouter from './routes/aiRoutes.js';

const app = express();

// Keep CORS and JSON parsers at the absolute top
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware()); // This safely populates req.auth everywhere without blocking

app.get('/', (req, res) => {
    res.send("Server is Live");
});

// FIXED: Removed global requireAuth() from here so it doesn't intercept CORS preflights

app.use('/api/ai', aiRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('Server is running on Port', PORT);
});