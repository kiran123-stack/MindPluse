const adjectives = ["SILENT", "BRAVE", "CALM", "DEEP", "SOFT"];
const nouns = ["RAIN", "OCEAN", "FOREST", "STORM", "WIND"];

export const generateSecretKey = (): string => {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(Math.random() * 100);
    return `${adj}-${noun}-${num}`; 
};