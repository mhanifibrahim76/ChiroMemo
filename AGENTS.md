# ChiroMemo — Agent Instructions

ChiroMemo is a **Personal Learning and Knowledge Management System (PLKMS)** for
university students. Single-user application (each student uses their own account).

## Read first (mandatory)

Before changing any code, read these in order:

1. `AGENTS.md` (this file)
2. `docs/PROJECT_CONTEXT.md`
3. `docs/ARCHITECTURE.md`
4. `docs/ROADMAP.md`
5. `docs/SESSION_LOG.md`
6. The relevant source files

Do not rely on chat history. The `docs/` folder is the project memory.

## Technology stack

- Next.js (App Router, `src/` dir, `@/*` alias)
- TypeScript (strict)
- Tailwind CSS + shadcn/ui (Radix base, `nova` preset, `nova` style)
- Supabase Postgres + Supabase Auth + Supabase Storage
- Supabase Data API (PostgREST) + RLS (no Prisma)
- Gemini API via `@google/genai` (**server-side only**)
- Recharts (charts), lucide-react (icons), zod (validation)
- Vercel (deployment)

**No separate Express backend.** Next.js is the full-stack application:
UI → Server Components → Server Actions / Route Handlers → Supabase Data API → Supabase Postgres.

## Hard rules

1. Gemini API calls only from server code (Server Actions, Route Handlers, server
   components). Never import `GEMINI_API_KEY` in a `"use client"` module.
2. Server secrets (`DATABASE_URL`, `GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)
   never reach the client. Read them through `src/lib/env.ts`.
3. Validate all writes with zod schemas. Validate AI output too — it is untrusted input.
4. Never query another user's data. Every read/write is scoped by the Supabase
   Auth user id.
5. Supabase Storage for uploaded documents; only store file paths in Postgres.
6. Do not add lecturer, admin, collaborative, or social features.
7. Do not install duplicate libraries; check `package.json` first.
8. Reuse existing components in `src/components/`; prefer shadcn/ui primitives.

## Working in phases

Only work on the **current** phase in `docs/ROADMAP.md`. Do not start the next
phase automatically. Keep changes modular and minimal — no speculative
abstractions, no future features.

## Checkpoint rule

Before a large task: inspect the repo, read the roadmap, identify the current
phase, produce a short plan.

After implementing:

```bash
npm run typecheck
npm run lint
```

Never claim something works without verification.

## After every meaningful task

1. Update `docs/PROJECT_CONTEXT.md` / `docs/ARCHITECTURE.md` / `docs/DATABASE.md`
   if behaviour or structure changed.
2. Update `docs/ROADMAP.md` when phase status changes.
3. Append a short entry to `docs/SESSION_LOG.md` with: what was completed, files
   changed, decisions, current phase, next task, known issues. Keep it short.
4. Prepare a small, single-purpose commit, e.g. `feat: add learning goals`.

## Ambiguity

If a requirement is unclear: do not guess silently. State the ambiguity, and make
the smallest reasonable choice only when it does not affect architecture or data.
