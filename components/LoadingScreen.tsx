// components/LoadingScreen.tsx — Immersive loading screen for 3D scene
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing neural pathways...');

  useEffect(() => {
    const stages = [
      { at: 10, text: 'Loading 3D engine...' },
      { at: 30, text: 'Generating mindscape topology...' },
      { at: 50, text: 'Warming up neural networks...' },
      { at: 70, text: 'Calibrating skill nodes...' },
      { at: 85, text: 'Establishing synaptic connections...' },
      { at: 95, text: 'Almost ready...' },
    ];

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.random() * 8;
        if (next >= 100) {
          clearInterval(interval);
          return 100;
        }

        const stage = stages.findLast((s) => s.at <= next);
        if (stage) setStatusText(stage.text);
        return next;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  if (progress >= 100) return null;

  return (
    <motion.div
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-[#050510] flex flex-col items-center justify-center"
    >
      {/* Animated logo */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        className="w-20 h-20 mb-8 border-2 border-cyan-400/30 rounded-full flex items-center justify-center"
      >
        <div className="w-12 h-12 border-2 border-cyan-400/60 rounded-full flex items-center justify-center">
          <div className="w-4 h-4 bg-cyan-400 rounded-full animate-pulse" />
        </div>
      </motion.div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-white/80 mb-2 tracking-wider">
        THE LIVING NEURAL DOUBLE
      </h1>
      <p className="text-sm text-white/30 mb-8 font-mono">{statusText}</p>

      {/* Progress bar */}
      <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <p className="text-xs text-white/20 mt-2 font-mono">{Math.round(progress)}%</p>
    </motion.div>
  );
}
