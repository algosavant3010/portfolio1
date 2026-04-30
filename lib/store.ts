// lib/store.ts — Global Zustand store for the entire application
import { create } from 'zustand';

export type VisitorType = 'recruiter' | 'engineer' | 'explorer' | null;

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface AppState {
  // Visitor
  visitorType: VisitorType;
  setVisitorType: (type: VisitorType) => void;

  // Chat
  messages: ChatMessage[];
  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateLastAssistant: (content: string) => void;
  memoryParagraph: string;
  setMemoryParagraph: (mem: string) => void;

  // LLM
  llmLoaded: boolean;
  llmProgress: number;
  setLlmLoaded: (v: boolean) => void;
  setLlmProgress: (v: number) => void;
  useLocalLLM: boolean;
  toggleLLMMode: () => void;

  // Chat overlay in 3D
  chatOverlayOpen: boolean;
  setChatOverlayOpen: (v: boolean) => void;

  // Proactive suggestion
  proactiveSuggestion: string | null;
  setProactiveSuggestion: (s: string | null) => void;

  // Hovered node
  hoveredNode: string | null;
  setHoveredNode: (id: string | null) => void;
  hoverStartTime: number;
  setHoverStartTime: (t: number) => void;

  // Admin stats
  questionLog: string[];
  logQuestion: (q: string) => void;

  // Voice
  isListening: boolean;
  setIsListening: (v: boolean) => void;
  isSpeaking: boolean;
  setIsSpeaking: (v: boolean) => void;
}

let msgCounter = 0;

export const useAppStore = create<AppState>((set, get) => ({
  visitorType: null,
  setVisitorType: (type) => {
    set({ visitorType: type });
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-visitor', type ?? '');
      document.cookie = `visitor_type=${type};path=/;max-age=31536000;SameSite=Lax`;
    }
  },

  messages: [],
  addMessage: (msg) => {
    const id = `msg-${++msgCounter}-${Date.now()}`;
    set((s) => ({ messages: [...s.messages, { ...msg, id, timestamp: Date.now() }] }));
  },
  updateLastAssistant: (content) =>
    set((s) => {
      const msgs = [...s.messages];
      for (let i = msgs.length - 1; i >= 0; i--) {
        if (msgs[i].role === 'assistant') {
          msgs[i] = { ...msgs[i], content };
          break;
        }
      }
      return { messages: msgs };
    }),
  memoryParagraph: '',
  setMemoryParagraph: (mem) => set({ memoryParagraph: mem }),

  llmLoaded: false,
  llmProgress: 0,
  setLlmLoaded: (v) => set({ llmLoaded: v }),
  setLlmProgress: (v) => set({ llmProgress: v }),
  useLocalLLM: true,
  toggleLLMMode: () => set((s) => ({ useLocalLLM: !s.useLocalLLM })),

  chatOverlayOpen: false,
  setChatOverlayOpen: (v) => set({ chatOverlayOpen: v }),

  proactiveSuggestion: null,
  setProactiveSuggestion: (s) => set({ proactiveSuggestion: s }),

  hoveredNode: null,
  setHoveredNode: (id) => set({ hoveredNode: id }),
  hoverStartTime: 0,
  setHoverStartTime: (t) => set({ hoverStartTime: t }),

  questionLog: [],
  logQuestion: (q) => set((s) => ({ questionLog: [...s.questionLog, q] })),

  isListening: false,
  setIsListening: (v) => set({ isListening: v }),
  isSpeaking: false,
  setIsSpeaking: (v) => set({ isSpeaking: v }),
}));
