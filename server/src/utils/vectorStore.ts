// src/utils/vectorStore.ts
import { Pinecone } from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone';
import { Embeddings, EmbeddingsParams } from "@langchain/core/embeddings";

// Google Gemini 384-dimensional Embeddings class for Pinecone
class GeminiEmbeddings extends Embeddings {
  private apiKey: string;
  private modelName: string;
  private outputDimensionality: number;

  constructor(fields?: { apiKey?: string; modelName?: string; outputDimensionality?: number } & EmbeddingsParams) {
    super(fields ?? {});
    this.apiKey = fields?.apiKey || process.env.GEMINI_API_KEY || "";
    this.modelName = fields?.modelName || "gemini-embedding-001";
    this.outputDimensionality = fields?.outputDimensionality || 384;
  }

  private async _embed(text: string): Promise<number[]> {
    const key = this.apiKey || process.env.GEMINI_API_KEY || "";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:embedContent`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "x-goog-api-key": key,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        content: { parts: [{ text }] },
        outputDimensionality: this.outputDimensionality
      })
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini Embedding Error: ${res.status} ${err}`);
    }

    const data = await res.json();
    return data.embedding.values;
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map(t => this._embed(t)));
  }

  async embedQuery(text: string): Promise<number[]> {
    return this._embed(text);
  }
}

// Export the connection function
export const getVectorStore = async () => {
  const indexName = process.env.PINECONE_INDEX;
  if (!indexName) {
    throw new Error("PINECONE_INDEX is not defined");
  }

  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });

  const pineconeIndex = pinecone.Index(indexName);

  const embeddings = new GeminiEmbeddings({
    apiKey: process.env.GEMINI_API_KEY,
    modelName: "gemini-embedding-001",
    outputDimensionality: 384
  });

  return await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    maxConcurrency: 5
  });
};