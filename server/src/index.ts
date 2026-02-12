import express, { Request, Response } from 'express'; // Import Request/Response types
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './db.js';
import { generateSecretKey } from './utils/keyGenerator.js';
import User from './models/user.js';
import { handleChatMessage,getDashboardData } from './controllers/chatController.js';

import rateLimit from 'express-rate-limit';



dotenv.config();
connectDB();

const app = express();
const allowedOrigins = [
  'https://mind-pluse.vercel.app', 
  'http://localhost:5173'
];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow Localhost AND any Vercel URL (including previews)
    if (origin === 'http://localhost:5173' || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 15, 
  message: { 
    reply: "Hana needs a moment to breathe. Please wait a minute before messaging again." 
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Add types (req: Request, res: Response) to fix the 'any' error
app.get('/',(req: Request, res: Response)=>{
  res.send("Hana's backend is up and running!");})

app.post('/api/chat/message', limiter, handleChatMessage);
app.get('/api/dashboard/:secretKey', getDashboardData);

app.post('/api/auth/init', async (req: Request, res: Response) => {
    try {
        const { name } = req.body; // <--- Capture Name from Frontend
        const secretKey = generateSecretKey();
        
        const newUser = await User.create({
            secretKey: secretKey,
            name: name || "", // <--- Save Name to Database
            history: []
        });

        res.status(201).json({ 
            success: true, 
            secretKey: newUser.secretKey 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});
// Add this to src/index.ts
app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
        const { secretKey } = req.body;

        if (!secretKey) {
            return res.status(400).json({ success: false, message: "Secret key is required" });
        }

        // Find the user by their unique key
        const user = await User.findOne({ secretKey });

        if (!user) {
            return res.status(404).json({ success: false, message: "Invalid Secret Key. We couldn't find your friend." });
        }

        // Return the existing history so the Frontend can display it
        res.status(200).json({ 
            success: true, 
            history: user.history,
            stressScore: user.stressScore 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Login failed" });
    }
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: any) => {
    console.error("🚨 SYSTEM ERROR:", err.stack);
    res.status(500).json({
        success: false,
        message: "Hana is having a small technical glitch. Please try again in a moment.",
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
