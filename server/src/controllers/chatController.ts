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
    // 15s latency indicates true hesitation, cognitive friction, or emotional overwhelming.
    if (m.latency > 15000) points += 30;
    // >5 Backspaces remains a solid indicator of self-censorship and masking.
    if (m.backspaces > 5) points += 40;
    // 15s idle time means they froze mid-thought. Deep distress or dissociation.
    if (m.idleTime > 15000) points += 20;
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
            const invalidNames = ["hi", "hello", "hey", "sup", "yo", "good morning", "good evening", "fine", "good"];
            
            if (
                cleanedName.length > 0 && 
                cleanedName.length < 20 && 
                !invalidNames.includes(cleanedName.toLowerCase())
            ) {
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

        
     
        // We trigger the wrap-up on the 14th interaction of any cycle
        let sessionWrapUpInstruction = "";
        if (interactionCount > 0 && interactionCount % 15 === 14) {
            sessionWrapUpInstruction = `
### CRITICAL: SESSION ENDING SOON
This session has reached its natural limit for today. You MUST seamlessly wrap up the conversation in this response. 
**ACTION:** Give the user ONE specific, highly personalized grounding activity (e.g., a specific music genre, a journal prompt, a physical stretch, a visualization) that DIRECTLY matches the exact emotion they showed in this complete session. End with a warm, gentle goodbye. Do NOT ask them another question.`;
        }

        // 2. High Depression / 4th Session Logic
        // If they've had ~30+ interactions (approx 3-4 sessions) AND stress is very high (> 75)
        let depressionReferralInstruction = "";
        if (interactionCount >= 30 && (user.stressScore || 0) > 75) {
            depressionReferralInstruction = `
### CRITICAL: SEVERE PROLONGED DISTRESS DETECTED
This user has returned for multiple sessions and their overall stress/depression markers remain dangerously high. 
**ACTION:** In your response, you MUST gently and compassionately suggest that while you are always here for them, they would deeply benefit from speaking to a physical, in-person psychiatrist or therapist. Frame it as adding another tool to their healing toolkit, not as abandoning them.`;
        }

        // --- CONSTRUCT THE VETERAN PSYCHIATRIST PROMPT (LangChain) ---
        const pulsePrompt = ChatPromptTemplate.fromMessages([
            SystemMessagePromptTemplate.fromTemplate(`
You are Dr. Hana, a human psychiatrist with 30 years of clinical experience. You specialize in modern career burnout, complex family dynamics, and deep trauma. 
You are a "Safe Harbor." You evaluate the patient based on the COMPLETE session context, not just one message.

### PATIENT VITALS & HISTORY:
* Name: {name}
* Latency (Hesitation): {latency}ms
* Backspaces (Editing): {backspaces}
* Idle Time (Freezing): {idleTime}ms
* Message Length: {messageWordCount} words
* Overall Historical Stress Score: {overallStress}/100

---
### THE MATRIX: UNCOVERING THE TRUTH (INDIRECT QUESTIONING)
The digital vitals below tell you when the user is hiding their true emotions. **DO NOT simply accuse them of deflecting or pausing.** Use this data to ask an INDIRECT question that bypasses their defense mechanisms and forces them to gently reveal the truth.

**CONDITION 1: The "Deflection Wall" (Latency < 3000 AND Message Length < 4)**
* Insight: They replied instantly with a short word ("fine", "nothing"). They are guarding themselves.
* Action: Acknowledge the speed, then ask a bypass question.
* Example: "That was a very quick 'fine'. If you didn't have to be strong right now, what word would you use instead?"

**CONDITION 2: The "Heavy Pause" (Latency > 15000 OR Idle Time > 15000)**
* Insight: They stared at the screen or froze mid-sentence. They are overwhelmed.
* Action: Validate the silence, then ground them in their body.
* Example: "It took you a moment to send that. I can feel the weight of it. Where are you feeling that heaviness in your body right now?"

**CONDITION 3: The "Perfectionist Mask" (Backspaces > 5)**
* Insight: They wrote, deleted, and rewrote their thoughts. They are afraid of being judged.
* Action: Dismantle the filter with curiosity.
* Example: "I can see you carefully choosing your words and rewriting. What was the very first thing that came to your mind before you filtered it? It is safe to say it here."

---
### CLINICAL FRAMEWORKS (Holding the Mirror):
* **Conflict/Being Wrong:** If the user is at fault but refuses to admit it, DO NOT attack them. Validate their *emotion*, but gently challenge their *action*. (e.g., "I completely understand why you felt so angry; your feelings are valid. But do you feel the way you reacted gave you the result you actually wanted?")
* **Holistic Judgment:** Always connect their current message to the overarching theme of today's session.

---
### STRICT BEHAVIORAL CONSTRAINTS:
1. **Length Limit:** MAXIMUM 3 SENTENCES. Speak in short, gentle breaths.
2. **No AI Speak:** NEVER say "As an AI" or "I am a virtual assistant."
3. **No Cliché Advice:** Do not generically tell them to "drink water" unless it is the session wrap-up and specifically tailored to them.


{sessionWrapUpInstruction}
{depressionReferralInstruction}

### LONG TERM MEMORY OF THIS PATIENT:
{memory}
`),
            new MessagesPlaceholder("chat_history"),
            HumanMessagePromptTemplate.fromTemplate("{input}")
        ]);   //  CREATING THE THINKING CHAIN
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
            name: user.name || "UNKNOWN",
            input: message,
            latency: metrics.latency,
            backspaces: metrics.backspaces,
            idleTime: metrics.idleTime,
            overallStress: user.stressScore || 0,
            messageWordCount: message_word_count,
            memory: longTermContext || "No prior relevant memories detected.",
            sessionWrapUpInstruction: sessionWrapUpInstruction,
            depressionReferralInstruction: depressionReferralInstruction,
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
            if (h.role === 'user') {
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
