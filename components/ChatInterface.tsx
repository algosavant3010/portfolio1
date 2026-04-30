// components/ChatInterface.tsx — Full conversational AI chat interface
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { useRAG } from '@/hooks/useRAG';
import { useWebLLM } from '@/hooks/useWebLLM';
import { useVoice } from '@/hooks/useVoice';
import { buildSystemPrompt } from '@/lib/promptTemplate';
import { streamGroqChat, type GroqMessage } from '@/lib/groqClient';

export default function ChatInterface() {
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    messages,
    addMessage,
    updateLastAssistant,
    memoryParagraph,
    useLocalLLM,
    llmLoaded,
    llmProgress,
    isListening,
    isSpeaking,
    logQuestion,
    proactiveSuggestion,
    setProactiveSuggestion,
  } = useAppStore();

  const { search, isReady: ragReady, status: ragStatus } = useRAG();
  const { loadModel, streamChat } = useWebLLM();
  const { startListening, speak } = useVoice();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load local LLM on first interaction if using local mode
  useEffect(() => {
    if (useLocalLLM && !llmLoaded && messages.length > 0) {
      loadModel();
    }
  }, [useLocalLLM, llmLoaded, messages.length, loadModel]);

  /**
   * Handle sending a message.
   */
  const handleSend = useCallback(
    async (text?: string) => {
      const userMsg = text || input.trim();
      if (!userMsg || isStreaming) return;

      setInput('');
      setIsStreaming(true);
      addMessage({ role: 'user', content: userMsg });
      logQuestion(userMsg);

      // RAG: retrieve relevant chunks
      const chunks = ragReady ? await search(userMsg) : [];

      // Build the system prompt with context
      const history = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const systemPrompt = buildSystemPrompt(chunks, history, memoryParagraph);

      // Add placeholder for assistant response
      addMessage({ role: 'assistant', content: '' });

      let fullResponse = '';

      try {
        if (useLocalLLM && llmLoaded) {
          // Stream from local WebLLM
          const llmMessages = [
            { role: 'system', content: systemPrompt },
            ...history,
            { role: 'user', content: userMsg },
          ];

          const generator = streamChat(llmMessages);
          for await (const chunk of generator) {
            fullResponse += chunk;
            updateLastAssistant(fullResponse);
          }
        } else {
          // Stream from Groq API (free!)
          const groqMessages: GroqMessage[] = [
            { role: 'system', content: systemPrompt },
            ...history.map((m) => ({
              role: m.role as 'user' | 'assistant',
              content: m.content,
            })),
            { role: 'user', content: userMsg },
          ];

          const generator = streamGroqChat(groqMessages);
          for await (const chunk of generator) {
            fullResponse += chunk;
            updateLastAssistant(fullResponse);
          }
        }
      } catch (err: any) {
        fullResponse = `Sorry, I encountered an error: ${err.message}`;
        updateLastAssistant(fullResponse);
      }

      setIsStreaming(false);
    },
    [
      input,
      isStreaming,
      messages,
      memoryParagraph,
      ragReady,
      search,
      useLocalLLM,
      llmLoaded,
      addMessage,
      updateLastAssistant,
      logQuestion,
      streamChat,
    ]
  );

  /**
   * Handle voice input.
   */
  const handleVoice = async () => {
    try {
      const transcript = await startListening();
      if (transcript) {
        setInput(transcript);
        handleSend(transcript);
      }
    } catch (err) {
      console.error('Voice input error:', err);
    }
  };

  /**
   * Handle speaking a response.
   */
  const handleSpeak = (text: string) => {
    speak(text);
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-4rem)]">
      {/* RAG status bar */}
      {!ragReady && (
        <div className="px-4 py-2 glass border-b border-cyan-500/20">
          <div className="flex items-center gap-2 text-xs text-cyan-300/70">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            {ragStatus}
          </div>
        </div>
      )}

      {/* LLM loading progress */}
      {useLocalLLM && !llmLoaded && llmProgress > 0 && (
        <div className="px-4 py-2 glass border-b border-purple-500/20">
          <div className="flex items-center gap-2 text-xs text-purple-300/70">
            <span>Loading local LLM: {Math.round(llmProgress)}%</span>
            <div className="flex-1 h-1 bg-purple-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 transition-all duration-300"
                style={{ width: `${llmProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Mode indicator */}
      <div className="px-4 py-1.5 flex items-center justify-between text-xs glass border-b border-white/5">
        <span className="text-white/40">
          {useLocalLLM ? '🧠 Local LLM' : '⚡ Groq API'} · {ragReady ? '✓ RAG' : '⏳ RAG'}
        </span>
        <button
          onClick={() => useAppStore.getState().toggleLLMMode()}
          className="text-cyan-400/60 hover:text-cyan-400 transition-colors"
        >
          Switch to {useLocalLLM ? 'Groq' : 'Local'}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🧠</div>
            <h2 className="text-xl font-semibold text-white/80 mb-2">
              Hey, I&apos;m Naman
            </h2>
            <p className="text-sm text-white/40 max-w-md mx-auto">
              Ask me about my projects, skills, education, or anything else.
              I&apos;m running {useLocalLLM ? 'locally in your browser' : 'via Groq API'} — no data leaves your machine{useLocalLLM ? '' : ' except the chat messages'}.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              {[
                'Tell me about your projects',
                'What tech stack do you work with?',
                'How did you build Nyaya-Flow?',
                'What are you looking for in an internship?',
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="text-xs px-3 py-1.5 rounded-full glass text-cyan-300/70 hover:text-cyan-300 hover:border-cyan-400/30 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                  msg.role === 'user'
                    ? 'bg-cyan-600/20 border border-cyan-500/20 text-white/90'
                    : 'glass text-white/80'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                  {msg.role === 'assistant' && isStreaming && msg.id === messages[messages.length - 1]?.id && (
                    <span className="typing-cursor" />
                  )}
                </p>
                {msg.role === 'assistant' && msg.content && !isStreaming && (
                  <button
                    onClick={() => handleSpeak(msg.content)}
                    className="mt-1 text-xs text-white/30 hover:text-white/60 transition-colors"
                    title="Read aloud"
                  >
                    🔊
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Proactive suggestion */}
      <AnimatePresence>
        {proactiveSuggestion && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="px-4 py-2"
          >
            <button
              onClick={() => {
                handleSend(proactiveSuggestion);
                setProactiveSuggestion(null);
              }}
              className="w-full text-left text-xs px-3 py-2 rounded-lg glass text-cyan-300/60 hover:text-cyan-300 transition-all"
            >
              💡 {proactiveSuggestion}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div className="p-4 glass border-t border-white/5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <button
            type="button"
            onClick={handleVoice}
            className={`p-2.5 rounded-xl transition-all ${
              isListening
                ? 'bg-red-500/20 border border-red-500/40 text-red-400 animate-pulse'
                : 'glass text-white/40 hover:text-white/70'
            }`}
            title="Voice input"
          >
            🎤
          </button>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Naman anything..."
            disabled={isStreaming}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/90 placeholder:text-white/30 focus:outline-none focus:border-cyan-500/40 transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            className="px-4 py-2.5 rounded-xl bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 text-sm font-medium hover:bg-cyan-600/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isStreaming ? '...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}
