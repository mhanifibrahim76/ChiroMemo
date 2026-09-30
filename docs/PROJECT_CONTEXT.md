# Project Context

## What is ChiroMemo

A Personal Learning and Knowledge Management System (PLKMS) web application for
university students. Each student uses their own account and manages their own
learning material. There are no lecturers, admins, teams, or sharing features.

## Feature scope (source of truth)

1. User registration and login
2. Learning goal management
3. Learning roadmap management
4. Learning progress tracking
5. Learning resource management
6. Personal note management
7. AI-powered intelligent search
8. AI-powered document summarization
9. Personalized learning recommendations
10. Dashboard and learning analytics

Out of scope (do not add): lecturer/admin portals, collaboration, social
networking, chat, enterprise reporting, multi-tenancy.

## Audience

University students who need to: set learning goals, break them into roadmaps,
collect resources (PDF, video, website, book, course), take notes, track
progress, and get AI help summarising documents and finding knowledge.

## Domain

`User`, `LearningGoal`, `Roadmap`, `RoadmapStep`, `Resource`, `Note`, `Summary`,
`LearningActivity`. See `docs/DATABASE.md` for the field-level plan.

## Technology stack

Next.js App Router (full-stack, no separate Express server) · TypeScript strict ·
Tailwind CSS v4 · shadcn/ui (Radix base, `nova` style) · Supabase Postgres +
Supabase Auth + Supabase Storage · Prisma ORM · Gemini API (`@google/genai`,
server-side only) · Recharts · lucide-react · zod · Vercel.

## Current state

Phase 1 (project foundation) complete. No application features implemented yet.

## Environment variables

Defined in `.env.example`, validated in `src/lib/env.ts`:

- `DATABASE_URL` — Supabase Postgres connection string for Prisma
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — public anon key
- `SUPABASE_SERVICE_ROLE_KEY` — server-only
- `GEMINI_API_KEY` — server-only

## Commands

```bash
npm run dev        # dev server
npm run build      # production build
npm run start      # serve production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```
