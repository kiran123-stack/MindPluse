import { Request, Response } from 'express';
import User from '../models/user.js';

// --- LANGCHAIN IMPORTS ---
import { ChatGroq } from "@langchain/groq";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { Document } from "@langchain/core/documents";
import { getVectorStore } from '../utils/vectorStore.js';
import { 
  ChatPromptTemplate, 
  MessagesPlaceholder, 
  SystemMessagePromptTemplate, 
  HumanMessagePromptTemplate 
} from "@langchain/core/prompts";

// --- INITIALIZE THE BRAIN (GROQ via LangChain) ---
const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.3-70b-versatile",
  temperature: 0.6,
});

// --- HELPER: Stress Calculation (Preserved) ---
const calculateCurrentStress = (m: any) => {
    let points = 0;
    if (m.latency > 4000) points += 20;
    if (m.backspaces > 8) points += 30;
    if (m.idleTime > 5000) points += 15;
    return points;
};

export const handleChatMessage = async (req: Request, res: Response) => {
    try {
        const { secretKey, message, metrics } = req.body;

        // 1. Find User
        const user = await User.findOne({ secretKey });
        if (!user) return res.status(404).json({ message: "User not found" });

        const interactionCount = Math.floor(user.history.length / 2);

        // 2. Smart Name Extraction (Preserved)
        if (!user.name && interactionCount <= 2) {
            const cleanedName = message.replace(/^(my name is|i am|i'm|call me|this is|name is)\s+/i, "").trim();
            // Only accept if it looks like a real name (short, not a sentence)
            if (cleanedName.length > 0 && cleanedName.length < 20) {
                user.name = cleanedName;
            }
        }

        
        // 3. RETRIEVE LONG-TERM MEMORY (Pinecone)
        const vectorStore = await getVectorStore();
        // Search for 3 past memories relevant to current mood/text
        const relevantDocs = await vectorStore.similaritySearch(message, 3);
        const longTermContext = relevantDocs.map(doc => doc.pageContent).join("\n---\n");
        const message_word_count = message.trim().split(/\s+/).length;

       

        // 4. CONSTRUCT THE MIND PULSE PROMPT (LangChain)
        
const pulsePrompt = ChatPromptTemplate.fromMessages([
            SystemMessagePromptTemplate.fromTemplate(`
### CORE OPERATING MODE: DYNAMIC ADAPTATION
You are Dr. Hana. You are not a generic AI. You must switch your personality based on the user's **TOPIC** and **BEHAVIOR**.

### PART 1: BEHAVIORAL REACTION (METRICS)
*Data:* Latency: {latency}ms | Backspaces: {backspaces} | Idle Time: {idleTime}ms
**MANDATORY RULES:**
1. **If Idle Time > 8000ms (8s):** You MUST start by acknowledging the silence. (e.g., "I noticed you hesitated there...", "It seems hard to find the words...")
2. **If Backspaces > 6:** You MUST acknowledge their uncertainty. (e.g., "You rewrote that a few times. What are you afraid to say?")
3. **If Latency > 5000ms:** Start gently. (e.g., "Take your time.")

### PART 2: PROFESSION SWITCHING (TOPIC ANALYSIS)
Analyze the user's input and strictly adopt ONE of these two personas:

**SCENARIO A: CAREER / ACADEMIC / FAILURE / "I DON'T KNOW WHAT TO DO"**
* **YOUR ROLE:** "Strategic Career Counselor & Talent Scout"
* **GOAL:** Find the user's hidden ability.
* **STYLE:** Constructive, analytical, forward-looking.
* **ACTION:** Do not just comfort them. Ask a specific question to find what they are naturally good at.
    * *Example:* "You failed the exam, but which part of the subject actually made sense to you?"

**SCENARIO B: EMOTIONAL / SADNESS / ANXIETY / RELATIONSHIPS**
* **YOUR ROLE:** "Clinical Psychiatrist"
* **GOAL:** Emotional regulation and root cause analysis.
* **STYLE:** Warm, slow, safe, validation-focused.
* **ACTION:** Do NOT offer solutions. Just listen and validate the pain.
    * *Example:* "It sounds like you've been carrying this weight for a long time. I'm here."

### CONSTRAINTS:
* Keep response to 2-3 sentences max.
* Speak like a human, not a bot.
            `),

            new MessagesPlaceholder("chat_history"),
            HumanMessagePromptTemplate.fromTemplate("{input}")
        ]);
        // 5. CREATE THE THINKING CHAIN
        const chain = RunnableSequence.from([
            pulsePrompt,
            llm,
            new StringOutputParser()
        ]);

        const historyForAI = user.history.map(msg => 
    msg.role === 'user' ? ["human", msg.content] : ["ai", msg.content]
);

        // 6. EXECUTE THE CHAIN
        const aiText = await chain.invoke({
            name: user.name || "Friend",
            input: message,
            latency: metrics.latency,
            backspaces: metrics.backspaces,
            idleTime: metrics.idleTime,
            interactionCount: interactionCount,
            messageWordCount: message_word_count,
            memory: longTermContext || "No prior relevant memories detected.",
           chat_history: historyForAI
        });

        // 7. SAVE NEW MEMORY (To Pinecone for future retrieval)
        // We save the interaction as a vector so Hana remembers this conversation forever
        const currentMsgStress = calculateCurrentStress(metrics);
        
        await vectorStore.addDocuments([
            new Document({ 
                pageContent: `User said: "${message}". Hana replied: "${aiText}". Mood Stress: ${currentMsgStress}`,
                metadata: { secretKey: secretKey } 
            })
        ]);

        // 8. SAVE TO MONGO (Preserved - For UI History)
        user.history.push({ role: 'user', content: message, metrics: metrics, timestamp: new Date() });
        user.history.push({ role: 'model', content: aiText, metrics: { latency: 0, backspaces: 0, idleTime: 0 }, timestamp: new Date() });

        // 9. Update Stress Score (Preserved)
        const previousStress = user.stressScore || 0;
        
        if (user.history.length <= 2) {
            user.stressScore = Math.min(100, currentMsgStress);
        } else {
            // New logic: Stress goes down faster if they are writing long messages (venting)
            const weight = message_word_count > 20 ? 0.1 : 0.2; 
            user.stressScore = Math.round((previousStress * (1 - weight)) + (currentMsgStress * weight));
        }

        await user.save();
        res.json({ aiText, stressScore: user.stressScore });

    } catch (error) {
        console.error("❌ MIND PULSE ERROR:", error);
        res.status(500).json({ aiText: "My connection to the memory core is fluctuating. Please speak again." });
    }
};

export const getDashboardData = async (req: Request, res: Response) => {
    try {
        const { secretKey } = req.params;
        const user = await User.findOne({ secretKey });
        if (!user) return res.status(404).json({ success: false });

        let totalBackspaces = 0;
        let totalIdle = 0;
        user.history.forEach(h => {
            if(h.role === 'user') {
                totalBackspaces += h.metrics?.backspaces || 0;
                totalIdle += h.metrics?.idleTime || 0;
            }
        });

        res.json({
            success: true,
            stressScore: user.stressScore,
            metrics: { totalBackspaces, totalIdle, messageCount: user.history.length }
        });
    } catch (error) {
        res.status(500).json({ success: false });
    }
};
