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
   |-- Data:          Supabase Data API -> Postgres + RLS   (current, Phase 3.5)
   |-- Auth:          Supabase Auth (SSR, cookies)
   |-- Files:         Supabase Storage (bucket for documents)
   `-- AI:            Gemini API via @google/genai (server code only)
```

There is **no separate Express backend**. Next.js is the full-stack application.

The runtime data path is:

```
Next.js (Server Components / Server Actions / Route Handlers)
    ↓
Supabase Auth            (session + verified claims)
    ↓
Supabase Data API        (typed client: src/lib/supabase/server.ts)
    ↓
PostgreSQL + RLS         (auth.uid() scopes every query)
```

Prisma was the data path during Phase 2 and has since been **removed**; it is no
longer a dependency, a script, or a data-access layer.

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
   |                             returns the public.users row
   |                                 |
   |                                 +--► public.users.id === auth.users.id
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
- `public.users.id` is the Supabase Auth user id. The row is created with an
  idempotent upsert in `src/lib/users.ts` using `ignoreDuplicates`, so repeated
  requests cannot create a duplicate or a mismatched id, and an existing row is
  never overwritten.
- **Request Memoization (`React.cache`)**: `requireUser()` and `ensureAppUser()` are
  wrapped with `cache()` from React. Next.js Server Components, layouts (`layout.tsx`),
  and Data Access Layer functions (`listNotes()`, `listResources()`, etc.) can call
  `requireUser()` independently without triggering redundant network roundtrips to
  Supabase. Within a single HTTP request lifecycle, the authentication and user record
  are fetched once and reused across all server callers.
- Auth errors are mapped to friendly messages in the Server Actions, so raw
  Supabase or database errors never reach the browser.
- Environment variables used by authentication: `NEXT_PUBLIC_SUPABASE_URL` and
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` (both public). `SUPABASE_SERVICE_ROLE_KEY` and
  `GEMINI_API_KEY` are not used by the auth flow; `DATABASE_URL` is no longer
  required and has been removed from `src/lib/env.ts`.

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
    supabase/client.ts Supabase client for Client Components
    supabase/server.ts Supabase client for Server Components/Actions,
                       typed with the generated Database generic
    supabase/database.types.ts
                       Supabase-generated types for the `public` schema.
                       Used as the `Database` generic on the server client.
    auth/actions.ts    register / login / logout Server Actions
    auth/session.ts    requireUser(), safeRedirectPath()
    auth/types.ts      form state type
    users.ts           ensureAppUser() - public.users upsert via Supabase Data API
    validations/auth.ts zod schemas for the auth forms
  hooks/               client hooks
supabase/migrations/   authoritative SQL migrations (Supabase native) - source of truth
docs/                  project memory (this folder)
```

Route groups:

- `src/app/(auth)/login`, `src/app/(auth)/register` — public
- `src/app/(app)/dashboard`, `/(app)/goals`, `/(app)/roadmaps`, `/(app)/resources`,
  `/(app)/notes`, `/(app)/summaries`, `/(app)/search`, `/(app)/recommendations` — authenticated app shell.

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
- **One data-access layer.** All reads and writes go through the typed Supabase
  client from `src/lib/supabase/server.ts`, using the user's own session so RLS
  applies. Never introduce a second ORM or a direct Postgres connection; there is
  no database connection string in the application anymore.
- **Verify, never trust cookies.** Authorize with `getClaims()`/`getUser()`.
- **Add new pages to the Proxy lists.** Protected route prefixes live in
  `PROTECTED_PREFIXES` in `src/proxy.ts`; a new protected area must be added
  there *and* call `requireUser()`.
- **UI primitives from shadcn/ui.** Add new primitives with
  `npx shadcn@latest add <component>`; do not hand-roll new primitives.
- **Path alias** `@/*` -> `src/*`.
- **Per-request memoization.** Repeated server-side identity or context reads within
  a render pass must be wrapped in `React.cache()` to prevent waterfall roundtrips.
- **Immediate navigation feedback.** Route transitions are driven by React transitions;
  the root layout includes a lightweight top progress indicator to provide immediate
  visual feedback upon navigation link clicks while Server Components stream.
- **Static header rendering in loading states.** Do not skeleton static content
  (page titles, descriptions, breadcrumbs, and static action buttons). Skeletons are
  reserved strictly for data-dependent dynamic regions (cards, tables, metrics, lists).
  Headings and instructions must render instantly as real text in `loading.tsx` and
  around `<Suspense>`, providing immediate structural orientation and eliminating
  cumulative layout shifts (CLS).
- **Granular streaming (parallel Suspense boundaries).** In pages or dashboards
  featuring multiple independent widgets (e.g. quick metrics, analytics charts, and
  recent activity feeds), avoid bundling all queries into a monolithic `Promise.all`
  inside a single top-level `<Suspense>`. Instead, partition distinct macro-sections into
  dedicated Server Components with independent `<Suspense>` boundaries. Fast queries
  (e.g. summary counts) resolve and paint immediately without waiting for slower
  analytical or historical queries. To prevent N+1 issues and database pool saturation,
  queries must be scoped to macro-sections using batch PostgREST queries (never per-row
  loops) and share memoized auth sessions (`React.cache()`). Skeleton fallbacks must
  mirror the exact dimensions/min-heights of loaded content to prevent Cumulative
  Layout Shift (CLS).
- Keep modules small; avoid speculative abstractions and future-phase code.

## Key libraries

| Concern            | Choice                                  |
| ------------------ | --------------------------------------- |
| Framework          | next 16.3 (App Router, RSC, Turbopack) |
| Language           | typescript 5.9, strict                  |
| Styling            | tailwindcss 4.3, shadcn/ui (radix-nova) |
| Database           | supabase-js (Data API) + RLS -> Supabase Postgres |
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
  browser. `SUPABASE_SERVICE_ROLE_KEY` and `GEMINI_API_KEY` are read exclusively
  from `server-only` modules and are validated by zod. `DATABASE_URL` is no
  longer read by the application and is no longer validated.
- The service-role key is not needed by the authentication flow. If a future
  feature does not need to bypass RLS, do not introduce it.
- `redirectTo` query values are validated by `safeRedirectPath()`, so a crafted
  link cannot redirect a user to an external site after signing in.
- RLS is the security boundary for the Supabase Data API: it is enabled on all 10
  tables in `public` with per-user policies based on `auth.uid()`. This is now
  **live and verified** in the database, not just designed — 36 policies, every
  one `TO authenticated`, RLS enabled but not forced. `anon` has no table
  grants. Application-level `user_id` filtering is a second layer, not the only
  one. `roadmap_steps` inherits ownership from `roadmaps` through an `EXISTS`
  subquery, and every policy on a nullable cross-entity reference
  (`roadmaps.goal_id`, `resources.goal_id`, `notes.resource_id`,
  `summaries.resource_id`) verifies that the referenced row belongs to the same
  user, so a cross-user reference cannot be inserted. The Phase 1A schema
  transition added `goal_roadmaps` and `step_resources` join tables with
  two-sided ownership checks, `notes.step_id` with step-ownership validation, and
  `learning_goals.priority`.
- Supabase Auth and `public.users` remain **two separate entities**.
  `public.users.id` mirrors `auth.users.id` by application convention — there is
  no foreign key to `auth.users`, no sync trigger, and no column default; the
  value is supplied by the application.
- **Every application query now runs as the signed-in user.** Since Prisma and
  the `DATABASE_URL` role are gone, the application cannot bypass RLS: there is no
  owner-role connection string in the code at all. This removes the previous
  caveat that RLS was "enabled but not forced, so the owner role could still
  read the tables". The Supabase service-role key remains the only RLS bypass,
  and it is still not used by the authentication flow.
- `src/lib/users.ts` writes `public.users` through the **Supabase Data API** using
  the authenticated client from `src/lib/supabase/server.ts`, typed with the
  generated `Database` generic. `ignoreDuplicates: true` means the insert maps to
  `ON CONFLICT DO NOTHING`, so the row is created once and never overwritten.
- `src/lib/supabase/server.ts` is used for **both** Auth (`getClaims()`,
  `getUser()`) and data access. `src/lib/supabase/database.types.ts` is imported
  by that client as its `Database` generic, so table and column names are
  typechecked. `src/lib/supabase/client.ts` is still unused.
- RLS is enabled but not `FORCE`d on the tables; that only affects the
  table-owner and service-role paths, neither of which the application uses.
  `FORCE` remains an open decision (see `docs/DATABASE.md`).

## Deployment

Vercel (Next.js runtime, Node). Environment variables configured in the Vercel
project settings, not committed. Deployment happens in Phase 13.
