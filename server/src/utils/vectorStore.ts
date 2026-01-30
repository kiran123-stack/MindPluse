// src/utils/vectorStore.ts
import { Pinecone } from '@pinecone-database/pinecone';  // piecone and hugging face it enable ai to remember long term conversations
import { PineconeStore } from '@langchain/pinecone';
import { HuggingFaceInferenceEmbeddings } from '@langchain/community/embeddings/hf';

// 1. Initialize the "Translator" (Embeddings) - FREE 
const embeddings = new HuggingFaceInferenceEmbeddings({
  apiKey: process.env.HUGGINGFACEHUB_API_TOKEN,
  model: "sentence-transformers/all-MiniLM-L6-v2", // Efficient & Free 384-dim model 
});

// 2. Initialize the "MemoryVault" (Pinecone)
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);

// 3. Export the connection function
export const getVectorStore = async () => {
  const IndexName = process.env.PINECONE_INDEX;
  if(!IndexName) {
    throw new Error("PINECONE_INDEX is not defined");
  }

  const pineconeIndex = pinecone.Index(IndexName)

  return await PineconeStore.fromExistingIndex(embeddings,{
    pineconeIndex,
    maxConcurrency: 5
  })
};