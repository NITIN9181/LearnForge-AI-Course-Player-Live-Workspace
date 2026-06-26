# LearnForge

> **AI-Powered Learning Platform** — A full-stack course player with a live AI workspace.

<div align="center">

[![TypeScript](https://img.shields.io/badge/TypeScript-strict-%233178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-%23000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-%2361DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-%2306B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5-%232D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-%233FCF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![NextAuth.js](https://img.shields.io/badge/NextAuth-5-%23EC4899?logo=auth0&logoColor=white)](https://next-auth.js.org/)
[![Vitest](https://img.shields.io/badge/Vitest-4-%236E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)
[![Playwright](https://img.shields.io/badge/Playwright-latest-%2345ba4b?logo=playwright&logoColor=white)](https://playwright.dev/)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Scripts](#scripts)
- [API Overview](#api-overview)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Demo Credentials](#demo-credentials)
- [License](#license)

---

## Overview

LearnForge is a full-stack AI learning platform built around a split-pane course player: a lesson on the left, a live AI workspace on the right.

Learners navigate structured courses (Course → Module → Lesson). Each lesson renders MDX content on the left panel and a live NVIDIA NIM–powered AI chat workspace on the right. The workspace is pre-configured with a custom system prompt per lesson, transforming the AI into a specialized tutor for that specific task.

---

## Features

### Split-Pane Course Player
Two resizable panels — MDX lesson content on the left, AI workspace on the right. Drag the handle to resize (persisted to `localStorage`). Below 768px the split collapses to tabs.

### Live AI Workspace (SSE Streaming)
Real-time LLM chat via **NVIDIA NIM** (primary) with **Groq Cloud** fallback. Server-Sent Events stream tokens character by character through a `ReadableStream` + `TextEncoder` pipeline.

### Per-Lesson AI Personas
Each lesson defines its own system prompt, making the AI a custom tutor for that specific topic. Admins configure this in the lesson editor.

### Course Hierarchy
Three-level structure: Course → Module → Lesson, with slug-based routing (`/learn/[courseSlug]/[lessonSlug]`). Lessons are authored in MDX with syntax highlighting, GFM tables, and custom components (Callout, Quiz, CodeBlock).

### Progress Tracking
Automatic status transitions (`NOT_STARTED → IN_PROGRESS → COMPLETE`). Dashboard shows per-course completion bars. Locked lessons display a lock icon.

### Lesson Completion & Task Validation
"Mark Complete" optionally triggers AI-powered task validation via a cheaper 8B model, returning `{ achieved, feedback }`. Confetti animation plays on success.

### Role-Based Access Control
Two roles: `LEARNER` and `ADMIN`. Admin panel for course, module, and lesson CRUD. NextAuth sessions with middleware protecting admin routes.

### AI Hint System
A "Give me a hint" button triggers a Socratic tutor response (using the 70B model) that nudges the learner toward the answer without giving it away.

### Workspace History Persistence
Every conversation is saved to PostgreSQL. History loads on mount and can be cleared on demand with a confirmation dialog.

### Demo Mode
One-click "Try Demo" logs in as `demo@learnforge.dev` — pre-enrolled in courses with lessons in progress so you can explore immediately.

![Split-Pane Player](./docs/screenshots/player.png)
![AI Workspace Chat](./docs/screenshots/workspace.png)
![Course Dashboard](./docs/screenshots/dashboard.png)
![Admin Lesson Editor](./docs/screenshots/admin-lesson-editor.png)

---

## Tech Stack

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Framework | [Next.js](https://nextjs.org/) (App Router) | 16 | SSR + API Routes + Node.js runtime |
| Language | [TypeScript](https://www.typescriptlang.org/) | 5 | `strict: true`, `noUncheckedIndexedAccess` |
| Styling | [Tailwind CSS](https://tailwindcss.com/) | 3 | Utility-first with custom Forge design tokens |
| UI Primitives | [shadcn/ui](https://ui.shadcn.com/) | latest | Radix-based, unstyled, fully customizable |
| Database | [Supabase](https://supabase.com/) (PostgreSQL) | — | Free tier, 500MB |
| ORM | [Prisma](https://www.prisma.io/) | 5 | Type-safe queries, immutable migrations |
| Auth | [NextAuth.js](https://next-auth.js.org/) | 5 | Credentials + GitHub OAuth |
| LLM (Primary) | [NVIDIA NIM](https://www.nvidia.com/en-us/ai/) | — | `meta/llama-3.1-70b-instruct` |
| LLM (Fallback) | [Groq Cloud](https://groq.com/) | — | `llama3-70b-8192` |
| AI SDK | [openai npm](https://www.npmjs.com/package/openai) | 4 | OpenAI-compatible client pointed at NVIDIA NIM |
| AI Framework | [LangChain.js](https://js.langchain.com/) | 0.2 | Task validation chain with structured output |
| MDX Rendering | [next-mdx-remote](https://github.com/hashicorp/next-mdx-remote) | 6 | Server-side MDX with custom components |
| Testing (Unit) | [Vitest](https://vitest.dev/) | 4 | Coverage target ≥ 70% on lib/ and api/ |
| Testing (E2E) | [Playwright](https://playwright.dev/) | 1 | Critical user flow specs |
| Monitoring | [Sentry](https://sentry.io/) | — | Error tracking, 5K errors/month free |
| CI/CD | [GitHub Actions](https://github.com/features/actions) | — | Type check → lint → test → build |

---

## Architecture

### Server / Client Component Split

The player page is a **Server Component** — it fetches lesson data, progress, and module list server-side and passes data down:

```
page.tsx (Server Component)
  ├── <LessonContent />        ← Server Component (MDX rendering via next-mdx-remote/rsc)
  └── <AiWorkspace />          ← Client Component ("use client", SSE + chat state)
        └── useWorkspaceChat() ← Hook manages streaming, history, persistence
```

**Rule:** `"use client"` is pushed as far down the tree as possible. No parent Server Component is converted to a Client Component just for interactivity.

### SSE Streaming Flow

```
  Client (browser)              Server (Node.js)               NVIDIA NIM API
        │                             │                              │
        │  POST /api/workspace/chat   │                              │
        │  { lessonId, message }      │                              │
        │ ──────────────────────────► │                              │
        │                             │  OpenAI-compatible call      │
        │                             │ ──────────────────────────► │
        │                             │ ◄── streaming tokens ────── │
        │  SSE: data: {"token":"..."}  │                              │
        │ ◄────────────────────────── │                              │
        │  SSE: data: [DONE]          │                              │
        │ ◄────────────────────────── │                              │
        │                             │  upsert WorkspaceConversation │
        │                             │                              │
```

LLM responses are streamed via `ReadableStream` + `TextEncoder` with SSE framing. On completion, the full conversation is persisted to `WorkspaceConversation` via Prisma.

### LLM Strategy

All LLM calls flow through a unified factory (`lib/llm.ts`) that:
1. Tries **NVIDIA NIM** (`meta/llama-3.1-70b-instruct`) with the user's API key
2. Falls back to **Groq Cloud** (`llama3-70b-8192`) if NVIDIA is unavailable

Route handlers **never** import LLM client libraries directly — they always use `getLLMClient()`.

![Architecture Diagram](./docs/architecture.png)

---

## Getting Started

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **PostgreSQL** database — [Supabase](https://supabase.com/) free tier is recommended
- **NVIDIA NIM API key** — [Get one here](https://build.nvidia.com/explore/discover) (or a Groq Cloud key as fallback)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/learnforge.git
cd learnforge

# Install dependencies (uses package-lock.json for deterministic installs)
npm ci

# Copy environment variables and fill them in
cp .env.example .env.local
```

### Environment Setup

Edit `.env.local` with your configuration. At minimum you need:

```env
# Database
DATABASE_URL="postgresql://..."           # Your Supabase PostgreSQL connection string

# Auth
NEXTAUTH_SECRET="generate-a-random-secret"
NEXTAUTH_URL="http://localhost:3000"

# LLM (at least one)
NVIDIA_API_KEY="nvapi-..."                # NVIDIA NIM API key (primary)
GROQ_API_KEY="gsk_..."                    # Groq Cloud API key (fallback)

# Supabase (for storage / realtime)
NEXT_PUBLIC_SUPABASE_URL="https://..."
SUPABASE_SERVICE_ROLE_KEY="..."
```

### Database Setup

```bash
# Apply migrations to your local database
npx prisma migrate dev

# Seed demo data (2 courses, 8 lessons, 3 users — idempotent, safe to re-run)
npx prisma db seed

# (Optional) Open Prisma Studio to inspect data
npx prisma studio
```

### Start Development

```bash
npm run dev
```

Visit **[http://localhost:3000](http://localhost:3000)** and click **"Try Demo"** to explore the platform immediately, or log in with the demo credentials below.

---

## Project Structure

```
learnforge/
├── app/
│   ├── (auth)/
│   │   ├── login/                    # Login page (credentials + GitHub OAuth)
│   │   └── register/                 # Registration page
│   ├── (dashboard)/
│   │   ├── dashboard/                # Enrolled courses overview
│   │   └── courses/                  # Course catalog
│   ├── (player)/
│   │   └── learn/[courseSlug]/[lessonSlug]/  # ★ THE CORE — split-pane player
│   ├── (admin)/
│   │   └── admin/
│   │       ├── courses/              # Course CRUD
│   │       └── users/                # User management
│   └── api/
│       ├── courses/                  # Course + enrollment endpoints
│       ├── lessons/                  # Lesson + progress + completion
│       ├── workspace/                # Chat SSE, history, hint
│       └── validate-task/            # AI task validation
├── components/
│   ├── player/                       # SplitPane, AiWorkspace, ChatMessage, etc.
│   ├── courses/                      # CourseCard, ModuleAccordion, ProgressBar
│   ├── admin/                        # CourseForm, LessonEditor, UserTable
│   └── ui/                           # shadcn/ui primitives (DO NOT edit directly)
├── hooks/
│   ├── useWorkspaceChat.ts           # Chat state, SSE handling, history
│   ├── useLessonProgress.ts          # Optimistic progress updates
│   └── useResizablePanel.ts          # Panel width → localStorage
├── lib/
│   ├── db.ts                         # Prisma client singleton
│   ├── auth.ts                       # NextAuth.js configuration
│   ├── nvidia.ts / groq.ts / llm.ts  # LLM clients (factory pattern)
│   ├── stream.ts                     # SSE streaming helpers
│   ├── validate-task.ts              # LangChain task validation chain
│   ├── env.ts                        # Zod-validated env (fail-fast on startup)
│   └── utils.ts                      # cn(), slugify(), formatTokens()
├── prisma/
│   ├── schema.prisma                 # Single source of DB truth (8 models)
│   ├── migrations/                   # Never edit manually
│   └── seed.ts                       # Idempotent demo data (upsert only)
├── types/
│   ├── course.ts / lesson.ts         # Zod schemas + inferred TS types
│   ├── workspace.ts                  # ChatMessage, ChatRequest schemas
│   └── api.ts                        # Standardized ApiError shape
├── tests/
│   ├── unit/lib/                     # Pure function tests (Vitest)
│   ├── integration/api/              # API CRUD + workflow tests (Vitest + test DB)
│   └── e2e/                          # Playwright E2E specs
├── SPEC.md                           # Full feature specification
├── DESIGN.md                         # Complete visual design system
└── AGENTS.md                         # AI agent instructions
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js development server |
| `npm run build` | Generate Prisma client + production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint (zero warnings policy) |
| `npm run format` | Prettier format check |
| `npm run format:fix` | Prettier format write |
| `npm run typecheck` | `tsc --noEmit` (must pass before commits) |
| `npm test` | Vitest unit + integration tests with coverage |
| `npm run test:watch` | Vitest in watch mode |
| `npm run test:e2e` | Playwright E2E tests (requires dev server) |
| `npm run prisma:generate` | Regenerate Prisma client |
| `npm run prisma:migrate` | Create + apply dev migration |
| `npm run prisma:seed` | Seed demo data (idempotent) |
| `npm run prisma:studio` | Open Prisma Studio DB browser |

---

## API Overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/courses` | Public | List published courses |
| `POST` | `/api/courses` | Admin | Create course |
| `GET` | `/api/courses/:id` | Public | Get course with modules + lessons |
| `PATCH` | `/api/courses/:id` | Admin | Update course |
| `DELETE` | `/api/courses/:id` | Admin | Delete course |
| `POST` | `/api/courses/:id/enroll` | Learner | Enroll user in course |
| `GET` | `/api/lessons/:id` | Learner | Get lesson data |
| `PATCH` | `/api/lessons/:id` | Admin | Update lesson |
| `POST` | `/api/lessons/:id/complete` | Learner | Mark lesson complete |
| `POST` | `/api/workspace/chat` | Learner | SSE streaming chat |
| `GET` | `/api/workspace/history` | Learner | Fetch conversation history |
| `DELETE` | `/api/workspace/history` | Learner | Clear conversation history |
| `POST` | `/api/workspace/hint` | Learner | Generate hint |
| `POST` | `/api/validate-task` | Learner | Validate task completion |

All endpoints validate inputs with **Zod schemas** and return standardized error responses:
```typescript
type ApiError = {
  error: string;
  code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "CONFLICT";
};
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | ✅ | NextAuth.js encryption secret |
| `NEXTAUTH_URL` | ✅ | Application URL |
| `NVIDIA_API_KEY` | ⚠️ | NVIDIA NIM API key (primary LLM) |
| `GROQ_API_KEY` | ⚠️ | Groq Cloud key (fallback LLM) |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key (server-only) |
| `SENTRY_DSN` | ❍ | Sentry error tracking DSN |

⚠️ At least one LLM key required. ❍ Optional.

See `.env.example` for the complete list with descriptions and sources.

---



---

## Demo Credentials

After seeding, you can log in with these accounts:

| Role | Email | Password |
|------|-------|----------|
| Learner (Demo) | `demo@learnforge.dev` | `demo-learner` |
| Admin | `admin@learnforge.dev` | `demo-admin` |
| Learner | `learner@learnforge.dev` | `demo-learner` |

Click **"Try Demo"** on the landing page to auto-login as the demo learner with pre-enrolled courses.

---


