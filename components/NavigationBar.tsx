// components/NavigationBar.tsx — Minimal navigation bar
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback } from 'react';

export default function NavigationBar() {
  const pathname = usePathname();

  const handleNav = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      // Use View Transitions API if available
      if ('startViewTransition' in document && pathname !== href) {
        e.preventDefault();
        (document as any).startViewTransition(() => {
          window.location.href = href;
        });
      }
    },
    [pathname]
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">
      <Link
        href="/"
        onClick={(e) => handleNav(e, '/')}
        className="text-sm font-bold tracking-widest text-white/70 hover:text-white/90 transition-colors"
      >
        NA<span className="text-cyan-400">.</span>
      </Link>

      <div className="flex items-center gap-4">
        {[
          { href: '/', label: 'World' },
          { href: '/chat', label: 'Chat' },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={(e) => handleNav(e, link.href)}
            className={`text-xs font-mono px-3 py-1.5 rounded-full transition-all ${
              pathname === link.href
                ? 'glass text-cyan-300 border-cyan-500/30'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
