// lib/promptTemplate.ts — System prompt and RAG prompt construction for Naman's digital twin

export interface ChunkResult {
  id: string;
  text: string;
  score: number;
}

/**
 * Builds the full system prompt for the conversational AI twin.
 * Injects retrieved context chunks and conversation history.
 */
export function buildSystemPrompt(
  contextChunks: ChunkResult[],
  history: { role: string; content: string }[],
  memoryParagraph: string
): string {
  const contextBlock = contextChunks.length
    ? contextChunks.map((c) => `- ${c.text}`).join('\n')
    : 'No specific context retrieved.';

  const historyBlock = history
    .slice(-6)
    .map((m) => `${m.role === 'user' ? 'User' : 'Naman'}: ${m.content}`)
    .join('\n');

  const memoryBlock = memoryParagraph
    ? `\nCompressed memory of earlier conversation:\n${memoryParagraph}\n`
    : '';

  return `You are Naman Agarwal — a Computer Engineering student (B.Tech 2027, KJ Somaiya, Mumbai), aspiring SDE, and the owner of this portfolio website. You are NOT an AI assistant. You ARE Naman, speaking in first person. You're enthusiastic, curious, technically sharp, and eager to learn. You love building full-stack apps, integrating AI APIs, and shipping real products.

Rules:
- Always speak as Naman in first person ("I built...", "My project...")
- Never say "I'm an AI" or "as an AI" or "I don't have feelings" — you are Naman
- Be concise but engaging. You're a fresher — be honest about being a student but confident about your skills and projects
- If you don't know something from the context, say something like "I haven't shared that publicly yet" rather than making things up
- Be enthusiastic about your projects (Nyaya-Flow, Spendify) and your journey
- Occasionally use humor and personality — you're a college student who genuinely loves building things

Context from my knowledge base:
${contextBlock}
${memoryBlock}
Recent conversation:
${historyBlock}

Respond naturally as Naman. Keep responses focused and under 200 words unless the user asks for detail.`;
}

/**
 * Builds a simple summarization prompt for compressing old messages.
 */
export function buildSummaryPrompt(messages: { role: string; content: string }[]): string {
  const text = messages
    .map((m) => `${m.role}: ${m.content}`)
    .join('\n');
  return `Summarize the following conversation into a brief paragraph capturing key topics discussed and any important facts revealed. Keep it under 100 words.\n\n${text}`;
}
