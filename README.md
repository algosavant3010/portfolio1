# The Living Neural Double

An immersive, AI-powered 3D portfolio website featuring a conversational digital twin of **Naman Agarwal**. Built with Next.js 14, React Three Fiber, WebLLM, and Groq API.

## Features

- **Immersive 3D Mindscape** — A floating island of interconnected skill nodes with physics, dynamic sky shaders, and ambient particles
- **Conversational Digital Twin** — RAG-powered AI chatbot that responds as Naman using Groq API (free) or local WebLLM
- **Reactive Ambient Music** — Tone.js Markov chain-generated ambient soundscapes that react to camera proximity
- **Visitor Personalization** — Adaptive UI that classifies visitors (recruiter/engineer/explorer) and adjusts content emphasis
- **Proactive Suggestions** — Context-aware chat prompts when hovering over skill nodes
- **Voice Interaction** — Speech-to-text and text-to-speech for hands-free conversation
- **Progressive Web App** — Offline-capable with service worker caching
- **Admin Panel** — Manage knowledge base and view anonymized session stats

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 14 (App Router) + TypeScript |
| 3D | Three.js, React Three Fiber, Drei, Cannon |
| AI/ML | Groq API (Llama 3.1), WebLLM, Transformers.js |
| Audio | Tone.js |
| State | Zustand |
| Styling | Tailwind CSS + Framer Motion |
| PWA | next-pwa |

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your **free** Groq API key:
- Go to [console.groq.com/keys](https://console.groq.com/keys)
- Create a free account and generate an API key
- Paste the key as `NEXT_PUBLIC_GROQ_API_KEY`

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pages

| Route | Description |
|-------|-------------|
| `/` | Immersive 3D hub with floating skill nodes and chat overlay |
| `/chat` | Full-page conversational AI interface |
| `/admin` | Password-protected admin panel (password: `naman2024`) |

## Architecture

```
├── app/                  # Next.js App Router pages
│   ├── layout.tsx        # Root layout with metadata
│   ├── page.tsx          # 3D hub (dynamic imports)
│   ├── chat/page.tsx     # Chat interface
│   └── admin/page.tsx    # Admin panel
├── components/           # React components
│   ├── Scene3D.tsx       # Main 3D scene
│   ├── SkillNode.tsx     # Physics-driven skill nodes
│   ├── DynamicSky.tsx    # Time-of-day sky shader
│   ├── ChatInterface.tsx # RAG chatbot UI
│   ├── ChatOverlay.tsx   # Floating chat for 3D page
│   ├── VisitorIntro.tsx  # Visitor classification quiz
│   ├── ProactiveChat.tsx # Suggestion bubbles
│   ├── MusicToggle.tsx   # Ambient music control
│   ├── NavigationBar.tsx # Navigation
│   ├── LoadingScreen.tsx # Loading animation
│   └── AdminPanel.tsx    # Admin controls
├── lib/                  # Utilities
│   ├── store.ts          # Zustand global state
│   ├── groqClient.ts     # Groq API streaming client
│   ├── promptTemplate.ts # System prompt builder
│   ├── vectorSearch.ts   # Cosine similarity search
│   ├── knowledgeBase.ts  # Chunk loading & parsing
│   ├── visitorProfile.ts # Visitor classification
│   ├── musicEngine.ts    # Tone.js Markov music
│   └── timeUtils.ts      # Time-based utilities
├── hooks/                # Custom React hooks
│   ├── useRAG.ts         # RAG Web Worker management
│   ├── useWebLLM.ts      # Local LLM loading
│   ├── useVoice.ts       # Speech I/O
│   └── useCameraControl.ts # Camera proximity tracking
├── workers/              # Web Workers
│   └── rag.worker.ts     # Embedding & vector search
├── data/                 # Knowledge base
│   └── sampleChunks.json # 20 sample knowledge chunks
└── styles/
    └── globals.css       # Global styles & CSS vars
```

## LLM Modes

1. **Groq API (default)** — Free, fast inference using `llama-3.1-8b-instant`. Requires API key.
2. **Local WebLLM** — Runs `Llama-3.1-8B-Instruct-q4f16_1-MLC` entirely in-browser via WebGPU. No API key needed but requires ~4GB download on first use.

Toggle between modes in the chat interface or admin panel.

## Customization

### Update Knowledge Base
Edit `data/sampleChunks.json` to replace sample data with your real information. Each chunk should be:
```json
{
  "id": "unique-id",
  "text": "Your text content...",
  "source": "category",
  "type": "bio|skill|project|philosophy|etc"
}
```

### Change Owner Name
Search and replace "Naman Agarwal" across the codebase.

### Groq Model
Edit `lib/groqClient.ts` to change the model. Options: `llama-3.1-70b-versatile`, `mixtral-8x7b-32768`, etc.

## License

MIT
