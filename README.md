# ⚡️ Catalyx AI

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Groq](https://img.shields.io/badge/Groq-f3f3f3?style=for-the-badge&logo=groq&logoColor=black)](https://groq.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> **Stop fighting AI. Start giving it instructions it actually understands.**

**Catalyx AI** is an intelligent prompt optimizer. It takes your vague project ideas and grills you through an adaptive interview to produce a highly detailed, principal-engineer-grade **Master Prompt** ready to be fed into Cursor, Bolt, Lovable, Claude Code, or Gemini.

---

## 🛠️ The Prompt-to-Master Flow

1. **Vague Input** — You type something lazy. We score it out of 100 (spoiler: it's probably a 20).
2. **Interrogation** — The AI analyzes your prompt, identifies missing details, and runs an adaptive interview with multi-select option cards.
3. **Generation** — A highly detailed, 14-section **Master Prompt** is compiled: database schemas, folder structures, API routes, security specs, and explicit instructions to prevent placeholder code.

---

## ⚡️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router), TypeScript, React 19 |
| **Styling** | Tailwind CSS v4, Lucide Icons, Framer Motion |
| **AI Model** | OpenRouter API — `inclusionai/ling-3.1-flash` |
| **State** | React `useReducer` finite state machine (no external library) |
| **Rate Limiting** | Exponential backoff retry (`lib/groq-client.ts`) |

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
npm install
```

### 2. Configure Environment

Create a `.env.local` file at the root:

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

*Get your API key at [openrouter.ai/settings/keys](https://openrouter.ai/settings/keys).*

### 3. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

---

## 📂 Repository Layout

```
├── app/
│   ├── api/
│   │   ├── analyze/       # Scoring & initial gap analysis      (~1024 max tokens)
│   │   ├── interview/     # Adaptive follow-up question gen     (~512 max tokens)
│   │   └── generate/      # Full Master Prompt compilation      (~4096 max tokens)
│   ├── optimize/          # Multi-step SaaS flow (FSM-driven)
│   ├── globals.css        # Dark mode OKLCH design system tokens
│   └── page.tsx           # Landing page
├── components/            # Reusable UI components
├── lib/
│   ├── groq-client.ts     # Shared Groq instance + retry logic
│   ├── prompts.ts         # System & user prompts for all API routes
│   ├── store.tsx          # useReducer FSM — global app state
│   ├── types.ts           # TypeScript interfaces
│   └── utils.ts           # Formatting & download helpers
└── public/                # Assets & screenshots
```

---

## 🔁 Rate Limit Handling

Catalyx AI uses a **shared Groq client** (`lib/groq-client.ts`) with automatic exponential backoff on HTTP 429 responses:

| Attempt | Wait before retry |
|---|---|
| 1st retry | 8 seconds |
| 2nd retry | 16 seconds |
| 3rd retry | 32 seconds |

`max_tokens` are tightly bounded per route to stay within the 8k tokens/minute free tier limit.

---

## 📝 License

MIT. Go build something great.
