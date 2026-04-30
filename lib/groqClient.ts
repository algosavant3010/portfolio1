// lib/groqClient.ts — Groq API client for fast LLM inference (free tier)
// Uses llama-3.1-8b-instant for fast, free responses

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Stream a chat completion from Groq API.
 * Requires NEXT_PUBLIC_GROQ_API_KEY env var.
 * Yields partial content strings as they arrive.
 */
export async function* streamGroqChat(
  messages: GroqMessage[],
  apiKey?: string
): AsyncGenerator<string, void, unknown> {
  const key = apiKey || process.env.NEXT_PUBLIC_GROQ_API_KEY || '';
  if (!key) {
    yield 'Groq API key not configured. Please set NEXT_PUBLIC_GROQ_API_KEY in your .env.local file.';
    return;
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    yield `Groq API error (${response.status}): ${errText}`;
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    yield 'Failed to read response stream.';
    return;
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;
      const data = trimmed.slice(6);
      if (data === '[DONE]') return;

      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) yield delta;
      } catch {
        // Skip malformed JSON lines
      }
    }
  }
}

/**
 * Non-streaming Groq call for summarization etc.
 */
export async function groqChat(
  messages: GroqMessage[],
  apiKey?: string
): Promise<string> {
  const key = apiKey || process.env.NEXT_PUBLIC_GROQ_API_KEY || '';
  if (!key) return 'Groq API key not configured.';

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages,
      temperature: 0.5,
      max_tokens: 512,
    }),
  });

  if (!response.ok) {
    return `Groq error: ${response.status}`;
  }

  const json = await response.json();
  return json.choices?.[0]?.message?.content || '';
}
