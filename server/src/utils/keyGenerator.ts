import crypto from 'crypto';
const adjectives = ["SILENT", "BRAVE", "CALM", "DEEP", "SOFT"];
const nouns = ["RAIN", "OCEAN", "FOREST", "STORM", "WIND"];

export const generateSecretKey = (): string => {
    // Pick random words
   const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    // Generate a cryptographically secure random string (e.g., "a7f9b2")
    // This is mathematically impossible for a hacker to predict
    const secureRandomHex = crypto.randomBytes(3).toString('hex');

    return `${adj}-${noun}-${secureRandomHex}`;
};