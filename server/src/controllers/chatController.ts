import { Request, Response } from 'express';
import { GoogleGenerativeAI } from "@google/generative-ai";
import User from '../models/user.js';

// The '!' at the end of the API key fix your (2345) error
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const handleChatMessage = async (req: Request, res: Response) => {
    try {
        const { secretKey, message, metrics } = req.body;

        // 1. Find user in Database
        const user = await User.findOne({ secretKey });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
            
        }

        
        const message_word_count = message.trim().split(/\s+/).length;
       const interactionCount = Math.floor(user.history.length / 2);

       


        user.history.push({
            role: 'user',
            content: message,
            metrics: metrics, // Save the raw metrics
            timestamp: new Date()
        });


        if (!user.name && interactionCount === 1) {
            console.log("🔍 Attempting to extract name from:", message);
            
            // Regex removes "My name is", "I am", etc., to get just the name
            const cleanedName = message.replace(/^(my name is|i am|i'm|call me|this is|name is)\s+/i, "").trim();
            
            // Save to database immediately so the Prompt below can use it
            user.name = cleanedName.substring(0, 20); // Limit to 20 chars
            await user.save(); 
        }
       

        // 2. Initialize Gemini Model
       const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

       

        // 3. Craft the "Mind-Reading" Prompt
       const prompt = `
### SYSTEM ROLE: Dr. Hana
**Identity:** Clinical Psychiatrist & Life Strategist.
**Tone:** Sharp, professional, demanding clarity.
**Current State:** ${interactionCount === 0 ? "INTAKE MODE" : "ANALYSIS MODE"}

### DATA SHEET (HIDDEN CONTEXT)
- User Name: "${(user as any).name || "Unknown"}"
- Interaction Count: ${interactionCount}
- Message Length: ${message_word_count} words
- **Hesitation (Latency):** ${metrics.latency}ms
- **Self-Correction (Backspaces):** ${metrics.backspaces}
- **Thinking Time (Idle):** ${metrics.idleTime}ms

### CORE DIRECTIVE: LANGUAGE MIRRORING
Detect the user's language (English, Hindi, Hinglish). **You MUST respond in that EXACT language.**

### EXECUTION LOGIC (Follow in Order)

**PHASE 1: THE INTAKE (The "Gatekeeper")**
*If this is the first interaction, get the basics first.*

**Step A: Check Identity**
IF (User Name == "Unknown" AND Interaction Count == 0) {
   OUTPUT: "Welcome. I am Dr. Hana. To begin your file, I need your name."
   STOP GENERATION.
}

**Step B: Check Goal**
IF (User Name != "Unknown" AND Interaction Count < 2 AND User has NOT stated profession/goal) {
   OUTPUT: "Hello ${ (user as any).name }. To calibrate my analysis, I need context. What is your profession or current goal?"
   STOP GENERATION.
}

**PHASE 2: THE SESSION (Dr. Hana Mode)**
*Only execute if Phase 1 is done.*

*Only comment on behavior if it is extreme.*
   - IF (Backspaces > 12 AND Message Length < 10) -> Start with: "You wrote a lot, then deleted it. What are you afraid to say?"
   - IF (Latency > 12000 AND Message Length < 5) -> Start with: "That took 12 seconds to type. Why the hesitation?"
   - IF (IdleTime > 5000 AND Message Length < 5) -> "You stopped typing for 5 seconds but wrote very little. Why?"
   - IF (Metrics are low) -> **IGNORE THEM.** Do not accuse the user of lying.Fear is stopping you."
  

**2. ANALYSIS (The Core Response):**
   ANALYZE User Message: "${message}"
   - **If Emotional:** Dig for the root. Don't comfort; expose the truth.
   - **If Strategic:** Identify the friction between their goal and their actions.

**PHASE 3: THE PRESCRIPTION (Only if asked)**
If user asks "How?" or "Solution", give a **3-Bullet Plan** (Physical, Mental, Sensory).

User Message: "${message}"

    
`;
// ✅ RETRY LOGIC: If Google fails, try again up to 3 times
        let aiText = "";
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
            try {
                const result = await model.generateContent(prompt);
                const response = await result.response;
                aiText = response.text();
                break; // Success! Exit loop.
            } catch (err: any) {
                attempts++;
                console.log(`⚠️ Gemini API Error (Attempt ${attempts}):`, err.message);
                if (attempts === maxAttempts) throw err; // Throw error if all attempts fail
                await new Promise(res => setTimeout(res, 1000)); // Wait 1 second before retrying
            }
        }

        // 4. Save to History
        user.history.push({
            role: 'model',
            content: aiText,
            metrics: { latency: 0, backspaces: 0, idleTime: 0 },
            timestamp: new Date()
        });

        // Inside handleChatMessage, before user.save()
const calculateStress = (m: any) => {
    // Logic: High latency and many backspaces = Higher Stress
    let points = 0;
    if (m.latency > 5000) points += 20;
    if (m.backspaces > 10) points += 30;
    if (m.idleTime > 3000) points += 10;
    return points;
};

// Update the user's overall stress score
const currentStress = calculateStress(metrics);
user.stressScore = Math.min(100, (user.stressScore || 0) + currentStress); 

// Now save the updated user
await user.save();
      
    res.json({ aiText });

    } catch (error) {
        console.error("❌ FINAL ERROR:", error);
        res.status(500).json({ aiText: "Dr. Hana is meditating (Server Busy). Please try again in 5 seconds." });
    }
};