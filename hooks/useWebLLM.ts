// hooks/useWebLLM.ts — Hook to manage WebLLM model loading and chat
'use client';

import { useCallback, useRef, useState } from 'react';
import { useAppStore } from '@/lib/store';

export function useWebLLM() {
  const engineRef = useRef<any>(null);
  const [loading, setLoading] = useState(false);
  const { setLlmLoaded, setLlmProgress } = useAppStore();

  const loadModel = useCallback(async () => {
    if (engineRef.current || loading) return;
    setLoading(true);

    try {
      const webllm = await import('@mlc-ai/web-llm');

      const engine = await webllm.CreateMLCEngine('Llama-3.1-8B-Instruct-q4f16_1-MLC', {
        initProgressCallback: (progress: any) => {
          const pct = typeof progress.progress === 'number' ? progress.progress * 100 : 0;
          setLlmProgress(pct);
        },
      });

      engineRef.current = engine;
      setLlmLoaded(true);
      setLlmProgress(100);
    } catch (error) {
      console.error('WebLLM failed to load:', error);
      setLlmLoaded(false);
    } finally {
      setLoading(false);
    }
  }, [loading, setLlmLoaded, setLlmProgress]);

  /**
   * Stream a completion from the local LLM.
   * Yields partial content strings.
   */
  const streamChat = useCallback(
    async function* (
      messages: { role: string; content: string }[]
    ): AsyncGenerator<string, void, unknown> {
      if (!engineRef.current) {
        yield 'Local LLM not loaded. Please wait for model download to complete.';
        return;
      }

      try {
        const response = await engineRef.current.chat.completions.create({
          messages: messages.map((m) => ({
            role: m.role as 'system' | 'user' | 'assistant',
            content: m.content,
          })),
          stream: true,
          temperature: 0.7,
          max_tokens: 1024,
        });

        for await (const chunk of response) {
          const delta = chunk.choices?.[0]?.delta?.content;
          if (delta) yield delta;
        }
      } catch (error: any) {
        yield `LLM error: ${error.message}`;
      }
    },
    []
  );

  return {
    loadModel,
    streamChat,
    loading,
    engine: engineRef,
  };
}
