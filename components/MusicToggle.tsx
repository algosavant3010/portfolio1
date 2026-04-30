// components/MusicToggle.tsx — Toggle button for ambient music
'use client';

import { useState, useCallback } from 'react';
import { getMusicEngine } from '@/lib/musicEngine';

export default function MusicToggle() {
  const [playing, setPlaying] = useState(false);

  const toggle = useCallback(async () => {
    const engine = getMusicEngine();
    if (!playing) {
      await engine.init();
      engine.start();
      setPlaying(true);
    } else {
      engine.stop();
      setPlaying(false);
    }
  }, [playing]);

  return (
    <button
      onClick={toggle}
      className="fixed top-6 right-6 z-50 w-10 h-10 rounded-full glass flex items-center justify-center text-lg hover:border-cyan-400/40 transition-all"
      title={playing ? 'Mute ambient music' : 'Play ambient music'}
    >
      {playing ? '🔊' : '🔇'}
    </button>
  );
}
