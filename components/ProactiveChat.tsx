// components/ProactiveChat.tsx — Floating proactive chat suggestion bubble
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';

export default function ProactiveChat() {
  const { proactiveSuggestion, setProactiveSuggestion, setChatOverlayOpen } = useAppStore();

  if (!proactiveSuggestion) return null;

  const handleClick = () => {
    setChatOverlayOpen(true);
    // The ChatInterface will pick up the suggestion from the store
  };

  const handleDismiss = () => {
    setProactiveSuggestion(null);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        className="fixed bottom-24 right-6 z-40 max-w-xs"
      >
        <div className="glass rounded-2xl p-4 shadow-lg shadow-cyan-500/10">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div className="flex-1">
              <p className="text-xs text-white/60 mb-1">I noticed you're interested...</p>
              <p className="text-sm text-white/80">{proactiveSuggestion}</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleClick}
                  className="text-xs px-3 py-1 rounded-full bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-600/30 transition-all"
                >
                  Ask me
                </button>
                <button
                  onClick={handleDismiss}
                  className="text-xs px-3 py-1 rounded-full text-white/30 hover:text-white/50 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
