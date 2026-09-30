# Roadmap

Phases are sequential. **Only work on the current phase.** Do not start the next
phase automatically, and do not implement features from later phases early.

| #   | Phase                                | Status      | Commit                     |
| --- | ------------------------------------ | ----------- | -------------------------- |
| 1   | Project foundation                   | **Complete** | `8efa255` |
| 2   | Database and Prisma                  | **Complete** | `f719153` |
| 3   | Authentication                       | **Complete** | `feat: add authentication` |
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

**Phase 2 — Database and Prisma (done)**
`prisma/schema.prisma` with 8 models and 4 enums, `prisma.config.ts` (Prisma 7
config), `src/lib/db.ts` client singleton with the `pg` driver adapter, and a
generated `init` migration. The migration SQL exists but has **not** been applied
to a live Supabase database — no credentials were available. First task of the
next session: run `npm run db:deploy` with a real `DATABASE_URL`.

**Phase 3 — Authentication (done)**
Supabase Auth with `@supabase/ssr`: server and browser clients, register, login,
logout, session refresh in `src/proxy.ts`, `requireUser()` on protected pages,
and the `public.User` record keyed by the Supabase Auth id. Pages: `/login`,
`/register`, `/dashboard` (protected placeholder). Not verified against a live
Supabase project, because no credentials were available.

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
