// components/VisitorIntro.tsx — Quick multiple-choice intro to classify visitors
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { classifyVisitor, getVisitorFromCookie } from '@/lib/visitorProfile';

const QUESTIONS = [
  {
    question: "What brings you to my portfolio?",
    options: [
      { label: "I'm looking to hire", emoji: "💼" },
      { label: "I'm curious about the tech", emoji: "⚡" },
      { label: "Just exploring", emoji: "🌍" },
    ],
  },
  {
    question: "What interests you most?",
    options: [
      { label: "Leadership & experience", emoji: "🎯" },
      { label: "Code & architecture", emoji: "🏗️" },
      { label: "Creative & design work", emoji: "🎨" },
    ],
  },
];

export default function VisitorIntro() {
  const { visitorType, setVisitorType } = useAppStore();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [dismissed, setDismissed] = useState(false);

  // Check if already classified
  if (visitorType || dismissed) return null;

  // Check cookie
  const cookieType = getVisitorFromCookie();
  if (cookieType) {
    setVisitorType(cookieType);
    return null;
  }

  const handleSelect = (optionIdx: number) => {
    const newAnswers = [...answers, optionIdx];
    setAnswers(newAnswers);

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      const type = classifyVisitor(newAnswers);
      setVisitorType(type);
    }
  };

  const handleSkip = () => {
    setVisitorType('explorer');
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="glass rounded-2xl p-8 max-w-md w-full mx-4"
        >
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">👋</div>
            <h2 className="text-lg font-semibold text-white/90 mb-1">
              Welcome to my world
            </h2>
            <p className="text-xs text-white/40">
              Quick question so I can personalize your experience
            </p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
            >
              <p className="text-sm text-white/70 mb-4 text-center">
                {QUESTIONS[step].question}
              </p>

              <div className="space-y-2">
                {QUESTIONS[step].options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl glass hover:border-cyan-400/30 text-sm text-white/70 hover:text-white/90 transition-all"
                  >
                    <span className="text-lg">{opt.emoji}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-4 flex justify-between items-center">
            <div className="flex gap-1">
              {QUESTIONS.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    idx <= step ? 'bg-cyan-400' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={handleSkip}
              className="text-xs text-white/30 hover:text-white/50 transition-colors"
            >
              Skip →
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
