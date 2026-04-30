// app/layout.tsx — Root layout with metadata, fonts, and global providers
import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Naman Agarwal — The Living Neural Double',
  description:
    'An immersive AI-powered 3D portfolio featuring a conversational digital twin. Built with Next.js, React Three Fiber, WebLLM, and Groq.',
  keywords: ['portfolio', 'AI', '3D', 'WebGL', 'digital twin', 'Naman Agarwal'],
  authors: [{ name: 'Naman Agarwal' }],
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#00f0ff',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        {/* Speculation Rules for pre-rendering */}
        <script
          type="speculationrules"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              prerender: [
                {
                  where: {
                    href_matches: ['/chat'],
                  },
                  eagerness: 'moderate',
                },
              ],
            }),
          }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
