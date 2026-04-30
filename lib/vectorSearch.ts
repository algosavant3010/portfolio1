// lib/vectorSearch.ts — Cosine similarity search over pre-embedded chunks
// This module is designed to run in a Web Worker (see workers/rag.worker.ts)

export interface Chunk {
  id: string;
  text: string;
  source: string;
  type: string;
}

export interface EmbeddedChunk extends Chunk {
  embedding: number[];
}

/**
 * Compute cosine similarity between two vectors.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

/**
 * Search embedded chunks for the top-k most similar to the query embedding.
 */
export function searchChunks(
  queryEmbedding: number[],
  chunks: EmbeddedChunk[],
  topK: number = 3
): { id: string; text: string; score: number }[] {
  const scored = chunks.map((chunk) => ({
    id: chunk.id,
    text: chunk.text,
    score: cosineSimilarity(queryEmbedding, chunk.embedding),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}
