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
Supabase Auth + Supabase Data API + Supabase Storage · Gemini API
(`@google/genai`, server-side only) · Recharts · lucide-react · zod · Vercel.

There is no ORM. All database access goes through the Supabase Data API under
Row Level Security.

## Current state

Phases 1-10 complete (foundation, database schema, authentication,
native Supabase schema + RLS, learning goals, roadmaps, resources, personal
notes, dashboard analytics, PDF/document upload with server text extraction,
and AI document summarization with Gemini structured output).
All feature pages (/dashboard, /goals, /roadmaps, /resources, /notes, /summaries)
are functional and wired to Supabase with strict RLS and private Storage bucket security.

The runtime data path is:

```
Next.js App Router -> Supabase Auth -> Supabase Data API -> PostgreSQL + RLS
```

**The database is live.** The Supabase migrations
`supabase/migrations/20260930000000_init_schema_and_rls.sql` and
`supabase/migrations/20261002000000_learning_goals_relationships_and_priority.sql`
have been **applied** to the Supabase project, and the resulting schema was verified
read-only with a catalog query pass. The `public` schema now contains:

- **10 tables** — `users`, `learning_goals`, `roadmaps`, `roadmap_steps`,
  `resources`, `notes`, `summaries`, `learning_activities`, `goal_roadmaps`,
  `step_resources`
- **4 enums** — `ActivityType`, `GoalStatus`, `ResourceType`, `RoadmapStepStatus`
- **15 foreign keys** — 10 `ON DELETE CASCADE`, 5 `ON DELETE SET NULL`
- **RLS enabled on all 10 tables**, not forced, with **36 policies**, every one
  `TO authenticated`; `anon` holds no table privileges
- `users.id` and all six `user_id` columns are `uuid`; all timestamps are
  `timestamptz`; `learning_activities` has no `updated_at`
- `learning_goals.priority` is added (default `0`); `roadmaps.goal_id` is removed;
  `notes.step_id` is added; `goal_roadmaps` and `step_resources` join tables exist

All 8 tables held **0 rows** at verification time, so the schema exists but
contains no application data yet.

Supabase TypeScript types have been generated from the live `public` schema into
`src/lib/supabase/database.types.ts` (CLI-generated, not hand-written, UTF-8
without BOM). That file is **imported by `src/lib/supabase/server.ts`**, which
passes it as the `Database` generic, so table and column names are typechecked.

`src/lib/users.ts` writes `public.users` through the Supabase Data API with the
authenticated client. `ensureAppUser()` is called lazily from `requireUser()`,
so the row is created on the first authenticated request rather than during
registration. It upserts with `onConflict: "id"` and `ignoreDuplicates: true`,
which maps to `ON CONFLICT DO NOTHING`: the row is created once and an existing
row is never overwritten. `public.users.id` is the same UUID as `auth.users.id`.

Because every query runs as the signed-in user, RLS is enforced for all
application data access.

The Phase 1A schema migration added `goal_roadmaps` and `step_resources` join
tables, `learning_goals.priority`, `notes.step_id`, and removed `roadmaps.goal_id`.
All 36 RLS policies were updated accordingly.

### Historical note

Until 2026-10-02 the `public` schema was empty and the initial migration existed
only as reviewed, unexecuted SQL. That state is described in
`docs/SESSION_LOG.md` and is kept here only for context.

## Environment variables

Defined in `.env.example`, validated in `src/lib/env.ts`:

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — public anon key
- `SUPABASE_SERVICE_ROLE_KEY` — server-only
- `GEMINI_API_KEY` — server-only

`getServerEnv()` validates the server secrets that are still in use
(`SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`); `getSupabasePublicEnv()` validates
the two public ones. `DATABASE_URL` is no longer required by the application and
was removed from the validation — Prisma was its only consumer.

## Commands

```bash
npm run dev            # dev server
npm run build          # production build
npm run start          # serve production build
npm run lint           # eslint
npm run typecheck      # tsc --noEmit
```

Database changes live in `supabase/migrations/` and are applied with the Supabase
CLI (`supabase db push`) or the Supabase SQL editor. Both the initial migration
and the Phase 1A schema transition migration have already been applied this way.
Supabase types are regenerated with
`npx supabase gen types typescript --project-id <ref> --schema public`, which
requires an authenticated Supabase CLI session (`supabase login`) and performs no
database writes.
