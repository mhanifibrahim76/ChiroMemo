# Architecture

## Request flow

```
Browser (Client Components)
   |
   |  Server Actions / forms / fetch to Route Handlers
   v
Next.js (App Router, runs on Vercel)
   |-- UI:            src/app/** , src/components/**
   |-- Server:        Server Components, Server Actions, Route Handlers
   |-- Validation:    zod schemas
   |-- Data:          Prisma Client        -> Supabase Postgres
   |-- Auth:          Supabase Auth (SSR, cookies)
   |-- Files:         Supabase Storage (bucket for documents)
   `-- AI:            Gemini API via @google/genai (server code only)
```

There is **no separate Express backend**. Next.js is the full-stack application.

## Project layout (current)

```
src/
  app/
    layout.tsx        root layout, metadata, fonts, TooltipProvider
    page.tsx          placeholder home page
    globals.css       Tailwind v4 + shadcn theme tokens
  components/
    ui/               shadcn/ui primitives (Radix based)
    layout/           app shell components (from Phase 3+)
  lib/
    utils.ts          cn() class-name helper
    env.ts            zod-validated server env (server-only)
  hooks/              client hooks
docs/                 project memory (this folder)
prisma/               Prisma schema + migrations (Phase 2)
```

Intended route groups (created when the phase needs them):

- `src/app/(auth)/login`, `src/app/(auth)/register` — public, unauthenticated
- `src/app/(app)/dashboard`, `/(app)/goals`, `/(app)/roadmaps`, `/(app)/resources`,
  `/(app)/notes`, `/(app)/search` — authenticated app shell

## Conventions

- **Server-first.** Data reads and writes live in Server Components / Server
  Actions / Route Handlers. Client Components handle interactivity only.
- **Every data access is user-scoped.** Use the Supabase Auth user id from the
  server session; never accept a `userId` from the client as authority.
- **Validation at the boundary.** zod schema per Server Action / route input, and
  per AI response (AI output is untrusted).
- **Secrets stay server-side.** `src/lib/env.ts` is `server-only`. Gemini and the
  Supabase service-role key are never imported into client modules.
- **UI primitives from shadcn/ui.** Add new primitives with
  `npx shadcn@latest add <component>`; do not hand-roll new primitives.
- **Path alias** `@/*` -> `src/*`.
- Keep modules small; avoid speculative abstractions and future-phase code.

## Key libraries

| Concern            | Choice                                  |
| ------------------ | --------------------------------------- |
| Framework          | next 16.3 (App Router, RSC, Turbopack) |
| Language           | typescript 5.9, strict                  |
| Styling            | tailwindcss 4.3, shadcn/ui (radix-nova) |
| Database           | prisma 7.10 -> Supabase Postgres        |
| Auth               | @supabase/ssr + supabase-js             |
| File storage       | Supabase Storage                        |
| AI                 | @google/genai (Gemini API)              |
| Charts             | recharts 3                               |
| Icons              | lucide-react 1                          |
| Validation         | zod 4                                   |

## Security notes

- `.env.local` is git-ignored; only `.env.example` is committed.
- `middleware.ts` (Next 16 calls it `proxy.ts`) will guard authenticated routes
  and refresh the Supabase session — introduced in Phase 3.
- RLS is enabled on Supabase tables; the Prisma connection uses the
  `DATABASE_URL` role and every query is filtered by user id in application code.

## Deployment

Vercel (Next.js runtime, Node). Environment variables configured in the Vercel
project settings, not committed. Deployment happens in Phase 13.
