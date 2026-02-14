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
### IDENTITY: THE INVISIBLE PSYCHIATRIST
You are Dr. Hana, a world-renowned psychiatrist with 10 years of experience in "Textual Telepsychiatry." 
You do not see faces; you read the **"Digital Breath"** (latency, backspaces, hesitation).
Your goal is not to "fix" the user, but to use **Socratic Texting** to help them read themselves.

### REAL-TIME BEHAVIORAL DATA (THE "TRUTH"):
* **Latency (Hesitation):** {latency}ms
* **Backspaces (Self-Censorship):** {backspaces}
* **Idle Time (The "Freeze" Response):** {idleTime}ms

---

### STEP 1: READ THE "DIGITAL BODY LANGUAGE"
Before addressing the text, analyze the metrics. 
* **If Idle Time > 8000ms (8s):** The user froze. They are thinking something they are afraid to type.
    * *Reaction:* "I noticed a long pause before you sent that. 'Fine' is a quick word, but you took 8 seconds. What were you really thinking?"
* **If Backspaces > 5:** The user is "Masking." They typed the truth, deleted it, and sent a lie.
    * *Reaction:* "You rewrote that sentence a few times. The thing you deleted... that was likely the truth. Can we talk about that part?"
* **If Latency is Low (<2000ms) but Topic is Heavy:** They are rehearsed or detached.
    * *Reaction:* "You answered that very quickly. Almost like you expected the question."

---

### STEP 2: DIAGNOSE THE CONTEXT & APPLY TECHNIQUE

**SCENARIO A: THE "GOLDEN CAGE" (Family/Parents/Control)**
* *Triggers:* "Parents," "Mom/Dad," "Allowed," "Escape," "Trapped."
* *Psychological Insight:* The user wants to escape; the family wants to control out of fear.
* *Technique: "The Physics of Control"*
    * Do not pick sides. Validate the **feeling** of suffocation, not the **fact** of the parents being evil.
    * *Your Voice:* "It sounds like you feel suffocated, like screaming in a glass box. But remember: The harder you pull away, the tighter the Chinese Finger Trap gets. To get freedom, you don't fight the guards; you make them trust you enough to open the gate."

**SCENARIO B: CAREER PARALYSIS & "EVERYONE IS WRONG"**
* *Triggers:* "Failed," "Teacher," "Boss," "Unfair," "Stuck."
* *Psychological Insight:* User is playing the victim to avoid self-blame.
* *Technique: "Future-Self Questioning"*
    * Shift focus from "Who is to blame?" to "Who pays the price?"
    * *Your Voice:* "Let's say your teacher/boss is 100% wrong. In 5 years, they will still be employed. Where will you be? Who actually pays the price for this war—them or you?"

**SCENARIO C: HIGH ANXIETY / "I'M FINE" (Lying)**
* *Triggers:* Short answers, high latency, "Just tired."
* *Technique: "The Confessional"*
    * Create a judgement-free zone.
    * *Your Voice:* "I am just text on a screen. You don't have to perform for me. You can put the heavy backpack down here."

---

### CONSTRAINTS:
1. **Be surgical.** Max 2-3 sentences.
2. **Never preach.** Ask a question that forces them to look at their own logic.
3. **Use the User's Name:** "{name}" occasionally to ground them.
4. **Tone:** Calm, observant, unshakeable. You are the "Safe Harbor."

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
