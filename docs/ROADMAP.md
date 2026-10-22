# Roadmap

Phases are sequential. **Only work on the current phase.** Do not start the next
phase automatically, and do not implement features from later phases early.

| #   | Phase                                | Status      | Commit                     |
| --- | ------------------------------------ | ----------- | -------------------------- |
| 1   | Project foundation                   | **Complete** | `8efa255` |
| 2   | Database schema                       | **Complete** | `f719153` |
| 3   | Authentication                       | **Complete** | `feat: add authentication` |
| 3.5 | Supabase native schema + RLS         | **Complete** | `chore: native supabase schema and rls` |
| 4   | Learning goals                       | **Complete** | `feat: add learning goals` |
| 5   | Learning roadmaps                    | **Complete** | `feat: add learning roadmap` |
| 6   | Learning resources                   | **Complete** | `feat: add resource management` |
| 7   | Personal notes                       | **Complete** | `feat: add notes` |
| 8   | Dashboard and analytics              | **Complete** | `feat: add dashboard and analytics` |
| 9   | PDF upload and text extraction       | **Complete** | `feat: add pdf upload and text extraction` |
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

**Phase 1A — Learning Goals schema transition (done)**
Applied `supabase/migrations/20261002000000_learning_goals_relationships_and_priority.sql`
to the live database. Added `goal_roadmaps` and `step_resources` join tables,
`learning_goals.priority`, `notes.step_id`, and removed `roadmaps.goal_id`.
Regenerated `src/lib/supabase/database.types.ts` from the live schema. The
database now holds 10 tables, 15 foreign keys, and 36 RLS policies.

The application now runs entirely on `Supabase Auth -> Supabase Data API ->
PostgreSQL + RLS`, with no ORM and no direct database connection. The earlier
failure mode — Prisma expecting `User` / `userId` / `createdAt` identifiers
against a snake_case schema — no longer exists.

**Phase 4 — Learning goals**
CRUD for goals, status, target date, list/detail pages, server actions + zod.

**Phase 5 — Learning roadmaps**
Roadmap CRUD attached to a goal, ordered steps, step status, progress percentage.

**Phase 6 — Learning resources (done)**
Resource CRUD with type (PDF/video/website/book/course), link to a goal, roadmap step associations, and category classification.

**Phase 7 — Personal notes (done)**
Note CRUD, markdown content with live preview, tags, optional link to a learning resource, search and two-pane split editor.

**Phase 8 — Dashboard (done)**
Progress overview, goal/roadmap status, recent activity feed, and Recharts learning progress visualizations.

**Phase 9 — PDF upload and text extraction (done)**
Private Supabase Storage bucket (`documents`), upload Server Action with Zod file validation, server-side text extraction (`pdf-parse` v2 and plain text), and `extracted_text` column on resources.

**Phase 10 — AI document summarization**
Gemini structured output (zod-validated), summary stored in `Summary`.

**Phase 11 — AI intelligent search**
Semantic/natural-language search over goals, resources, notes, summaries.

**Phase 12 — Personalized recommendations**
Gemini-based recommendations from the user's goals, resources, notes, and activity.

**Phase 13 — Testing, security, optimization, deployment**
Test setup, security review, performance pass, Vercel deployment.
