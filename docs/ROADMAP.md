# Roadmap

Phases are sequential. **Only work on the current phase.** Do not start the next
phase automatically, and do not implement features from later phases early.

| #   | Phase                                | Status      | Commit                     |
| --- | ------------------------------------ | ----------- | -------------------------- |
| 1   | Project foundation                   | **Complete** | `8efa255` |
| 2   | Database schema                       | **Complete** | `f719153` |
| 3   | Authentication                       | **Complete** | `feat: add authentication` |
| 3.5 | Supabase native schema + RLS         | **Complete** | `chore: native supabase schema and rls` |
| 4   | Learning goals                       | Not started | `feat: add learning goals` |
| 5   | Learning roadmaps                    | Not started | `feat: add learning roadmap` |
| 6   | Learning resources                   | Not started | `feat: add resource management` |
| 7   | Personal notes                       | Not started | `feat: add notes` |
| 8   | Dashboard and analytics              | Not started | `feat: add dashboard` |
| 9   | PDF upload and text extraction       | Not started | `feat: add pdf upload` |
| 10  | AI document summarization            | Not started | `feat: add AI summarization` |
| 11  | AI intelligent search                | Not started | `feat: add AI search` |
| 12  | Personalized recommendations         | Not started | `feat: add recommendations` |
| 13  | Testing, security, optimization, deploy | Not started | `chore: prepare deployment` |

## Phase details

**Phase 1 — Project foundation (done)**
Next.js App Router + TypeScript strict + Tailwind v4 + shadcn/ui initialised,
core UI primitives installed, env template and validation added, docs written.

**Phase 2 — Database schema (done, superseded)**
Originally delivered as `prisma/schema.prisma` with 8 models and 4 enums,
`prisma.config.ts`, a `src/lib/db.ts` client singleton and a generated `init`
migration. All of that Prisma infrastructure was later **deleted** in Phase 3.5
and replaced by `supabase/migrations/`, which is the authoritative schema.

**Phase 3 — Authentication (done)**
Supabase Auth with `@supabase/ssr`: server and browser clients, register, login,
logout, session refresh in `src/proxy.ts`, `requireUser()` on protected pages,
and the `public.users` record keyed by the Supabase Auth id. Pages: `/login`,
`/register`, `/dashboard` (protected placeholder).

**Phase 3.5 — Supabase native schema + RLS (done)**
The database moved from Prisma-owned schema to Supabase native + RLS as the
security boundary, and Prisma was removed. `uuid` user ids taken from
`auth.users.id`, snake_case tables/columns, `timestamptz`, and one authoritative
init migration in `supabase/migrations/` with RLS enabled on all 8 tables.

The initial migration was **applied** to the Supabase project and the result was
verified read-only (Q1-Q18, all PASS): 8 tables, 4 enums, 11 foreign keys
(7 `CASCADE`, 4 `SET NULL`), and RLS enabled and not forced on all 8 tables with
30 policies, every one `TO authenticated`. The database held **0 rows** in all 8
tables at verification.

Completed in this phase: applied the migration; verified the schema; generated
Supabase database types into `src/lib/supabase/database.types.ts`; moved
`src/lib/users.ts` to the Supabase Data API using the authenticated client; and
removed Prisma (client, schema, config, generated output, packages, `db:*`
scripts, and the `DATABASE_URL` env requirement).

The application now runs entirely on `Supabase Auth -> Supabase Data API ->
PostgreSQL + RLS`, with no ORM and no direct database connection. The earlier
failure mode — Prisma expecting `User` / `userId` / `createdAt` identifiers
against a snake_case schema — no longer exists.

**Phase 4 — Learning goals**
CRUD for goals, status, target date, list/detail pages, server actions + zod.

**Phase 5 — Learning roadmaps**
Roadmap CRUD attached to a goal, ordered steps, step status, progress percentage.

**Phase 6 — Learning resources**
Resource CRUD with type (PDF/video/website/book/course), link to a goal.

**Phase 7 — Personal notes**
Note CRUD, tags, optional link to a resource.

**Phase 8 — Dashboard**
Progress overview, goal/roadmap status, activity feed, Recharts charts from
`LearningActivity`.

**Phase 9 — PDF upload and text extraction**
Supabase Storage bucket, upload Server Action, server-side text extraction, store
path + extracted text for later AI use.

**Phase 10 — AI document summarization**
Gemini structured output (zod-validated), summary stored in `Summary`.

**Phase 11 — AI intelligent search**
Semantic/natural-language search over goals, resources, notes, summaries.

**Phase 12 — Personalized recommendations**
Gemini-based recommendations from the user's goals, resources, notes, and activity.

**Phase 13 — Testing, security, optimization, deployment**
Test setup, security review, performance pass, Vercel deployment.
