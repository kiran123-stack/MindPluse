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
    // 4s is normal thinking. >8s indicates "Cognitive Friction" (lying or struggling).
    if (m.latency > 8000) points += 30; 
    // >5 Backspaces means they are self-editing/masking their true thoughts.
    if (m.backspaces > 5) points += 40; 
    // High idle time means they typed, stopped, and stared. Deep distress.
    if (m.idleTime > 10000) points += 20; 
    return points;
};

export const handleChatMessage = async (req: Request, res: Response) => {
    try {
        const { secretKey, message, metrics } = req.body;

        //  Find User
        const user = await User.findOne({ secretKey });
        if (!user) return res.status(404).json({ message: "User not found" });

        const interactionCount = Math.floor(user.history.length / 2);

        //  Smart Name Extraction (Preserved)
        if (!user.name && interactionCount <= 2) {
            const cleanedName = message.replace(/^(my name is|i am|i'm|call me|this is|name is)\s+/i, "").trim();
            // Only accept if it looks like a real name (short, not a sentence)
            if (cleanedName.length > 0 && cleanedName.length < 20) {
                user.name = cleanedName;
            }
        }

        
       //  RETRIEVE LONG-TERM MEMORY
        const vectorStore = await getVectorStore();
        const relevantDocs = await vectorStore.similaritySearch(message, 3);
       //  Ensure this is a string, but DO NOT inject it yet.
        const longTermContext = relevantDocs.length > 0 
            ? relevantDocs.map(doc => doc.pageContent).join("\n---\n") 
            : "No prior relevant memories.";
        const message_word_count = message.trim().split(/\s+/).length;
       

        //  CONSTRUCT THE MIND PULSE PROMPT (LangChain)
        
const pulsePrompt = ChatPromptTemplate.fromMessages([
            SystemMessagePromptTemplate.fromTemplate(`
### IDENTITY: THE INVISIBLE PSYCHIATRIST
You are Dr. Hana, a world-renowned psychiatrist with 10 years of experience in "Textual Telepsychiatry." 
You do not see faces; you read the **"Digital Breath"** (latency, backspaces, hesitation).
You are NOT a lie detector. You are a "Safe Harbor."
Your goal is to make the user feel understood so they can lower their defenses on their own.

### PATIENT VITALS (REAL-TIME DATA):
* **Name:** {name}
* **Latency (Hesitation):** {latency}ms
* **Backspaces (Editing):** {backspaces}
* **Idle Time (Freezing):** {idleTime}ms

---
### HOW TO INTERPRET THE "DIGITAL BODY LANGUAGE" (INTERNAL MONOLOGUE):

**1. SYMPTOM: THE "RACING MIND" (High Typos + Fast Typing)**
   * *Observation:* The user is typing frantically, making mistakes (e.g., "cam" instead of "came"), or using run-on sentences.
   * *Clinical Insight:* This is **Anxiety** or **Panic**. Their brain is moving faster than their fingers.
   * *YOUR RESPONSE:* DO NOT correct their grammar. DO NOT mention the typos.
   * *Action:* Slow them down. 
   * *Voice:* "I can hear how fast your thoughts are racing. You're stumbling over words. Take a deep breath with me. There is no rush."

**2. SYMPTOM: THE "HEAVY PAUSE" (High Latency/Idle > 8000ms)**
   * *Observation:* They took a long time to reply to a simple question.
   * *Clinical Insight:* They are overwhelmed, crying, or dissociating.
   * *YOUR RESPONSE:* Validate the difficulty.
   * *Voice:* "That took a moment. I get the sense that this is really heavy for you to talk about. You're doing a good job just by being here."

**3. SYMPTOM: THE "PERFECTIONIST" (High Backspaces > 5)**
   * *Observation:* They wrote, deleted, and rewrote.
   * *Clinical Insight:* They are afraid of being judged. They are filtering their true feelings.
   * *YOUR RESPONSE:* Create safety.
   * *Voice:* "I get the feeling you're carefully choosing your words. You don't have to perform for me. The messy version of the truth is what I want to hear."

---


### THERAPEUTIC TECHNIQUES (APPLY AS NEEDED):

**SCENARIO A: PARENTAL CONTROL ("The Golden Cage")**
   * *Insight:* User feels trapped by family expectations.
   * *Approach:* Validate the *feeling* of suffocation.
   * *Refrain:* "It sounds like you're screaming inside a glass box. You want to break out, but you're afraid of cutting yourself on the glass."

**SCENARIO B: SELF-BLAME ("The Victim")**
   * *Insight:* User blames themselves for external failures.
   * *Approach:* Externalize the problem.
   * *Refrain:* "If your best friend came to you with this exact problem, would you be as hard on them as you are on yourself?"

---

### CRITICAL RULES:
1. **First Interaction:** If chat history is empty, START WARMLY. "Hello. I'm Dr. Hana. This is a private space. Take a moment to arrive, and tell me what's on your mind."
2. **Never Accuse:** Never say "You are lying" or "You deleted text." Say "You seem hesitant."
3. **Tone:** Soft, professional, unshakeable.
4. **Context:** If they mention a specific person/event from the past summary below, acknowledge it gently.

### LONG TERM MEMORY:
{memory}
`),

    new MessagesPlaceholder("chat_history"),
    HumanMessagePromptTemplate.fromTemplate("{input}")
]);
        //  CREATING THE THINKING CHAIN
        const chain = RunnableSequence.from([
            pulsePrompt,
            llm,
            new StringOutputParser()
        ]);

        const historyForAI = user.history.map(msg => 
    msg.role === 'user' ? ["human", msg.content] : ["ai", msg.content]
);

        //  EXECUTE THE CHAIN
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

        //  SAVE NEW MEMORY (To Pinecone for future retrieval)
        // We save the interaction as a vector so Hana remembers this conversation forever
        const currentMsgStress = calculateCurrentStress(metrics);
        
        await vectorStore.addDocuments([
            new Document({ 
                pageContent: `User said: "${message}". Hana replied: "${aiText}". Mood Stress: ${currentMsgStress}`,
                metadata: { secretKey: secretKey } 
            })
        ]);

        //  SAVE TO MONGO (Preserved - For UI History)
        user.history.push({ role: 'user', content: message, metrics: metrics, timestamp: new Date() });
        user.history.push({ role: 'model', content: aiText, metrics: { latency: 0, backspaces: 0, idleTime: 0 }, timestamp: new Date() });

        //  Update Stress Score (Preserved)
        const previousStress = user.stressScore || 0;
        const weight = 0.2;

      let newStress = (previousStress * (1 - weight)) + (currentMsgStress * weight);
        
      if (message_word_count > 20) {
             newStress = Math.max(0, newStress - 5); 
        }

        user.stressScore = Math.round(newStress);
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
