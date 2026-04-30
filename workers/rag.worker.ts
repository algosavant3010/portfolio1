// workers/rag.worker.ts — Web Worker for embedding generation and vector search
// Runs Transformers.js in a separate thread to avoid blocking the UI

import { cosineSimilarity } from '@/lib/vectorSearch';

interface Chunk {
  id: string;
  text: string;
  source: string;
  type: string;
}

interface EmbeddedChunk extends Chunk {
  embedding: number[];
}

let pipeline: any = null;
let embeddedChunks: EmbeddedChunk[] = [];
let isReady = false;

/**
 * Initialize the embedding pipeline and embed all chunks.
 */
async function initialize(chunks: Chunk[]) {
  try {
    self.postMessage({ type: 'status', message: 'Loading embedding model...' });

    // Dynamic import of transformers.js
    const { pipeline: createPipeline } = await import('@xenova/transformers');

    pipeline = await createPipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
      progress_callback: (progress: any) => {
        if (progress.status === 'progress') {
          self.postMessage({
            type: 'progress',
            value: progress.progress || 0,
            message: `Loading model: ${Math.round(progress.progress || 0)}%`,
          });
        }
      },
    });

    self.postMessage({ type: 'status', message: 'Embedding knowledge base...' });

    // Embed all chunks
    embeddedChunks = [];
    for (let i = 0; i < chunks.length; i++) {
      const output = await pipeline(chunks[i].text, {
        pooling: 'mean',
        normalize: true,
      });
      embeddedChunks.push({
        ...chunks[i],
        embedding: Array.from(output.data),
      });

      self.postMessage({
        type: 'embed-progress',
        value: ((i + 1) / chunks.length) * 100,
        message: `Embedded ${i + 1}/${chunks.length} chunks`,
      });
    }

    isReady = true;
    self.postMessage({ type: 'ready' });
  } catch (error: any) {
    self.postMessage({ type: 'error', message: error.message || 'Failed to initialize RAG worker' });
  }
}

/**
 * Search for the top-k most relevant chunks given a query.
 */
async function search(query: string, topK: number = 3) {
  if (!isReady || !pipeline) {
    self.postMessage({ type: 'error', message: 'RAG worker not initialized' });
    return;
  }

  try {
    const queryOutput = await pipeline(query, {
      pooling: 'mean',
      normalize: true,
    });
    const queryEmbedding = Array.from(queryOutput.data) as number[];

    // Compute cosine similarity with all chunks
    const results = embeddedChunks
      .map((chunk) => ({
        id: chunk.id,
        text: chunk.text,
        score: cosineSimilarity(queryEmbedding, chunk.embedding),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    self.postMessage({ type: 'results', results });
  } catch (error: any) {
    self.postMessage({ type: 'error', message: error.message || 'Search failed' });
  }
}

// Message handler
self.onmessage = async (event: MessageEvent) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'init':
      await initialize(payload.chunks);
      break;
    case 'search':
      await search(payload.query, payload.topK);
      break;
    default:
      self.postMessage({ type: 'error', message: `Unknown message type: ${type}` });
  }
};
