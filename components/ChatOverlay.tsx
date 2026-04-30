// components/ChatOverlay.tsx — Floating chat overlay for the 3D hub page
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import ChatInterface from './ChatInterface';

export default function ChatOverlay() {
  const { chatOverlayOpen, setChatOverlayOpen } = useAppStore();

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setChatOverlayOpen(!chatOverlayOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full glass flex items-center justify-center text-2xl hover:border-cyan-400/40 transition-all shadow-lg shadow-cyan-500/20 group"
        title="Chat with Naman"
      >
        <span className={`transition-transform ${chatOverlayOpen ? 'rotate-45' : ''}`}>
          {chatOverlayOpen ? '✕' : '💬'}
        </span>
        {!chatOverlayOpen && (
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
        )}
      </button>

      {/* Chat panel */}
      <AnimatePresence>
        {chatOverlayOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-40 w-[420px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] glass rounded-2xl overflow-hidden shadow-2xl shadow-black/50"
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="px-4 py-3 glass border-b border-white/5 flex items-center gap-3">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-sm">
                    N
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-[#0a0a1a]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/90">Naman Agarwal</p>
                  <p className="text-xs text-white/40">Digital Twin · Online</p>
                </div>
              </div>

              {/* Chat */}
              <div className="flex-1 overflow-hidden">
                <ChatInterface />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
