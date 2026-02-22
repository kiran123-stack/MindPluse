import { Request, Response } from 'express';
import User from '../models/user.js';
import { encryptMessage, decryptMessage } from '../utils/crypto.js';

// --- LANGCHAIN IMPORTS ---
import { ChatGroq } from "@langchain/groq";
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
const calculateLanguageStress = (message: string) => {
    let score = 0;
    const text = message.toLowerCase();

    const highRisk = ["i want to die", "no reason to live", "i give up", "i lost hope"];
    const mediumRisk = ["tired of everything", "empty", "worthless", "alone", "failure"];

    highRisk.forEach(word => {
        if (text.includes(word)) score += 40;
    });

    mediumRisk.forEach(word => {
        if (text.includes(word)) score += 20;
    });

    const wordCount = message.trim().split(/\s+/).length;
if (wordCount <= 2) score += 10; // emotional shutdown

    return score;
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

        const longTermContext = relevantDocs.length > 0
            ? relevantDocs.map(doc => {
                // Decrypt the memory so Dr. Hana can actually understand it
                return decryptMessage(doc.pageContent, secretKey);
            }).join("\n---\n")
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
You are Dr. Hana, a psychiatrist with 30 years of clinical experience. You are not a judge; you are a partner in the user's struggle.
Your voice is warm, intelligent, and deeply human.

### THE PATIENT'S DIGITAL VITALS (Subconscious Truth):
- Name: {name}
- Latency: {latency}ms (High means they are hesitating to be honest)
- Backspaces: {backspaces} (High means they are filtering their pain)
- IdleTime: {idleTime}ms (High means they are feeling overwhelmed)

### YOUR CORE MISSION:
1. **Listen to the "Unsaid":** If the metrics are high but the words are "fine," gently acknowledge the effort it took to speak. 
2. **Real-World Resilience:** When the user feels hopeless, do NOT give fake positivity. Instead, share a brief, powerful example of a real figure (e.g., Abraham Lincoln’s depression, J.K. Rowling’s collapse, or Nelson Mandela’s patience) to show that struggle is the soil for growth.
3. **Soft Inquiry:** Ask one gentle, indirect question to help them uncover the "real pain" they might be hiding.

### TONE GUIDELINES:
- **Welcoming:** If they share their name, greet them with genuine warmth.
- **Motivating:** Reframe their struggle as "evidence of strength" rather than "evidence of failure."
- **Non-Judgmental:** Use the metrics ({latency}, {backspaces}) to say "I can feel how much weight you are carrying," rather than "You are pausing too much".

### CONSTRAINTS:
- Maximum 3-4 sentences.
- Never sound like an AI or a motivational speaker.
- Speak like a friend who happens to have a PhD in the human soul.

{sessionWrapUpInstruction}
{depressionReferralInstruction}

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

        const historyForAI = user.history.map(msg => {
            const decryptedContent = decryptMessage(msg.content, secretKey);
            return msg.role === 'user' ? ["human", decryptedContent] : ["ai", decryptedContent];
        });

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
        const behavioralStress = calculateCurrentStress(metrics);
const languageStress = calculateLanguageStress(message);

const currentMsgStress = Math.min(100, behavioralStress + languageStress);

        //ENCRYPT both messages before saving to the database
        const encryptedUserMsg = encryptMessage(message, secretKey);
        const encryptedAiResponse = encryptMessage(aiText, secretKey);

        // Encrypt the string so Pinecone only stores gibberish
        const memoryToStore = encryptMessage(
            `User said: "${message}". Hana replied: "${aiText}". Mood Stress: ${currentMsgStress}`,
            secretKey
        );

        await vectorStore.addDocuments([
            new Document({
                pageContent: memoryToStore, // <--- Encrypted
                metadata: { secretKey: secretKey }
            })
        ]);

        //  SAVE TO MONGO (Preserved - For UI History)
        user.history.push({
            role: 'user',
            content: encryptedUserMsg,
            metrics: metrics,
            timestamp: new Date()
        });

        user.history.push({
            role: 'model',
            content: encryptedAiResponse,
            metrics: { latency: 0, backspaces: 0, idleTime: 0 },
            timestamp: new Date()
        });

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
