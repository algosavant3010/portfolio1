// hooks/useRAG.ts — Hook to manage the RAG Web Worker lifecycle
'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { loadChunks } from '@/lib/knowledgeBase';

export interface RAGResult {
  id: string;
  text: string;
  score: number;
}

export function useRAG() {
  const workerRef = useRef<Worker | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Initializing...');
  const searchResolveRef = useRef<((results: RAGResult[]) => void) | null>(null);

  useEffect(() => {
    // Create the worker
    const worker = new Worker(
      new URL('../workers/rag.worker.ts', import.meta.url),
      { type: 'module' }
    );

    worker.onmessage = (event) => {
      const { type, message, value, results } = event.data;

      switch (type) {
        case 'status':
          setStatus(message);
          break;
        case 'progress':
          setProgress(value);
          setStatus(message);
          break;
        case 'embed-progress':
          setProgress(value);
          setStatus(message);
          break;
        case 'ready':
          setIsReady(true);
          setStatus('Ready');
          setProgress(100);
          break;
        case 'results':
          if (searchResolveRef.current) {
            searchResolveRef.current(results);
            searchResolveRef.current = null;
          }
          break;
        case 'error':
          console.error('RAG Worker error:', message);
          setStatus(`Error: ${message}`);
          break;
      }
    };

    workerRef.current = worker;

    // Initialize with chunks
    const chunks = loadChunks();
    worker.postMessage({ type: 'init', payload: { chunks } });

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  const search = useCallback(
    (query: string, topK: number = 3): Promise<RAGResult[]> => {
      return new Promise((resolve) => {
        if (!workerRef.current || !isReady) {
          resolve([]);
          return;
        }
        searchResolveRef.current = resolve;
        workerRef.current.postMessage({
          type: 'search',
          payload: { query, topK },
        });

        // Timeout fallback
        setTimeout(() => {
          if (searchResolveRef.current) {
            searchResolveRef.current([]);
            searchResolveRef.current = null;
          }
        }, 10000);
      });
    },
    [isReady]
  );

  return { search, isReady, progress, status };
}
