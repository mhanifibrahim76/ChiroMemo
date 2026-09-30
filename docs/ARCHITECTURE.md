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

## Authentication (Phase 3)

```
Browser
   |  form submit -> Server Action
   v
src/lib/auth/actions.ts    zod validation, then Supabase Auth
   |  signUp / signInWithPassword / signOut
   v
Supabase Auth  ──►  session in cookies (sb-<project-ref>-auth-token)
   |
   +--► src/proxy.ts             refreshes the token on every request
   |                             (getClaims + getAll/setAll cookies)
   |
   +--► src/lib/auth/session.ts  requireUser(): re-verifies the token and
   |                             returns the public.User row
   |                                 |
   |                                 +--► public.User.id === auth.users.id
   v
/dashboard (protected)
```

- `src/lib/supabase/server.ts` — Server Components, Server Actions, Route
  Handlers. A new client per request; `setAll` writes refreshed cookies.
- `src/lib/supabase/client.ts` — Client Components. Public config only.
- `src/proxy.ts` — Next.js 16 renamed `middleware.ts` to `proxy.ts`. A file
  named `middleware.ts` is never called, which would stop token refreshes and
  sign users out.
- **Never** authorize server code with `getSession()`: it reads the cookie
  without revalidating it. Use `auth.getClaims()` (verifies the signature) or
  `auth.getUser()` when a fresh user record is required.
- The Proxy is a convenience redirect, not the security boundary. Every
  protected page calls `requireUser()` as well, because a Server Action can be
  invoked directly without passing through the Proxy.
- `public.User.id` is the Supabase Auth user id. The row is created with an
  idempotent `upsert` in `src/lib/users.ts`, so repeated requests cannot create
  a duplicate or a mismatched id.
- Auth errors are mapped to friendly messages in the Server Actions, so raw
  Supabase or database errors never reach the browser.
- Environment variables used by authentication:
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public) and
  `DATABASE_URL` (registering creates the `public.User` row).
  `SUPABASE_SERVICE_ROLE_KEY` and `GEMINI_API_KEY` are not used here.

## Project layout (current)

```
src/
  proxy.ts             session refresh + protected route redirects (Next 16)
  app/
    layout.tsx         root layout, metadata, fonts, TooltipProvider
    page.tsx           home page
    globals.css        Tailwind v4 + shadcn theme tokens
    (auth)/            login, register - public
    (app)/             authenticated app shell (header, sign out)
  components/
    ui/                shadcn/ui primitives (Radix based)
    auth/              login and register form components
  lib/
    utils.ts           cn() class-name helper
    env.ts             zod-validated env (server-only, lazy)
    db.ts              Prisma 7 client, lazy singleton (getPrismaClient)
    supabase/client.ts Supabase client for Client Components
    supabase/server.ts Supabase client for Server Components/Actions
    auth/actions.ts    register / login / logout Server Actions
    auth/session.ts    requireUser(), safeRedirectPath()
    auth/types.ts      form state type
    users.ts           ensureAppUser() - public.User upsert
    validations/auth.ts zod schemas for the auth forms
  hooks/               client hooks
  generated/prisma/    generated Prisma Client (git-ignored, `npm run db:generate`)
prisma/                schema.prisma, migrations
prisma.config.ts       Prisma 7 CLI config (schema path, migrations path, db url)
docs/                  project memory (this folder)
```

Route groups:

- `src/app/(auth)/login`, `src/app/(auth)/register` — public
- `src/app/(app)/dashboard` — authenticated app shell. `/(app)/goals`,
  `/(app)/roadmaps`, `/(app)/resources`, `/(app)/notes` and `/(app)/search`
  are added in their own phases.

## Conventions

- **Server-first.** Data reads and writes live in Server Components / Server
  Actions / Route Handlers. Client Components handle interactivity only.
- **Every data access is user-scoped.** Use the Supabase Auth user id from the
  server session; never accept a `userId` from the client as authority.
- **Validation at the boundary.** zod schema per Server Action / route input, and
  per AI response (AI output is untrusted).
- **Secrets stay server-side.** `src/lib/env.ts` is `server-only` and parses
  lazily through `getSupabasePublicEnv()` and `getServerEnv()`, so importing a
  server module does not fail because an unrelated variable is missing, and the
  auth flow does not require the AI key. Gemini and the Supabase service-role
  key are never imported into client modules.
- **One Prisma client.** `src/lib/db.ts` exports `getPrismaClient()`, a
  `server-only` lazy singleton cached on `globalThis`, so hot reloads do not
  open a new connection pool and importing a module never needs a live
  database. Use it from Server Components, Server Actions and Route Handlers
  only.
- **Verify, never trust cookies.** Authorize with `getClaims()`/`getUser()`.
- **Add new pages to the Proxy lists.** Protected route prefixes live in
  `PROTECTED_PREFIXES` in `src/proxy.ts`; a new protected area must be added
  there *and* call `requireUser()`.
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
| Database           | prisma 7.10 + @prisma/adapter-pg + pg  -> Supabase Postgres |
| Auth               | @supabase/ssr + supabase-js             |
| File storage       | Supabase Storage                        |
| AI                 | @google/genai (Gemini API)              |
| Charts             | recharts 3                               |
| Icons              | lucide-react 1                          |
| Validation         | zod 4                                   |

## Security notes

- `.env.local` is git-ignored; only `.env.example` is committed.
- `src/proxy.ts` refreshes the Supabase session and redirects unauthenticated
  visitors away from protected routes. It is a convenience layer: protected
  pages must also call `requireUser()`.
- Only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` reach the
  browser. `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL` and `GEMINI_API_KEY` are
  read exclusively from `server-only` modules and are validated by zod.
- The service-role key is not needed by the authentication flow. If a future
  feature does not need to bypass RLS, do not introduce it.
- `redirectTo` query values are validated by `safeRedirectPath()`, so a crafted
  link cannot redirect a user to an external site after signing in.
- RLS is enabled on Supabase tables; the Prisma connection uses the
  `DATABASE_URL` role and every query is filtered by user id in application code.

## Deployment

Vercel (Next.js runtime, Node). Environment variables configured in the Vercel
project settings, not committed. Deployment happens in Phase 13.
