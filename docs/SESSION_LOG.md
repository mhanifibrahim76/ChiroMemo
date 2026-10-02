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

## 2026-10-02 — Supabase native schema + RLS migration (authored, not applied)

### Current Phase

Phase 3.5 — Supabase native schema + RLS (in progress)

### Completed

- Read `AGENTS.md` and all `docs/` files, `prisma/schema.prisma` and the existing
  migration. The requested path
  `prisma/migrations/20260930000000_init/migration.sql` no longer existed: the
  file had already been moved (staged rename) to
  `supabase/migrations/20260930000000_init_schema_and_rls.sql`, still with the
  old Prisma-generated content.
- Rewrote that file as the **complete initial database state** for Supabase
  native: 4 enums, 8 snake_case tables, `uuid` user ids, `timestamptz`,
  `updated_at DEFAULT now()` (no trigger), 11 foreign keys, 10 indexes,
  a CHECK and a UNIQUE constraint, grants, RLS enabled on all 8 tables and
  30 policies.
- RLS is treated as the security boundary. `roadmap_steps` ownership is resolved
  with an `EXISTS` subquery on `roadmaps`, and every policy on a nullable
  cross-entity reference (`roadmaps.goal_id`, `resources.goal_id`,
  `notes.resource_id`, `summaries.resource_id`) verifies that the referenced row
  belongs to the same user, so cross-user references cannot be written.
- Deliberate omissions: no `users` DELETE policy, no `learning_activities`
  UPDATE policy, no GIN index on `notes.tags`, no `updated_at` trigger, no FK to
  `auth.users`, no auth sync trigger, no `ResourceType` → `url`/`file_path`
  CHECK, no FK on `learning_activities.entity_id`.
- Updated `docs/DATABASE.md` (rewritten around the real column names, RLS matrix,
  migration status and transition state), `docs/ARCHITECTURE.md`,
  `docs/PROJECT_CONTEXT.md`, `docs/ROADMAP.md` and this log.

### Files Changed

Rewritten: `supabase/migrations/20260930000000_init_schema_and_rls.sql`.

Modified: `docs/DATABASE.md`, `docs/ARCHITECTURE.md`, `docs/PROJECT_CONTEXT.md`,
`docs/ROADMAP.md`, `docs/SESSION_LOG.md`.

Not touched: `prisma/schema.prisma` (already carried the `@db.Uuid` edit from the
previous task), `src/lib/db.ts`, `src/lib/users.ts`, `src/lib/env.ts`, the auth
flow, the UI, `package.json`, `prisma.config.ts`.

### Decisions

- **The old Prisma-generated migration was superseded, not extended.** It was
  never applied anywhere, so an `ALTER`-based second migration would have failed
  against an empty schema. The init file was rewritten in place. There is exactly
  one migration, and future changes must be new files.
- **Migrations live in `supabase/migrations/`**, the native Supabase location,
  and are applied with `supabase db push` or the SQL editor — not
  `prisma migrate`.
- No redundant `roadmap_steps_roadmap_id_idx`: the `UNIQUE (roadmap_id, "order")`
  constraint already creates an index with `roadmap_id` as the leading column.
  Same rule already applied to `resources (user_id, type)`.
- `users.email` is a named `UNIQUE` constraint (`users_email_key`) rather than an
  inline `UNIQUE`, so no duplicate index name is created.
- Added `REVOKE ALL ... FROM anon` and grants to `authenticated`. RLS alone is not
  reachable through PostgREST without table privileges, and revoking `anon` makes
  unauthenticated requests fail on permissions rather than on policy.
- RLS is `ENABLE`d, not `FORCE`d, so the owner/Prisma role can still read the
  tables. `FORCE` is left as an open decision.

### Verification

| Command / check | Result |
| --------------- | ------ |
| Static SQL check (paren balance, statement inventory, duplicate object names) | pass — 4 types, 8 tables, 10 indexes, 30 policies, 8 `ENABLE ROW LEVEL SECURITY`, 0 duplicate names |
| Negative assertions (no `timestamp(3)`, no camelCase columns, no FK to `auth.users`, no `updated_at` on `learning_activities`) | pass |
| `npm run db:validate` | pass |
| `npm run typecheck` | pass |
| `npm run lint` | pass |

### Known Issues

- **The migration has still never been executed.** The SQL is unverified against
  a real Postgres. Do not describe the database as working.
- `prisma/schema.prisma` has no `@@map` / `@map` attributes, so Prisma expects
  `User` / `userId` / `createdAt` identifiers that the native snake_case schema
  does not use. **Prisma cannot query this database correctly yet.** `prisma
  migrate dev/deploy` and `prisma studio` must not be run; `prisma/migrations/`
  holds only `migration_lock.toml`, so `db:deploy` is a no-op.
- `FORCE ROW LEVEL SECURITY` has not been decided.

### Next Task

Apply `supabase/migrations/20260930000000_init_schema_and_rls.sql` to Supabase —
as its own explicit task, with `supabase db push` or the SQL editor. After that,
separately: generate Supabase database types, move `src/lib/users.ts` from Prisma
to Supabase, then remove Prisma. None of that was done here.

## 2026-10-02 — Migration applied, schema verified, Supabase types generated

### Current Phase

Phase 3.5 — Supabase native schema + RLS (in progress; database is now live)

### Completed

- **Applied the initial migration.** `supabase/migrations/20260930000000_init_schema_and_rls.sql`
  was executed against the Supabase project through the **SQL Editor** as a single
  submission, returning `Success. No rows returned`. The Supabase CLI is not
  installed and `supabase/config.toml` does not exist, so `supabase db push` was
  not available; the file was authored with no `BEGIN`/`COMMIT` precisely so the
  editor could wrap it in one transaction.
- **Verified the live database read-only** with a catalog query pass (Q1-Q18, all
  PASS): 8 tables, 4 enums, 11 foreign keys (7 CASCADE, 4 SET NULL), primary keys
  on all 8 tables, `users.email` UNIQUE, `UNIQUE (roadmap_id, "order")`,
  `progress_percent` CHECK 0-100, RLS enabled and not forced on all 8 tables, 30
  policies all `TO authenticated`, no `users` DELETE policy, no
  `learning_activities` UPDATE policy, no user-defined trigger, and **0 rows in
  all 8 tables**. `anon` has no `public` table privileges; `authenticated` has the
  four table privileges; `service_role` is unchanged. `public.rls_auto_enable`
  already existed in the catalog and was left untouched.
- **Generated `src/lib/supabase/database.types.ts`** from the live `public`
  schema with `npx supabase gen types typescript --project-id <ref> --schema public`
  (Supabase CLI 2.119.0 via `npx`, obtained after a manual `supabase login` done
  by the user). Read-only: no database writes.
- **Converted the generated file from UTF-16LE to UTF-8 without BOM.** A PowerShell
  redirect had re-encoded the CLI output as UTF-16LE. The decoded-text SHA-256 was
  identical before and after (`9EB63DC3…54E6`), so only the encoding changed.
- `npm run typecheck` passes; `tsc --listFiles` confirms the types file is in the
  program.

### Files Changed

Created: `src/lib/supabase/database.types.ts`, `supabase/.temp/` (untracked
Supabase CLI artifact).

Modified (documentation only, this task): `docs/PROJECT_CONTEXT.md`,
`docs/DATABASE.md`, `docs/ARCHITECTURE.md`, `docs/SESSION_LOG.md`.

Not touched: `prisma/schema.prisma`, `src/lib/db.ts`, `src/lib/users.ts`,
`src/lib/env.ts`, `src/lib/supabase/database.types.ts` (encoding conversion only,
content unchanged), the applied migration, `package.json`, any `.env` file.

`docs/TASKS.md` does not exist in this project and was not created.

### Decisions

- The migration was applied by hand through the SQL Editor rather than
  `supabase db push`, because the CLI is absent and the project is not linked.
  Introducing the CLI and a `config.toml` was out of scope and would have changed
  `package.json`.
- The generated types are committed as-is from the CLI. No hand-written types were
  produced at any point.
- The `supabase/.temp/` CLI artifact was left in place rather than cleaned up, as
  unrequested cleanup is out of scope. It holds only a CLI version string and is
  conventionally gitignored.

### Known Issues / follow-ups

- **Prisma reconciliation is still outstanding.** `prisma/schema.prisma` has no
  `@@map` / `@map`, so Prisma still expects `User` / `userId` / `createdAt`. The
  `DATABASE_URL` role owns the tables and RLS is not forced, so no naming
  translation rescues it: `ensureAppUser()` will fail, and the register/login flow
  is expected to be broken while the database is live. Move `src/lib/users.ts` to
  the Supabase Data API, or add `@map` first.
- `database.types.ts` is **not imported anywhere**. Typed Supabase access is
  available but unused. `src/lib/supabase/client.ts` is still unused, and
  `src/lib/supabase/server.ts` is used only for Auth.
- The generated types cannot express `uuid` vs `text` (both are `string`), nor the
  UNIQUE and CHECK constraints. `progress_percent` is a plain `number`.
- `FORCE ROW LEVEL SECURITY` is still undecided. RLS is not a boundary for the
  `DATABASE_URL` / service-role path.
- There is still no `updated_at` trigger, so `updated_at` goes stale on update and
  must be set by application code.
- `supabase/config.toml` and a linked project are still absent, so the Supabase CLI
  workflow is not reproducible for a second developer.
- `supabase/.temp/` is untracked and not yet gitignored.
- The Prisma CLI advisories from Phase 1 are still outstanding (Phase 13).

## 2026-10-02 — Prisma retired: users.ts on Supabase Data API, audit, removal

### Current Phase

Phase 3.5 — Supabase native schema + RLS (now **complete**)

### Completed

- **Moved `src/lib/users.ts` from Prisma to the Supabase Data API.** It no longer
  imports `getPrismaClient()`. `ensureAppUser()` now builds an authenticated
  client with `createClient()` from `src/lib/supabase/server.ts` and upserts into
  `public.users` with `{ onConflict: "id", ignoreDuplicates: true,
  defaultToNull: false }`, then reads the row back with
  `.select("id, email, name").eq("id", input.id).single()` and returns it as a
  new exported `AppUser` type. `ignoreDuplicates` maps to
  `ON CONFLICT DO NOTHING`, so an existing row is never overwritten;
  `defaultToNull: false` is required or PostgREST sends NULL for the NOT NULL
  `created_at` / `updated_at` instead of applying the column default.
- **Typed the server client.** `src/lib/supabase/server.ts` now passes the
  generated `Database` type as the generic to `createServerClient`, so
  `src/lib/supabase/database.types.ts` is finally imported and table/column names
  are typechecked.
- **Made user-row creation lazy.** Registration no longer calls
  `ensureAppUser()`; `registerAction` returns the email-confirmation message when
  there is no session, because an unauthenticated insert would be rejected by
  `users_insert_own`. The row is created on the first authenticated request by
  `requireUser()`. `requireUser()` now also resolves `name` from
  `claims.user_metadata.name`, falling back to `auth.getUser()` when the token
  does not carry it.
- **Ran a read-only Prisma runtime audit.** Across all authored source there were
  **0** Prisma query calls and **0** importers of `src/lib/db.ts`; the only Prisma
  code left in `src/` was the unused client factory itself. The audit found the
  one real coupling: `tsconfig.json` used `include: ["**/*.ts"]`, so the generated
  Prisma client was being typechecked.
- **Removed Prisma.** Deleted `src/lib/db.ts`, `prisma/schema.prisma`, the root
  `prisma.config.ts`, `prisma/migrations/migration_lock.toml` (leaving the `prisma/`
  directory empty, then removed) and the generated client under `src/generated/`.
  Confirmed before deleting the root `prisma.config.ts` that no
  `prisma/prisma.config.ts` existed and that the file was purely Prisma CLI
  config referencing only `prisma/schema.prisma` and `prisma/migrations`.
- **Uninstalled** `@prisma/client`, `@prisma/adapter-pg`, `prisma`, `pg` and
  `@types/pg` (118 packages removed, 0 vulnerabilities) and **removed** the
  `postinstall` hook plus `db:generate`, `db:validate`, `db:migrate`, `db:deploy`
  and `db:studio`. Remaining scripts: `dev`, `build`, `start`, `lint`,
  `typecheck`.
- **Dropped `DATABASE_URL` from env validation** after confirming its only runtime
  consumer was `src/lib/db.ts`. Only the zod entry and the `getServerEnv()` parse
  line were removed; `getServerEnv()` still validates `GEMINI_API_KEY` and
  `SUPABASE_SERVICE_ROLE_KEY`.
- **Narrowed `tsconfig.json`** to `exclude: ["node_modules", "src/generated"]` so
  no Prisma artifact is part of the TypeScript program, and dropped the matching
  `src/generated/**` ignore from `eslint.config.mjs`.

### Files Changed

Modified: `src/lib/users.ts`, `src/lib/auth/actions.ts`, `src/lib/auth/session.ts`,
`src/lib/supabase/server.ts`, `src/lib/env.ts`, `tsconfig.json`, `eslint.config.mjs`,
`package.json`, `package-lock.json`, `.gitignore`, and these five docs.

Deleted: `src/lib/db.ts`, `prisma.config.ts`, `prisma/schema.prisma`,
`prisma/migrations/migration_lock.toml`, the `prisma/` directory, and
`src/generated/`.

Created: `src/lib/supabase/database.types.ts` (previous entry).

Not touched: `src/proxy.ts`, the applied migration
`supabase/migrations/20260930000000_init_schema_and_rls.sql`, RLS policies, the
Supabase project, the authentication flow, any `.env` file, and the UI.

### Decisions

- **The application row is created lazily rather than at registration.** A
  registration without a confirmed session is unauthenticated, so an insert would
  be rejected by `users_insert_own`. Deferring to `requireUser()` also keeps
  `name`, because it is read back from Auth metadata instead of being
  re-submitted.
- **The upsert response is deliberately ignored.** With
  `ON CONFLICT DO NOTHING` a conflict returns no row, so the row is read back with
  a separate select rather than trusting the write response.
- **`database.types.ts` is imported as a generic, not just kept available.**
  Having the types is not the same as the application using them.
- **Root `prisma.config.ts` was deleted even though the instruction only
  mentioned `prisma/prisma.config.ts`.** It imported `prisma/config` and pointed
  only at the two deleted Prisma paths, so leaving it would have broken
  typecheck after the uninstall. It was verified first.
- The RLS caveat about the owner role reading tables is now narrower: the
  application has no connection string at all and queries as `authenticated`, so
  it cannot bypass RLS.

### Verification

| Command / check | Result |
| --------------- | ------ |
| `npm install` | pass — 118 packages removed, 0 vulnerabilities, 0 Prisma/pg entries in `package-lock.json` |
| `npm run typecheck` | pass |
| `npm run lint` | pass |
| Prisma reference audit (`src/`, `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`) | 0 hits |
| `DATABASE_URL` audit in `src/` | 0 hits |
| Supabase migration integrity (SHA-256 + byte size, before/after) | identical — file not modified |
| `src/lib/db.ts` importer count | 0 |

### Known Issues

- **The register/login flow has still not been exercised against the live
  database.** The code is typechecked and lint-clean only; the first real
  register → confirm → sign in → `/dashboard` run is still the true test, and it
  was not run.
- `user_metadata` is an optional JWT claim. If Supabase does not include it in
  the issued token, every `requireUser()` call falls back to `auth.getUser()`.
  Since `requireUser()` runs twice per `/dashboard` render, that would be two
  extra Auth round trips per page load. Worth confirming against one real token.
- `users.email` is UNIQUE with no foreign key to `auth.users` and no DELETE
  policy, so deleting an Auth account orphans the `public.users` row.
- `getServerEnv()` now has **0 callers** after `db.ts` was deleted, and the
  `dotenv` devDependency is now unused since only `prisma.config.ts` used it.
  Both were left in place as out of scope.
- `FORCE ROW LEVEL SECURITY` is still undecided.
- There is still no `updated_at` trigger, so `updated_at` must be set by
  application code.
- `supabase/config.toml` and a linked project are still absent, so the Supabase
  CLI workflow is not reproducible for a second developer.

### Next Task

Phase 4 — Learning goals: goal CRUD with zod-validated Server Actions over the
Supabase Data API, reusing the same authenticated client and RLS user-scoping
pattern as `src/lib/users.ts`.
