// app/chat/page.tsx — Dedicated full-page chat interface
'use client';

import dynamic from 'next/dynamic';
import NavigationBar from '@/components/NavigationBar';

const ChatInterface = dynamic(() => import('@/components/ChatInterface'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-white/40">Loading chat engine...</p>
      </div>
    </div>
  ),
});

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-[#050510] flex flex-col">
      <NavigationBar />

      {/* Chat container */}
      <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto pt-16">
        {/* Header */}
        <div className="px-6 py-6 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-xl font-bold">
                N
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-[#050510]" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white/90">
                Naman Agarwal
              </h1>
              <p className="text-xs text-white/40">
                Digital Twin · Ask me anything about my work
              </p>
            </div>
          </div>
        </div>

        {/* Chat */}
        <div className="flex-1">
          <ChatInterface />
        </div>
      </div>
    </div>
  );
}
