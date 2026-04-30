// hooks/useVoice.ts — Speech-to-text and text-to-speech hook
'use client';

import { useCallback, useRef } from 'react';
import { useAppStore } from '@/lib/store';

export function useVoice() {
  const { setIsListening, setIsSpeaking } = useAppStore();
  const recognitionRef = useRef<any>(null);

  /**
   * Start listening via SpeechRecognition API.
   * Returns a promise that resolves with the transcript.
   */
  const startListening = useCallback((): Promise<string> => {
    return new Promise((resolve, reject) => {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        reject(new Error('SpeechRecognition not supported in this browser'));
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognitionRef.current = recognition;
      setIsListening(true);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        resolve(transcript);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        reject(new Error(event.error));
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    });
  }, [setIsListening]);

  /**
   * Stop listening.
   */
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [setIsListening]);

  /**
   * Speak text using browser SpeechSynthesis.
   * Uses a pleasant voice if available.
   */
  const speak = useCallback(
    (text: string): Promise<void> => {
      return new Promise((resolve) => {
        if (!('speechSynthesis' in window)) {
          resolve();
          return;
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 0.9;

        // Try to find a good voice
        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find(
          (v) =>
            v.name.includes('Google') ||
            v.name.includes('Samantha') ||
            v.name.includes('Microsoft Zira') ||
            v.lang.startsWith('en')
        );
        if (preferred) utterance.voice = preferred;

        setIsSpeaking(true);

        utterance.onend = () => {
          setIsSpeaking(false);
          resolve();
        };
        utterance.onerror = () => {
          setIsSpeaking(false);
          resolve();
        };

        window.speechSynthesis.speak(utterance);
      });
    },
    [setIsSpeaking]
  );

  /**
   * Stop speaking.
   */
  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [setIsSpeaking]);

  return { startListening, stopListening, speak, stopSpeaking };
}
