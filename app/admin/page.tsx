// app/admin/page.tsx — Password-protected admin panel
'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const AdminPanel = dynamic(() => import('@/components/AdminPanel'), {
  ssr: false,
});

// Simple client-side auth via URL hash (demo only — NOT for production security)
const ADMIN_HASH = 'naman2024';

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Check hash in URL for auto-login
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (hash === ADMIN_HASH) {
        setAuthenticated(true);
      }
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_HASH) {
      setAuthenticated(true);
      setError('');
      // Add hash to URL for convenience
      window.location.hash = ADMIN_HASH;
    } else {
      setError('Invalid password');
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="glass rounded-2xl p-8 max-w-sm w-full mx-4">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">🔐</div>
            <h1 className="text-lg font-semibold text-white/90">Admin Access</h1>
            <p className="text-xs text-white/40 mt-1">Enter password to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white/90 placeholder:text-white/30 focus:outline-none focus:border-cyan-500/40"
              autoFocus
            />
            {error && (
              <p className="text-xs text-red-400">{error}</p>
            )}
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 text-sm font-medium hover:bg-cyan-600/30 transition-all"
            >
              Enter
            </button>
          </form>

          <p className="text-[10px] text-white/20 text-center mt-4">
            Demo password: naman2024
          </p>
        </div>
      </div>
    );
  }

  return <AdminPanel />;
}
