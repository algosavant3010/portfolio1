// components/AdminPanel.tsx — Admin panel for knowledge base management and stats
'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { markdownToChunks } from '@/lib/knowledgeBase';

export default function AdminPanel() {
  const { questionLog, useLocalLLM, toggleLLMMode } = useAppStore();
  const [mdContent, setMdContent] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');

  // Compute question frequency stats
  const questionStats = useMemo(() => {
    const freq: Record<string, number> = {};
    questionLog.forEach((q) => {
      const normalized = q.toLowerCase().trim();
      freq[normalized] = (freq[normalized] || 0) + 1;
    });
    return Object.entries(freq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);
  }, [questionLog]);

  const handleUpload = () => {
    if (!mdContent.trim()) return;
    const chunks = markdownToChunks(mdContent, 'admin-upload');
    setUploadStatus(`Parsed ${chunks.length} chunks. In production, these would be embedded and added to the vector store.`);
    setMdContent('');
  };

  return (
    <div className="min-h-screen bg-[#050510] p-6 pt-20">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white/90 mb-1">Admin Panel</h1>
          <p className="text-sm text-white/40">Manage knowledge base and view session insights</p>
        </div>

        {/* LLM Mode Toggle */}
        <div className="glass rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white/70 mb-3">🧠 LLM Mode</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleLLMMode}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                useLocalLLM
                  ? 'bg-purple-600/20 border border-purple-500/30 text-purple-300'
                  : 'bg-cyan-600/20 border border-cyan-500/30 text-cyan-300'
              }`}
            >
              {useLocalLLM ? '🧠 Local WebLLM' : '⚡ Groq API'}
            </button>
            <span className="text-xs text-white/40">
              Click to switch to {useLocalLLM ? 'Groq API (faster, requires API key)' : 'Local LLM (private, slower initial load)'}
            </span>
          </div>
        </div>

        {/* Session Stats */}
        <div className="glass rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white/70 mb-3">📊 Session Stats</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-2xl font-bold text-cyan-400">{questionLog.length}</p>
              <p className="text-xs text-white/40">Total Questions</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-2xl font-bold text-purple-400">{questionStats.length}</p>
              <p className="text-xs text-white/40">Unique Questions</p>
            </div>
          </div>

          {questionStats.length > 0 ? (
            <div>
              <h3 className="text-xs font-medium text-white/50 mb-2">Most Asked</h3>
              <div className="space-y-1">
                {questionStats.map(([q, count]) => (
                  <div key={q} className="flex items-center gap-2 text-xs">
                    <span className="text-white/30 w-6 text-right">{count}×</span>
                    <span className="text-white/60 truncate">{q}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-white/30">No questions yet. Start chatting to see stats.</p>
          )}
        </div>

        {/* Knowledge Base Upload */}
        <div className="glass rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white/70 mb-3">📄 Update Knowledge Base</h2>
          <p className="text-xs text-white/40 mb-3">
            Paste markdown content below. It will be chunked and simulated as an embedding update.
          </p>
          <textarea
            value={mdContent}
            onChange={(e) => setMdContent(e.target.value)}
            placeholder="# My New Project&#10;&#10;Paste markdown content here..."
            rows={8}
            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-cyan-500/40 resize-none font-mono"
          />
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={handleUpload}
              disabled={!mdContent.trim()}
              className="px-4 py-2 rounded-lg bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 text-sm font-medium hover:bg-cyan-600/30 transition-all disabled:opacity-30"
            >
              Process & Embed
            </button>
            {uploadStatus && (
              <span className="text-xs text-green-400/70">{uploadStatus}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
