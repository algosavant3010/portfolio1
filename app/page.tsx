// app/page.tsx — The immersive 3D hub (Mindscape)
'use client';

import dynamic from 'next/dynamic';
import { Suspense, useState, useEffect } from 'react';
import LoadingScreen from '@/components/LoadingScreen';
import NavigationBar from '@/components/NavigationBar';
import MusicToggle from '@/components/MusicToggle';
import ProactiveChat from '@/components/ProactiveChat';
import VisitorIntro from '@/components/VisitorIntro';

// Dynamic import of heavy 3D scene — no SSR
const Scene3D = dynamic(() => import('@/components/Scene3D'), {
  ssr: false,
  loading: () => <LoadingScreen />,
});

// Dynamic import of chat overlay
const ChatOverlay = dynamic(() => import('@/components/ChatOverlay'), {
  ssr: false,
});

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <LoadingScreen />;
  }

  return (
    <main className="relative w-full h-screen overflow-hidden bg-[#050510]">
      {/* Navigation */}
      <NavigationBar />

      {/* Visitor intro quiz */}
      <VisitorIntro />

      {/* 3D Scene */}
      <Suspense fallback={<LoadingScreen />}>
        <Scene3D />
      </Suspense>

      {/* Bottom info bar */}
      <div className="fixed bottom-6 left-6 z-30">
        <div className="glass rounded-xl px-4 py-2.5">
          <p className="text-xs text-white/50 font-mono">
            <span className="text-cyan-400">●</span> Mindscape Active
          </p>
          <p className="text-[10px] text-white/25 mt-0.5">
            Scroll to explore · Click nodes to interact · Chat with my digital twin →
          </p>
        </div>
      </div>

      {/* Music toggle */}
      <MusicToggle />

      {/* Proactive suggestion bubbles */}
      <ProactiveChat />

      {/* Chat overlay */}
      <ChatOverlay />
    </main>
  );
}
