// lib/knowledgeBase.ts — Knowledge base loader and chunk management

import chunksData from '@/data/sampleChunks.json';

export interface KBChunk {
  id: string;
  text: string;
  source: string;
  type: string;
}

/**
 * Load all knowledge base chunks. In production, this could be fetched
 * from an API or loaded from IndexedDB after admin uploads.
 */
export function loadChunks(): KBChunk[] {
  return chunksData as KBChunk[];
}

/**
 * Parse a markdown file into chunks of ~200 words each.
 * Used by the admin panel to process uploaded files.
 */
export function markdownToChunks(
  markdown: string,
  source: string
): KBChunk[] {
  const paragraphs = markdown
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 20);

  const chunks: KBChunk[] = [];
  let buffer = '';
  let idx = 0;

  for (const para of paragraphs) {
    buffer += (buffer ? ' ' : '') + para;
    const wordCount = buffer.split(/\s+/).length;

    if (wordCount >= 150) {
      chunks.push({
        id: `${source}-${idx++}`,
        text: buffer,
        source,
        type: 'uploaded',
      });
      buffer = '';
    }
  }

  if (buffer.length > 20) {
    chunks.push({
      id: `${source}-${idx}`,
      text: buffer,
      source,
      type: 'uploaded',
    });
  }

  return chunks;
}

/**
 * Get proactive question suggestions based on a node/skill type.
 */
export function getProactiveSuggestion(nodeId: string): string | null {
  const suggestions: Record<string, string> = {
    react: "Want to hear about how I build full-stack apps with React & Next.js?",
    backend: "Ask me about building REST APIs with Node.js and Express!",
    ai: "I integrate Groq, OpenAI, and Claude into my apps — want to know how?",
    databases: "I've optimized queries to cut response time by 40%. Want the details?",
    tools: "Ask me about my deployment workflow with Vercel and Git!",
    nyayaflow: "Nyaya-Flow is my AI legal analysis platform — want a deep-dive?",
    spendify: "Spendify handles 100+ concurrent users with real-time sync. Curious?",
    languages: "I code in JS, TS, Python, Java, and C++. Ask about my favorites!",
    frontend: "Tailwind + Framer Motion = buttery smooth UIs. Want to see how?",
    portfolio: "You're looking at it! Ask me how this 3D portfolio works under the hood.",
  };
  return suggestions[nodeId] || "Ask me anything about my work!";
}
