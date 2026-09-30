# Session Log

Newest entry at the bottom. Keep entries short.

## Format

```
## <date> — <title>
Completed: ...
Files: ...
Decisions: ...
Phase: ...
Next: ...
Issues: ...
```

---

## 2026-09-30 — Phase 1: project foundation

Completed: Created the Next.js project foundation. App Router + `src/` dir +
`@/*` alias, TypeScript strict, Tailwind CSS v4, shadcn/ui initialised (Radix
base, `nova` style) with core UI primitives. Added env template, zod-validated
server env module, and the full `docs/` memory set. Placeholder home page.
No application features implemented.

Files: `package.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`,
`components.json`, `.gitignore`, `.env.example`, `AGENTS.md`, `README.md`,
`src/app/layout.tsx`, `src/app/page.tsx`, `src/lib/env.ts`, `src/lib/utils.ts`,
`src/hooks/.gitkeep`, `src/components/ui/*` (button, card, input, label,
textarea, badge, progress, separator, dialog, select, tabs, dropdown-menu,
skeleton, table, tooltip), `docs/*.md`.

Decisions:
- Next.js is the only backend; no Express server.
- Versions: next 16.3.7, react 19.2.8, tailwindcss 4.3.3, prisma 7.10.0,
  @google/genai 2.24.0, @supabase/supabase-js 2.117.2, @supabase/ssr 0.12.7,
  recharts 3.10.1, zod 4.6.5, lucide-react 1.49.0.
- Gemini is called through `@google/genai` (current SDK), server-side only.
- Server secrets are read only via `src/lib/env.ts` (`server-only` + zod), which
  fails fast at startup rather than at first use.
- The generated `CLAUDE.md` from create-next-app was deleted; `AGENTS.md` is the
  single agent-instruction file.
- `npm run typecheck` script added (`tsc --noEmit`).
- The npm package name is `chiromemo` (lowercase) because npm rejects capitals.
- The design in `docs/DATABASE.md` is a plan; the Prisma schema is Phase 2.

Phase: 1 (complete) — next is Phase 2.

Next: Phase 2 — write `prisma/schema.prisma` from `docs/DATABASE.md`, add the
Prisma client singleton `src/lib/db.ts`, configure `DATABASE_URL` for Supabase
Postgres, run the initial migration. Read the Prisma 7 upgrade notes first
(Prisma 7 changed generator output and config handling).

Issues:
- `npm audit` reports 4 high-severity advisories in `prisma` -> `@prisma/config`
  -> `deepmerge-ts` and `prisma` -> `mysql2` (unused with PostgreSQL). They are
  dev-CLI only and `npm audit fix --force` would downgrade to Prisma 6. Left as
  is; re-check in Phase 13.
- `next-env.d.ts` is git-ignored (create-next-app default).
- No real Supabase project or Gemini key configured yet, so no runtime AI/auth
  verification is possible.
- No test runner installed yet (deferred to Phase 13).

## 2026-09-30 — Phase 2: database and Prisma

### Current Phase

Phase 2 — Database and Prisma (complete)

### Completed

- Verified the Prisma 7 approach against the installed CLI instead of Prisma 6
  tutorials: `prisma.config.ts`, generator `prisma-client` with a required
  `output`, no `url` in the datasource block, and a required `pg` driver adapter
  at runtime.
- Wrote `prisma/schema.prisma`: 8 models (User, LearningGoal, Roadmap,
  RoadmapStep, Resource, Note, Summary, LearningActivity) and 4 enums
  (GoalStatus, RoadmapStepStatus, ResourceType, ActivityType), following
  `docs/DATABASE.md`. No design conflicts were found.
- Added `prisma.config.ts` (loads `.env.local` then `.env` through `dotenv`).
- Added `src/lib/db.ts`: `server-only` Prisma client singleton using
  `@prisma/adapter-pg`, cached on `globalThis` in development.
- Changed `src/lib/env.ts` from a module-load parse to a lazy `getServerEnv()`
  so importing the DB layer does not require unrelated variables.
- Generated the initial migration SQL with the read-only `prisma migrate diff`
  (no database was invented or contacted).
- Installed `@prisma/adapter-pg`, `pg`, `dotenv`, `@types/pg`; added `db:*`
  npm scripts and a `postinstall` that runs `prisma generate`; git-ignored and
  eslint-ignored `src/generated/prisma`.

### Files Changed

Created: `prisma.config.ts`, `prisma/schema.prisma`,
`prisma/migrations/20260930000000_init/migration.sql`,
`prisma/migrations/migration_lock.toml`, `src/lib/db.ts`.

Modified: `src/lib/env.ts`, `package.json`, `package-lock.json`, `.gitignore`,
`.env.example`, `eslint.config.mjs`, `docs/DATABASE.md`, `docs/ARCHITECTURE.md`,
`docs/PROJECT_CONTEXT.md`, `docs/ROADMAP.md`, `docs/SESSION_LOG.md`.

### Verification

| Command                                   | Result |
| ----------------------------------------- | ------ |
| `npm run db:validate`                     | pass — schema is valid |
| `npm run db:generate`                     | pass — client to `src/generated/prisma` |
| `npx prisma migrate diff --from-empty ... --script` | pass — `migration.sql` produced |
| `npm run typecheck`                       | pass |
| `npm run lint`                            | pass |
| `npm run build`                           | pass |
| temporary probe route calling `prisma.user.count()` with a dummy host | client loaded, adapter ran a real query, failed only with `Can't reach database server at 127.0.0.1:5432` (expected); probe files deleted afterwards |

### Blocked / Known Issues

- **The migration has not been applied to a database.** No Supabase credentials
  were available, so `prisma migrate dev` / `db:deploy` were not run and no
  connection was verified. The SQL exists and is unverified against a live
  Postgres. Do not describe the database as working until this is done.
- When Supabase is available: set `DATABASE_URL` to the direct connection or the
  session pooler (not the transaction pooler on 6543), then run
  `npm run db:deploy`.
- The generated client uses extensionless ESM imports, so it only loads through
  the Next.js bundler. Importing it from a plain Node script fails.
- `npm audit` still reports the Prisma CLI advisories from Phase 1.

### Next Task

Phase 3 — Authentication: Supabase Auth with `@supabase/ssr` (register, login,
logout, session refresh and route protection via `proxy.ts`, app shell layout).
Apply the pending migration first.

## 2026-09-30 — Phase 3: authentication

### Current Phase

Phase 3 — Authentication (complete)

### Completed

- Added the Supabase SSR clients: `src/lib/supabase/server.ts` (Server
  Components, Server Actions, Route Handlers) and `src/lib/supabase/client.ts`
  (Client Components, public config only). Both use the `getAll`/`setAll`
  cookie API required by `@supabase/ssr` 0.12; the older `get`/`set`/`remove`
  API is deprecated.
- Added `src/proxy.ts` (Next.js 16 renamed `middleware.ts` to `proxy.ts`, and a
  file named `middleware.ts` is never called). It calls
  `supabase.auth.getClaims()` to refresh the token, writes refreshed cookies to
  both the request and the response, applies the anti-caching headers, redirects
  unauthenticated visitors away from protected routes, and sends signed-in users
  away from `/login` and `/register`.
- Added the auth Server Actions in `src/lib/auth/actions.ts`
  (`registerAction`, `loginAction`, `logoutAction`) with zod validation in
  `src/lib/validations/auth.ts`.
- Added `requireUser()` in `src/lib/auth/session.ts`: re-verifies the token with
  `getClaims()` and returns the application user. Used by the app layout and the
  dashboard.
- Added `src/lib/users.ts` with `ensureAppUser()`, an idempotent
  `prisma.user.upsert` keyed by the Supabase Auth id, so the Auth user and
  `public.User` always share one id and repeated requests cannot duplicate it.
- Added pages `/login`, `/register` and the protected `/dashboard` placeholder,
  plus the `(auth)` and `(app)` route groups, two form components and the app
  shell header with a sign-out button.
- Split `src/lib/env.ts` into `getSupabasePublicEnv()` and `getServerEnv()`, so
  the auth flow no longer requires the AI key.
- Changed `src/lib/db.ts` to a lazy `getPrismaClient()`. It previously built the
  client at import time, which made `next build` fail whenever a route
  transitively imported it without database credentials.
- The Prisma schema was **not** changed: `User.id` already stores the Supabase
  Auth user id.

### Files Changed

Created: `src/proxy.ts`, `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`,
`src/lib/auth/actions.ts`, `src/lib/auth/session.ts`, `src/lib/auth/types.ts`,
`src/lib/users.ts`, `src/lib/validations/auth.ts`, `src/components/auth/login-form.tsx`,
`src/components/auth/register-form.tsx`, `src/app/(auth)/layout.tsx`,
`src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx`,
`src/app/(app)/layout.tsx`, `src/app/(app)/dashboard/page.tsx`.

Modified: `src/lib/env.ts`, `src/lib/db.ts`, `src/app/page.tsx`, `.env.example`,
`docs/ARCHITECTURE.md`, `docs/ROADMAP.md`, `docs/SESSION_LOG.md`.

### Authentication Flow

```
register/login form
  → src/lib/auth/actions.ts (zod, then Supabase Auth)
  → session stored in cookies by @supabase/ssr
  → src/proxy.ts refreshes the token on every request
  → /dashboard page calls requireUser() → getClaims() verifies the JWT
  → ensureAppUser() upserts public.User with id = auth.users.id
```

### Verification

| Command | Result |
| ------- | ------ |
| `npm run typecheck` | pass |
| `npm run lint` | pass |
| `npm run build` | pass — `/dashboard` and `/login` server-rendered on demand, Proxy registered |
| `next start` with placeholder Supabase values, `GET /dashboard` | `307` to `/login?redirectTo=%2Fdashboard` |
| `next start`, `GET /login`, `/register`, `/` | `200` |

### Runtime Verification

**Not tested against a real Supabase project** — no credentials exist, and none
were invented. Confirmed statically and with placeholder values: the Proxy
redirects an unauthenticated request for `/dashboard` to `/login`, the auth
pages render, and the build is clean. Still unverified: a real sign-up, the
confirmation email, sign-in, sign-out, token refresh, session persistence, and
that `public.User.id` equals the Auth id in a real database. The Phase 2
migration is also still unapplied.

### Known Issues

- No live Supabase credentials, so the whole auth flow is unverified at runtime.
- The `init` migration from Phase 2 is still not applied; registering needs the
  `public.User` table to exist. Apply it with `npm run db:deploy` first.
- `src/lib/supabase/client.ts` is not used by any page yet. It exists for the
  browser-side Supabase features of later phases.
- `PROTECTED_PREFIXES` in `src/proxy.ts` must be extended when new protected
  areas are added; the `(app)` route group alone does not protect a route.

### Next Task

Phase 4 — Learning Goal Management: create, list, view, update, archive and
delete learning goals with Server Actions, zod validation, and
`LearningActivity` events, behind the existing `requireUser()` protection.
