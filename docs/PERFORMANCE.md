# Performance Strategy

Status: **living document** · Applies from the next feature onwards
Basis: the repository at commit `670e5e5` (`feat: migrate ChiroMemo data layer to Supabase`)

This document is the performance guideline for every ChiroMemo feature: Learning
Goals, Roadmaps, Resources, Notes, Activities, AI features and the dashboard.

It is written against the code as it exists today. Every claim is marked:

| Marker | Meaning |
| ------ | ------- |
| **[implemented]** | Present in the code right now, verifiable by reading it |
| **[recommended]** | A rule for future work. Not yet in the code |
| **[needs measurement]** | Unknown; cannot be answered without measuring |
| **[future]** | Deliberately deferred; only with evidence |

---

## 1. Performance Goals

ChiroMemo is a single-user, personal learning application. One student signs in
and works alone with their own goals, roadmaps, resources, notes and activity
history. There are no teams, no sharing, and no admin views.

The performance goals follow from that shape:

1. **Fast first page.** A signed-in student should see a useful page quickly,
   not a spinner on a blank shell.
2. **Fast data fetching.** Database work should be proportional to the data the
   screen actually shows.
3. **Responsive interaction.** Every action a user takes — create a goal, tick a
   step, filter notes — must give immediate feedback.
4. **Good on slow networks.** Students may be on campus Wi-Fi, a phone hotspot,
   or a congested connection. The app must degrade gracefully, not appear broken.
5. **Predictable loading states.** The same kind of wait should always look the
   same. No layout jumping between skeletons and content.
6. **Scalable data access.** Design for a student with hundreds of activities and
   thousands of notes, not just the demo data.
7. **Maintainability.** Performance work must not make the code fragile. A simple
   query that a new developer can understand beats a clever one they cannot.

### On numeric targets

There is **no baseline measurement** for this project. The application currently
has no feature pages, and the database held **0 rows in all 8 tables** at the last
verification. There is nothing yet to measure against.

Therefore this document sets **no numeric performance budgets** (no "TTFB under
200 ms", no "LCP under 2.5 s"). Inventing thresholds without a baseline produces
targets that are either trivially met or impossible to hit, and both are worse
than no target.

> **Baseline measurement must be established before defining hard performance
> budgets.** See section 12 for how to collect it, and section 17 for what is
> currently unknown.

---

## 2. Current Architecture and Performance Characteristics

### The real request path

```
Browser
  ↓  HTTPS
Next.js 16.3.7 (App Router, Vercel)
  │
  ├─ src/proxy.ts ................. Supabase SSR session refresh on every request
  │                                 + getClaims() + protected-route redirect
  │
  ├─ Server Component .............. requireUser()
  │                                 → createClient() → auth.getClaims()
  │                                 → ensureAppUser() → upsert + select
  │
  ├─ Server Action / Route Handler . same authenticated client
  │
  ↓  PostgREST (HTTPS)
Supabase Data API (supabase-js)
  ↓
PostgreSQL
  ↓
Row Level Security — auth.uid() scopes every row
```

### What each layer costs **[implemented]**

**`src/proxy.ts` runs on almost every request.** Its matcher is
`"/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)"`,
so static assets and API routes are deliberately excluded. It then calls
`supabase.auth.getClaims()`, which verifies the access-token signature, and sets
`cache-control: private, no-store` on every signed-in response. That header is a
**security requirement**, not a performance setting: without it a CDN could store
and replay one student's page to another.

**`src/lib/supabase/server.ts` creates a new client per request.** This is
required, because the session lives in request cookies and `@supabase/ssr` needs
to write refreshed tokens back through `setAll`. In a Server Component, cookie
writes throw, so the `catch` block swallows it and relies on the Proxy having
already refreshed the session. This is correct, and it means **there is no
cross-request client or connection reuse in the application layer** — Supabase's
HTTP layer handles that, not our code.

**The client is typed.** `createServerClient<Database>(...)` uses the generated
`src/lib/supabase/database.types.ts`. This costs nothing at runtime; its value is
that table and column names are compile-time checked.

**RLS runs on every query.** Postgres evaluates the applicable policies per
statement. Every table is owned by the application user via `user_id` or `id`,
and the 10 indexes in the initial migration all lead with `user_id` or a foreign
key, which is exactly the access pattern RLS and the application produce.

### The single most important current finding **[implemented]**

`requireUser()` is called **twice per `/dashboard` render**:

- `src/app/(app)/layout.tsx:11`
- `src/app/(app)/dashboard/page.tsx:16`

Each call performs, in sequence:

1. `createClient()`
2. `auth.getClaims()` — one network round trip to Supabase Auth
3. `ensureAppUser()` → **upsert** (`ON CONFLICT DO NOTHING`) — one round trip
4. `ensureAppUser()` → **separate select** to read the row back — one round trip
5. `auth.getUser()` — *only* if the JWT has no `user_metadata.name`, one more
   round trip

So a single `/dashboard` navigation costs roughly **4 PostgREST round trips of
which 2 are exact duplicates**, plus 2 `getClaims()` calls, before any real
feature data is fetched. The `select` is only required because
`ON CONFLICT DO NOTHING` returns no row on conflict, which is noted in
`src/lib/users.ts:34-35`.

**This is a real, documented inefficiency, not a hypothesis. It is not fixed in
this task.** See section 17, finding F-1.

### Loading and streaming reality **[implemented]**

There is currently:

- **no** `loading.tsx`, **no** `error.tsx`, **no** `not-found.tsx`, **no** `template.tsx`
- **no** `Suspense` boundary anywhere (0 usages)
- **no** `loading.tsx`-driven streaming, so every protected page blocks its whole
  render on `requireUser()`

There is, however, a `Skeleton` primitive at `src/components/ui/skeleton.tsx`
that is currently **used zero times**. The building block already exists.

### Client JavaScript reality **[implemented]**

Only **12 files** carry `"use client"`, and the split is healthy:

- 10 are shadcn/ui primitives (`dialog`, `dropdown-menu`, `label`, `progress`,
  `select`, `separator`, `table`, `tabs`, `tooltip`)
- 2 are the auth forms
- 1 is `src/lib/supabase/client.ts`, which is **unused** — no module imports it

Every `page.tsx` and `layout.tsx` is a Server Component. This is the pattern to
keep.

`recharts` is installed but has **0 usages**. It is a large client-side library,
so importing it into a dashboard will materially change the client bundle.
Budget for that in Phase 8 rather than discovering it.

### Not yet implemented **[recommended]**

- No caching layer of any kind: 0 usages of `next/cache`, `unstable_cache`,
  `cacheTag`, or `revalidate`.
- No pagination, `limit`, `range`, or `order` anywhere in `src/` (0 usages).
  The only query modifier in the codebase is `.single()` in `src/lib/users.ts:63`.
- `next.config.ts` is empty — no `images` configuration yet.

### Needs measurement **[needs measurement]**

Every number. See section 17.

---

## 3. Database Query Performance

All data access goes through the authenticated Supabase Data API, which means
every query is a PostgREST HTTP request. **Request count matters as much as query
speed**, because each one is a network round trip plus a Postgres query.

### Select only what you render

**[recommended]** Name the columns explicitly. Supabase-js sends a `select`
string that becomes the SQL projection.

```ts
// good — three columns the card actually shows
const { data } = await supabase
  .from("learning_goals")
  .select("id, title, status, target_date")
  .order("created_at", { ascending: false })
  .limit(20);
```

Use `select("*")` only when the UI genuinely renders every column, and be aware
that it also pulls back every column of **related** rows you embed. Embedded
relations are the easiest way to accidentally ship a large payload.

Note that the generated types cannot express `uuid` vs `text`, nor `UNIQUE` and
`CHECK` constraints, so the type system will not catch a projection that violates
a database constraint. That is a data-correctness concern, not performance, but
it belongs in the same habit: be explicit.

### Filter in the database, never in the browser **[recommended]**

Fetching rows and filtering with JavaScript transfers data the user will never
see and scales linearly with the wrong thing.

```ts
// wrong — every note crosses the network, then 20 render
const { data } = await supabase.from("notes").select("id, title, content");

// right — the database returns only what matches
const { data } = await supabase
  .from("notes")
  .select("id, title, updated_at")
  .eq("resource_id", resourceId)
  .order("updated_at", { ascending: false })
  .limit(20);
```

RLS already restricts rows to the current user. Your `.eq()` / `.filter()`
narrows within that set — it is not a substitute for RLS and must never be
written as if it were.

### Always bound the result set **[recommended]**

A list query should have a sensible upper bound rather than returning an unbounded
result set. A student's row count is unknown and grows without bound, so apply
`limit()` to any list that should not return every row, and use `range()` once the
view needs to page through results. For a count, prefer `count: "estimated"` over
`count: "exact"` unless the exact number is displayed — exact counts force Postgres
to scan the whole match.

### Order deliberately **[recommended]**

`order()` without an index on the sort column forces a sort of the whole result
set. Every list needs a deterministic order for pagination to work at all, so
pair the `order()` with an index (see below). Sort keys that already have an
index are the cheapest: `learning_activities (user_id, occurred_at)` is already
designed for a newest-first activity feed.

### Avoid N+1 queries **[recommended]**

This is the most likely way a ChiroMemo feature will become slow, because the
data model is a tree: `learning_goals → roadmaps → roadmap_steps`.

Never do this in a loop:

```ts
// N+1 — one request per goal
for (const goal of goals) {
  const { data } = await supabase.from("roadmaps").select("*").eq("goal_id", goal.id);
}
```

Fetch the children in one query and group them in memory:

```ts
// one request, grouped client-side
const goalIds = goals.map((g) => g.id);
const { data: roadmaps } = await supabase
  .from("roadmaps")
  .select("id, goal_id, title, progress_percent")
  .in("goal_id", goalIds);

const byGoal = new Map<string, typeof roadmaps>();
for (const r of roadmaps ?? []) {
  const list = byGoal.get(r.goal_id) ?? [];
  list.push(r);
  byGoal.set(r.goal_id, list);
}
```

Supabase-js also supports embedded resources (`select("id, title, roadmaps(id, title)")`),
which resolve in a **single** request. Use them for simple parent → child reads,
and fall back to the two-query + group pattern when you need filtering, ordering
or limits that embedding cannot express.

Related: `roadmap_steps` has **no `user_id`** — ownership is inherited from
`roadmaps` through an `EXISTS` subquery in its RLS policies. Queries that join or
embed `roadmap_steps` must go through `roadmaps`, and that indirection is a real
factor to measure when roadmap features land.

### Avoid redundant repeated queries **[recommended]**

The database does not know you already fetched a row. Each `ensureAppUser()` call
issues its own requests, and calling it from both a layout and a page duplicates
them (finding F-1). The same principle applies to every feature: **fetch once per
request, not once per component.** A shared helper or a single page-level fetch is
better than three components each fetching the same slice.

### Do not repeat a write on every read **[recommended]**

`ensureAppUser()` performs an upsert on every protected render. It is
`ON CONFLICT DO NOTHING`, so it is safe and writes nothing on conflict, but it is
still a round trip on every page load. When optimising, keep it idempotent and
never change it to a real upsert that overwrites user-edited data.

### Indexes: never add them blindly **[recommended]**

Adding an index is not free — every index is written on every `INSERT` and
`UPDATE`, occupies storage, and slows writes. The rule for ChiroMemo:

> **Every new index must be justified by a specific, written-down query pattern
> that needs it.**

Before adding one, write down: the exact query, why it is slow, and the plan
evidence (`EXPLAIN`). If the table holds tens of rows, no index is needed.

The initial migration already created 10 indexes, all leading with `user_id` or a
foreign key, plus the implicit indexes behind `users_email_key` and
`UNIQUE (roadmap_id, "order")`. That is a deliberate baseline for ownership-scoped
access. **Indexes deliberately deferred** (recorded in `docs/DATABASE.md`):

- GIN index on `notes.tags` — needed for AI search in Phase 11
- automatic `updated_at` trigger

A missing index is far cheaper to add later than a useless one is to maintain now.

---

## 4. RLS and Performance

RLS is the security boundary of ChiroMemo. It is not a performance feature, and
it is not something to be traded away.

### The rules

1. **Never bypass RLS for performance.** No service-role client in application
   code, no `SECURITY DEFINER` helper functions that skip policy checks, no
   `DISABLE ROW LEVEL SECURITY`, no elevated-privilege workaround for a slow
   query. The Supabase service-role key is for Supabase's own internal use; the
   authentication flow does not use it and new application code must not.
2. **Every query goes through the authenticated client** from
   `src/lib/supabase/server.ts`. It builds the client from the user's session, so
   each request is made as `authenticated` and policies apply automatically.
3. **Pass ids from a verified auth context only.** `src/lib/users.ts` documents
   this: a `userId` must come from `auth.getClaims()`, never from form or URL
   input. An id from user input is both a security bug and a performance bug,
   because it forces a filter the database must evaluate for no reason.
4. **A slow query is fixed in the query or the index**, not in the security model.
   If a policy makes something slow, add an index that supports the policy's
   predicate. Never weaken the predicate.

### Indexing the ownership columns

**[implemented]** Every `user_id` column is a `uuid` and every index in the
migration leads with it. Policies filter on `auth.uid()` against those columns, so
the ownership filter is already index-backed.

When adding a feature, check that its ownership predicate is covered:

| Table | Existing index | Covers |
| ----- | -------------- | ------ |
| `learning_goals` | `(user_id)` | all goals for a user |
| `roadmaps` | `(user_id)`, `(goal_id)` | user's roadmaps; roadmaps per goal |
| `resources` | `(user_id, type)`, `(goal_id)` | user's resources **filtered by type** |
| `notes` | `(user_id)`, `(resource_id)` | user's notes; notes per resource |
| `summaries` | `(user_id)`, `(resource_id)` | user's summaries |
| `learning_activities` | `(user_id, occurred_at)` | time-ordered activity feed |
| `users` | PK on `id` | own row lookup |

Note `resources (user_id, type)` is composite: it serves "all my resources" and
"my resources of type X", which is why there is deliberately no standalone
`user_id` index on that table.

### Policy complexity that may need measurement **[needs measurement]**

Four `INSERT`/`UPDATE` policies carry an extra `EXISTS` subquery that verifies a
referenced row belongs to the same user (`roadmaps.goal_id`,
`resources.goal_id`, `notes.resource_id`, `summaries.resource_id`), and all four
`roadmap_steps` policies resolve ownership through `roadmaps`. These are correct
and must stay. They also add work per statement.

Whether this is measurable has **not** been determined — the database is empty and
no feature exercises these paths yet. Measure the query plans when the relevant
features exist; add supporting indexes only if a plan shows a sequential scan on
realistic data.

### Do not change the architecture for premature optimization **[recommended]**

The single-user, RLS-scoped, Supabase-Data-API design is not the bottleneck. It is
a simple, well-understood architecture with no connection pooling to tune and no
ORM in the request path. There is no reason to replace it before a measurement
says there is.

---

## 5. Next.js Rendering Strategy

### The default **[recommended]**

> **Use Server Components by default. Add `"use client"` only when a component
> genuinely needs interactivity in the browser.**

A `"use client"` boundary pulls that component *and its imports* into the client
bundle. This is the main lever ChiroMemo has on client-side JavaScript, and it is
currently being used well: every page and layout is a Server Component.

### What genuinely requires a Client Component

- Event handlers: `onClick`, `onChange`, `onSubmit`
- Browser APIs: `localStorage`, `window`, `IntersectionObserver`
- React hooks that model client state: `useState`, `useReducer`,
  `useFormStatus`, `useActionState`
- Context providers that wrap interactivity, such as `TooltipProvider`

**[implemented]** Both auth forms are Client Components for exactly this reason:
they use `useActionState` and `useFormStatus`.

### Keeping the boundary small **[recommended]**

Push `"use client"` as **deep** as possible. Extract the interactive leaf and
leave the surrounding layout as a Server Component. A whole page becoming a Client
Component because one button needs a handler is the most common way a Next.js app
quietly doubles its JavaScript.

Pass Server → Client data through props, and keep those props minimal. Do not pass
entire database rows into a Client Component when the component renders three
fields.

### Streaming and progressive rendering **[recommended]**

Right now, nothing streams. Every protected page blocks its entire render on
`requireUser()`, and a slow network or a cold Postgres makes that visible as a
blank screen.

The intended pattern for feature pages:

1. Render the page shell and static structure immediately.
2. Wrap the data-dependent region in `<Suspense>` with a skeleton fallback.
3. Await slow, independent data in parallel, not in sequence.
4. Let the shell paint while data is still in flight.

Choose the mechanism that fits the situation — `loading.tsx` **or**
`<Suspense>`, according to the rendering and data-loading needs. Prefer
`loading.tsx` for whole-segment loading: it is the least code and applies
automatically to navigations. Use `<Suspense>` for finer-grained regions where
part of the page can be useful before another part arrives. Choose the mechanism
or combination that fits the rendering and data-loading needs.

The core principle: **a page should not wait for data it does not need in order to
show its first view.** If the header, navigation and page title need no data, they
should not be downstream of a slow query. With either mechanism, independent parts
render independently.

```tsx
// intended shape for a future goals page — shell renders immediately
export default function GoalsPage() {
  return (
    <>
      <PageHeader title="Learning goals" />      {/* no data needed */}
      <Suspense fallback={<GoalListSkeleton />}>
        <GoalList />                              {/* awaits the query */}
      </Suspense>
    </>
  );
}
```

### Parallel data fetching **[recommended]**

Sequential `await`s that do not depend on each other add their latencies together.
Use `Promise.all` when queries are **independent and can safely execute in
parallel**:

```ts
// wrong — two round trips in series
const goals = await fetchGoals();
const activities = await fetchActivities();

// right — one round-trip duration
const [goals, activities] = await Promise.all([
  fetchGoals(),
  fetchActivities(),
]);
```

Keep queries sequential when one genuinely depends on another's result —
`Promise.all` is for independent work only. `ensureAppUser()` before fetching
goals is exactly that dependent case, because the goals query needs the verified
user.

---

## 6. Loading and Perceived Performance

Speed is what the user waits for; perceived performance is what they *believe* they
waited for. For a student on a slow connection, the second matters as much as the
first.

### The core rule

> **Never show a blank screen while a request is in flight.**

Something must always be on screen: a skeleton matching the final layout, a
spinner with a label, or partial content.

### Skeletons, not spinners, for structure **[recommended]**

A spinner says "wait". A skeleton says "here is what is coming", and because it
resembles the final layout it also prevents layout shift when content arrives.

**[implemented]** `src/components/ui/skeleton.tsx` already provides the primitive
and currently has **0 usages** — it was installed for exactly this and has not been
needed yet. The first feature page should use it.

Skeleton rules:

- Match the shape of the content that will replace it (rows, cards, text lines).
- Show the skeleton for content that requires a network request.
- Do **not** skeleton static content — headings and instructions can render
  instantly and make the page feel faster even while data loads.

### Loading states **[recommended]**

| Mechanism | Use for |
| --------- | ------- |
| `loading.tsx` | Whole route segment; first tool to reach for |
| `<Suspense>` + skeleton | One region of a page that is slower than its neighbours |
| Button `pending` state | Form submission |
| Inline placeholder | A panel refreshed after an action |

**[implemented]** Both auth forms already disable their submit button and change
its label while pending, via `useFormStatus` in `register-form.tsx:12-20` and the
equivalent in `login-form.tsx`. This is the correct pattern — keep it for every
form.

**[implemented]** There is currently **no** `loading.tsx` and **no** `Suspense`
anywhere. Every feature page must add them.

### Optimistic UI — only where it is safe and genuinely helps **[recommended]**

An optimistic update paints the expected result before the server confirms it.

Use it for:
- Toggling a step status, where reverting on failure is trivial and the user sees
  their own action reflected instantly
- Reordering, if a phase ever needs it

Do **not** use it for:
- Anything that involves other users or shared state — there is none in ChiroMemo
  today, which is a genuine advantage of the single-user design
- Creates that generate server-side content (an AI summary, a recommendation),
  because there is nothing to predict
- Anything where a silent revert would confuse rather than clarify

Always show a pending state alongside it, and always define the revert path before
shipping the optimistic version. React's `useOptimistic` is available and
currently unused (0 usages).

### Forms in general **[recommended]**

- Give feedback within the interaction, not after a page reload.
- Disable the submit control while pending to prevent double submission.
- Preserve user input on a server error — a student who typed a long note should
  never lose it to a failed request.
- Return structured errors from the Server Action (`useActionState` already carries
  `error`, `message` and `fieldErrors`) instead of throwing.

---

## 7. Network Performance

Optimise for the network the student actually has, which may be slow and may be
metered.

### Minimise payload **[recommended]**

- Select only the columns the UI renders.
- Do not embed relations you do not display.
- Do not send a `content` or markdown body to render a list row. Fetch the body on
  the detail page. `notes.content` and `summaries.content` are the two large text
  columns in the schema.
- `notes.tags` and `summaries.key_points` are `text[]` — cheap in most views, but
  not free, and unnecessary on lists that show neither.
- Watch `learning_activities.metadata`, which is `jsonb` and can grow. Do not
  select it for a feed that does not render it.

### Minimise request count **[recommended]**

Each PostgREST call is a full HTTP round trip. Four small queries are usually worse
than one well-shaped query. Prefer:

- Embedded relations for simple parent → child reads
- `Promise.all` for independent queries
- A single `in(...)` query plus in-memory grouping, instead of a query per parent

### Avoid duplicate requests **[recommended]**

Fetch once per request, not once per component. The current double
`requireUser()` (finding F-1) is the concrete example: the same single-row query
is issued twice per page view because both the layout and the page call it.

### Pagination **[recommended]**

Give every list query a sensible upper bound. Introduce pagination when the
expected data volume or the user experience requires it — see section 9.

### Lazy loading **[recommended]**

Load below-the-fold or rarely-needed data on demand. Route-level code splitting is
automatic in the App Router; keep heavy optional components (a chart library, a PDF
viewer, an editor) out of the initial path.

### Images and assets **[recommended]**

`next.config.ts` is currently empty, so no `images` configuration exists. When
uploads and PDF previews arrive (Phase 9):

- Use `next/image` so images get responsive sizing and modern formats.
- Never render a full-resolution user upload directly.
- Size thumbnails in the upload path rather than downloading a full file to resize
  it in the browser.
- Keep `lucide-react` icon usage tree-shakeable; import icons individually
  (as the existing code already does) rather than a barrel that defeats shaking.

### Client-side JavaScript **[recommended]**

Every `"use client"` boundary adds JavaScript the browser must download, parse and
execute before the page feels interactive. Keep boundaries minimal (section 5), and
treat adding a large dependency as a performance decision requiring justification:

- `recharts` is installed and unused. Phase 8 charts will pull it into the client
  bundle; consider rendering charts in a lazily loaded child component.
- Do not add a library to solve a problem that ~20 lines of project code solves.

---

## 8. Caching Strategy

**[implemented]** There is no caching layer in ChiroMemo: 0 usages of
`next/cache`, `unstable_cache`, `cacheTag`, or `revalidate`. Additionally,
`src/proxy.ts:58` sets `cache-control: private, no-store` on every signed-in
response, so **no CDN or shared cache may store a signed-in page**. This is
intentional and is a security control.

### Classify data before deciding to cache

| Data class | Examples in ChiroMemo | Caching stance |
| ---------- | ---------------------- | -------------- |
| Static / build-time | shadcn/ui primitives, Tailwind CSS, fonts | Cache freely; already handled by Next.js |
| Rarely changes, not user-specific | enum value lists, `ResourceType` options, status labels | Safe to cache, including client-side |
| User-specific, read-mostly | a student's goals list, their resources | Cache only with per-user scoping, and only after a measurement shows a need |
| Frequently changes | roadmap progress, step statuses, activity feed | Read fresh; stale data here is confusing |
| Real-time / sensitive | session state, anything an action just wrote | Never cache; never show a cached value after a write |

### Caching user data is a correctness risk **[recommended]**

ChiroMemo is multi-user even though it is single-user *per account*: every student
has their own rows, separated by RLS. A cache that is not scoped to the user can
serve one student's goals to another. That is a data-leak bug, not a performance
bug.

Therefore:

- Any server-side cache keyed on user data **must** include the user id in the key,
  and that must be the id from the verified auth context, never from input.
- Never share a cache entry across users, even for "reference" data that was
  fetched with a user session.
- After any write, invalidate or bypass the cache. Do not rely on expiry.
- `proxy.ts` already sends `no-store` for signed-in responses; treat that as the
  default and require evidence before relaxing it.

### Keep it simple **[recommended]**

React's `cache()` and Next.js's fetch caching are sufficient if caching is ever
justified. Do not design a multi-layer cache architecture for an application with
no measured bottleneck. **If there is no measurement showing a repeated read is
costly, do not cache.**

---

## 9. Data Volume and Scalability

Design every feature for the student who has been using ChiroMemo for two years,
not for the demo account.

### The growth curve to design for

| Stage | `learning_goals` | `notes` | `learning_activities` |
| ----- | ---------------- | ------- | --------------------- |
| New user | ~5 | ~10 | ~50 |
| Active semester | ~20 | ~100 | ~1,000 |
| Long-term | ~100 | ~1,000 | ~10,000 |
| Heavy use | ~1,000 | ~10,000 | ~100,000 |

The feature that breaks first is almost always the **activity feed and analytics**,
because `learning_activities` is append-only and grows without bound. It is also
the one that has no `updated_at` and a GIN-less `tags` index pending on notes.

### Principles **[recommended]**

1. **Bound list queries appropriately.** Give each one a sensible upper bound
   rather than fetching everything. An unbounded `select` on
   `learning_activities` is a production incident waiting to happen.
2. **Introduce pagination when it is needed.** Add it when the expected volume or
   the user experience requires paging through results, rather than assuming a list
   will always be small. `.range(from, to)` gives offset pagination, and a bounded
   `limit()` is often sufficient before that.
3. **Filter in the database.** Status, type, date range, goal — all belong in
   `.eq()` / `.filter()` / `.gte()`, never in post-fetch JavaScript.
4. **Sort by an indexed column.** The activity feed wants newest-first, and
   `learning_activities (user_id, occurred_at)` is already built for exactly that.
   An unindexed sort forces a full sort of the matched set.
5. **Aggregate in the database for analytics.** Dashboard counts, goal completion
   rates and streak calculations belong in the query, not in JavaScript over
   thousands of rows. `count: "estimated"` unless the exact number is displayed.
6. **Never ship a large dataset to the browser** when the UI needs a window of it.
   A 10,000-row JSON array is both a bandwidth and a memory problem.
7. **Search needs its own design.** Full-text search over notes, resources and
   summaries is Phase 11 and is deliberately deferred. It will need a real search
   decision and the `notes.tags` GIN index. Do not approximate it by fetching rows
   and filtering in JavaScript.

### Cursor pagination — not yet **[future]**

Offset pagination (`.range()`) is right for ChiroMemo's scale and simpler to get
correct. Keyset/cursor pagination becomes worthwhile when a single user has tens
of thousands of rows **and** deep offset paging becomes slow or rows shift between
pages.

**Do not build cursor pagination now.** Revisit when the activity feed has real
data volume and measurement shows offset paging degrading. Write list queries so
that switching is possible later: a stable, unique, indexed sort key
(`occurred_at` plus `id` as a tiebreaker).

### RLS interaction **[recommended]**

Because RLS filters by `auth.uid()` on every statement, a query over a large table
is scoped before your own filters apply. That is efficient, but it means
application-level filters must still be expressed as SQL predicates to benefit
from indexes. Fetching broadly and filtering in JS is doubly wrong here: RLS does
not help, because the rows still cross the network.

---

## 10. Form and Interaction Performance

ChiroMemo's core interactions are simple mutations: create, update, delete,
complete/toggle, plus search, filter and navigate. Each maps to a Server Action.

### The pattern **[recommended]**

| Interaction | Pattern |
| ----------- | ------- |
| Create | Server Action + zod validation → `insert` → redirect or revalidate → pending button state |
| Update | Server Action + zod validation → `update` with `.eq("id", …)` → revalidate |
| Delete | Server Action + confirmation → `delete` → revalidate |
| Toggle / complete | Server Action → `update` the single field → optimistic UI where safe |
| Search | Debounced input; query on submit or on pause, not per keystroke |
| Filter | Update URL search params; fetch server-side |
| Navigate | `next/link`; let the App Router handle prefetch and transitions |

### Rules **[recommended]**

1. **Immediate feedback.** Every action gives feedback in the same interaction —
   pending state, disabled control, or optimistic paint. Never leave the user
   guessing whether the click registered.
2. **Prevent duplicate submission.** Disable the control while pending
   **[implemented]** in both auth forms via `useFormStatus`; keep this for every
   form. Without it, a slow network makes double submits likely, and ChiroMemo has
   no idempotency keys on its writes.
3. **Validate with zod before writing.** Never let an unvalidated payload reach the
   database. Already the established pattern in `src/lib/validations/auth.ts`.
4. **Scope every write.** `.eq("id", …)` plus `.eq("user_id", …)` where the table
   has one. RLS is the real boundary; this keeps the query honest and index-backed.
5. **Revalidate after a write.** `revalidatePath()` after create/update/delete so
   the next read is correct. Currently 0 usages — each feature introduces its own.
6. **Error recovery.** Return a structured error from the action and keep the
   user's input. Silent failure is worse than a visible error.
7. **Search and filter belong in the URL** for goals, roadmaps, resources and
   notes, so a filtered view is linkable, shareable with oneself, and survives a
   refresh — and so the query can be filtered server-side.
8. **Debounce search input.** One request per keystroke is a request storm on a
   slow connection.

---

## 11. Error, Timeout, and Failure Experience

Performance is not only speed; it is also how the app behaves when things are slow
or broken. A slow request with clear feedback feels better than a fast request
that fails silently.

### Failure modes to handle **[recommended]**

| Situation | Expected behaviour |
| --------- | ------------------ |
| Slow network | Skeleton or pending state appears immediately; no timeout-style blank screen |
| Network failure | Supabase returns an `error`; surface a readable message, offer retry |
| Supabase request error | Check the returned `error` — never discard it. **[implemented]** `ensureAppUser()` throws with the PostgREST message included |
| Query error | Show an error state for that region. Do not render an empty list as if it were genuinely empty |
| Session expired | `requireUser()` redirects to `/login` **[implemented]**; the Proxy also redirects unauthenticated visitors **[implemented]** |
| Unexpected server error | An `error.tsx` boundary catches it and offers a retry. **None exists yet** |
| Auth write fails | Friendly message via the Server Action. **[implemented]** auth errors are already mapped to friendly messages |

### Rules **[recommended]**

1. **Distinguish empty from failed.** `{ data: null, error: null }` means "no rows".
   `{ data: null, error }` means "could not load". Rendering both as an empty list
   is a correctness bug that also destroys trust.
2. **Never discard a Supabase `error`.** Every `await supabase…` must destructure
   and handle `error`. `src/lib/users.ts` is the reference implementation.
3. **Add `error.tsx` before shipping feature pages.** There is currently **no**
   `error.tsx` anywhere, so an unexpected throw in a Server Component surfaces as
   the framework's default error screen with no recovery path. An `error.tsx` with
   a retry button is a small amount of code with a large effect on perceived
   quality.
4. **Preserve user input on failure.** A failed note save must not lose the text.
5. **No blank screens, ever.** Every async region needs a defined fallback:
   skeleton, error state, or partial content.
6. **Do not set aggressive client-side timeouts** on Supabase calls. A timeout that
   fires while the server is still working produces a confusing failure and may
   leave a write that actually succeeded. Let the request complete and handle the
   real error.
7. **Log server-side with context** for failures, without logging secrets or
   session tokens.

### Needs measurement **[needs measurement]**

Real timeout and latency behaviour under slow-network conditions is untested. There
is no baseline and no feature pages yet. Establish one before tuning any timeout or
retry behaviour.

---

## 12. Performance Measurement

> **Baseline measurement must be established before defining hard performance
> budgets.**

Perceived speed is not evidence. Every performance claim in a review — including
the ones in this document — must be backed by a measurement.

### Browser — Core Web Vitals **[recommended]**

| Metric | Measures | Why it matters here |
| ------ | -------- | ------------------- |
| **LCP** | Largest Contentful Paint | Does the page's main content appear promptly? Sensitive to the initial query and to blocking the whole render on `requireUser()` |
| **INP** | Interaction to Next Paint | Do toggles, filters and submissions feel immediate? Sensitive to pending states and optimistic UI |
| **CLS** | Cumulative Layout Shift | Do skeletons match the real layout? A mismatched skeleton is a direct CLS source |
| TTFB | Time to First Byte | Proxy + session refresh + first query, all on the critical path |
| JS payload | Client bundle bytes | Driven by `"use client"` boundaries; watch it when charts or editors arrive |

### Server **[recommended]**

- Server Component render duration per route
- Server Action duration
- Time inside `requireUser()` — currently **two calls per protected page** (F-1)
- Cold vs warm function behaviour

### Database **[recommended]**

- Query duration per statement
- **Number of queries per page view** — often the most actionable number, since
  each is a network round trip
- Rows returned per query (a large number usually means a missing `limit()`)
- Index usage and query plan (`EXPLAIN`) when a query is slow
- RLS policy evaluation overhead on the `EXISTS`-based policies

### Network **[recommended]**

- Request count per page view
- Payload size per response
- Round-trip latency to the Supabase region
- Behaviour under a throttled profile (the slow-network case that matters)

### Practical tools **[recommended]**

Use what already exists rather than adding infrastructure:

- Browser DevTools **Network** panel — request count, waterfall, payload sizes
- DevTools **Performance** panel — LCP, INP, CLS, main-thread blocking
- Next.js dev overlay / `next build` output — route sizes and client/server split
- Supabase dashboard **Query Performance** / logs — slow statements and plans
- `EXPLAIN (ANALYZE, BUFFERS)` read-only, against the Supabase SQL editor
- Lighthouse — as a repeatable reference, not as an absolute score

### Rules **[recommended]**

- Measure on realistic data, not an empty database. The current tables hold **0
  rows**, so today's numbers are meaningless as a baseline.
- Record the dataset size alongside any number. "120 ms" means nothing without "on
  10,000 activities".
- Compare against the previous measurement, not against an imagined target.
- Do not optimise what you have not measured.

---

## 13. Performance Review Checklist

Run through this when adding or reviewing any ChiroMemo feature.

### Data fetching

- [ ] Is only the data the UI actually renders fetched?
- [ ] Are columns named explicitly, or is `select("*")` justified?
- [ ] Are large text columns (`notes.content`, `summaries.content`,
      `learning_activities.metadata`) excluded from list queries?
- [ ] Is there any duplicate query for data already fetched in the same request?
- [ ] Is there an N+1 pattern — a query inside a loop?
- [ ] Is filtering done in the database rather than in JavaScript?
- [ ] Does every list query have a sensible upper bound?
- [ ] Is pagination present where the expected volume or UX requires it?
- [ ] Are queries that are independent of one another fetched concurrently with
      `Promise.all`, while dependent ones stay sequential?
- [ ] Does the page render its first view without waiting for data it does not need?

### Database

- [ ] Does the query match an existing index, or is that intentional and justified?
- [ ] If a new index is proposed, is there a written query pattern and plan
      evidence behind it?
- [ ] Is `order()` on an indexed column?
- [ ] Is the result set still efficient at 100× and 1,000× the expected data size?
- [ ] Is a `count` needed, and if so is `estimated` sufficient?
- [ ] Has a query plan been checked for sequential scans on realistic data?

### Security and RLS

- [ ] Does every query go through the authenticated Supabase client?
- [ ] Is any id taken from a verified auth context rather than from user input?
- [ ] Has RLS been left fully intact, with no bypass added for speed?
- [ ] Do writes scope to `id` and `user_id`?

### UI and rendering

- [ ] Is there a loading state for every async region — no blank screens?
- [ ] Is `loading.tsx` or `<Suspense>` used for the async region, chosen to fit
      the rendering situation?
- [ ] Do skeletons match the final layout (to avoid CLS)?
- [ ] Are Server Components used wherever interactivity is not required?
- [ ] Is each `"use client"` boundary as deep and as small as possible?
- [ ] Are props passed to Client Components minimal?
- [ ] Does an unexpected error have a recoverable boundary (`error.tsx`)?

### Network

- [ ] Is the response payload proportionate to what is displayed?
- [ ] Are there requests that could be eliminated or merged?
- [ ] Is data below the fold loaded lazily?
- [ ] Will images and uploads be sized appropriately rather than sent at full size?
- [ ] Has the client bundle grown noticeably, and is that justified?

### Interaction

- [ ] Does the user get feedback the moment they act?
- [ ] Is the submit control disabled while pending, preventing duplicate submits?
- [ ] Is optimistic UI used only where reverting is safe and the user benefits?
- [ ] Can the user recover from an error without losing their input?
- [ ] Is an empty result distinguished from a failed request?
- [ ] Are search and filter inputs debounced rather than firing per keystroke?

---

## 14. Anti-Patterns

Do not do these. Each is listed with why it fails in ChiroMemo specifically.

1. **`select("*")` without reason.** Pulls columns the UI never renders, plus all
   columns of embedded relations, across the network on every request.
2. **Fetching a whole dataset to the browser.** Scales with total data instead of
   displayed data, and RLS does not help — the rows still cross the wire.
3. **N+1 queries.** One request per parent row. With `learning_goals → roadmaps →
   roadmap_steps` this is the most likely cause of a slow page. Group in memory or
   embed the relation.
4. **Duplicate fetching.** The same data requested twice per request. Already
   present as finding F-1 (`requireUser()` in both layout and page).
5. **Making everything a Client Component.** `"use client"` is not a default; it
   moves code into the browser bundle and is the main client-JS lever.
6. **Adding a large library for a small problem.** A dependency is a permanent
   bundle, maintenance and upgrade cost. `recharts` is already installed and unused
   — justify before wiring it in.
7. **Caching user data unsafely.** A cache entry not scoped to the verified user id
   leaks one student's data to another. This is a security bug.
8. **Bypassing RLS for performance.** Service-role clients, disabled RLS, or
   `SECURITY DEFINER` shortcuts. RLS is the security boundary. Fix slow queries
   with better queries and indexes.
9. **Adding indexes without a query pattern.** Every index taxes writes and
   storage. No written query pattern and no plan evidence means no index.
10. **Premature optimization.** Speculating about slowness before measuring. It adds
    complexity, usually in the wrong layer, and hides real bottlenecks.
11. **Adding Redis, WebSockets, a cache service, or microservices without a
    measured bottleneck.** ChiroMemo is a single-user-per-account application with
    no measured performance problem. None of this is justified today.
12. **Filtering in JavaScript what the database should filter.** Wastes bandwidth
    and defeats indexes.
13. **Missing `limit()` on a list query.** A table that only grows turns one query
    into a production incident.
14. **Blocking the whole page on one slow query.** No `Suspense`, no `loading.tsx`,
    so the user stares at nothing. Independent regions should render
    independently.
15. **Dropping error information.** Ignoring a Supabase `error` and rendering an
    empty result hides real failures and makes an empty list and a broken query
    look identical.
16. **Arbitrary client-side timeouts on database calls.** Produces confusing
    failures and can leave a write that actually succeeded.
17. **Rebuilding a shared user lookup per component.** Authenticate once per
    request and reuse it.

---

## 15. Optimization Decision Rule

```
Measure
  ↓
Identify the bottleneck
  ↓
Understand the root cause
  ↓
Optimize the smallest appropriate layer
  ↓
Measure again
```

### What each step demands

1. **Measure.** A real number on realistic data, with the dataset size recorded. If
   you cannot produce a number, you do not have a performance problem yet.
2. **Identify the bottleneck.** Is it rendering, JavaScript, network, or the
   database? Guessing wrong here wastes all subsequent effort. Use the waterfall:
   is the browser waiting on the server, is the server waiting on Postgres, or is
   the main thread blocked?
3. **Understand the root cause.** Do not treat the symptom. "The page is slow" is
   not a cause; "two duplicate single-row queries per render" (F-1) is. A slow
   query caused by a missing index needs an index, not a smaller payload.
4. **Optimize the smallest appropriate layer.** Prefer the cheapest correct fix
   first:
   - remove a redundant query → **best** (no new machinery, no risk)
   - narrow a projection, add `limit()`, add a filter → very cheap
   - add an index that matches a known query pattern → moderate, has a write cost
   - parallelize independent requests → cheap
   - split a component or lazy-load a heavy library → moderate
   - change architecture or add infrastructure → **last resort**
5. **Measure again.** Confirm the change actually helped and did not move the cost
   somewhere else (fewer requests but a heavier one, a faster page but a slower
   write).

### The rule behind the rule

> **Optimisation must be based on evidence, not assumption.** If you cannot name the
> measurement that motivated the change, do not make the change.

And equally important: **a correct, simple, well-indexed query on an
RLS-scoped Supabase Data API is already a good architecture.** ChiroMemo does not
need to become a different system to be fast. It needs disciplined queries, honest
measurement, and features designed with limits from the start.

---

## 16. Feature Development Performance Contract

Every new ChiroMemo feature must work through these ten steps **before** it is
merged. They are ordered so that the cheapest decisions come first.

### 1. Define the data the UI needs

Write down the exact fields each view renders. If a list shows a title and a
status, the query fetches a title and a status. Large text bodies belong on the
detail view, not the list. Deliverable: a field list per view.

### 2. Design an efficient query

One query where possible. Embedded relations or a single `in(...)` plus in-memory
grouping instead of a query per parent. `Promise.all` for queries that are
independent of one another; keep dependent queries sequential. Explicit columns. A
sensible bound on list queries, with pagination where volume or UX calls for it.
Filtering and sorting in SQL.

Deliverable: the intended query shape, before writing the component.

### 3. Check the RLS implications

Which policies apply to these tables? Does the query's access path match the
indexes that exist? Is a new `EXISTS`-guarded policy involved (`roadmap_steps`
inherits ownership through `roadmaps`)? Confirm no bypass is being introduced.
Confirm every id comes from the verified auth context.

### 4. Check the indexes

Does the query's filter and sort match an existing index in
`supabase/migrations/`? If not, either reshape the query to fit an existing index,
or propose a new one **with** a written query pattern and plan evidence. Never add
an index by intuition.

### 5. Define the loading state

Every async area should have a clear loading experience where it is appropriate.
Choose `loading.tsx` **or** `<Suspense>` — whichever fits the rendering situation —
with skeletons shaped like the final content. Every async region that needs a
fallback gets one. **No blank screens.**

### 6. Define the error state

Handle the Supabase `error` on every call. Distinguish empty from failed. Add
`error.tsx` where an unexpected throw is possible. Preserve user input. Provide a
retry path.

### 7. Consider the slow network

What does this screen do on a congested connection? Is the payload proportionate?
Does anything block on an unnecessary request? Does the user see feedback
immediately?

### 8. Avoid unnecessary client-side JavaScript

Server Component by default. `"use client"` only where interactivity genuinely
requires it, and as deep as possible. Do not pull a large library into the initial
bundle for one component. Watch what the change does to the client payload.

### 9. Measure when the feature is sufficiently complex

Not every feature needs a measurement session. Do measure when a feature introduces
a new query pattern, a new table, a chart or editor library, a large payload, or a
deep-nested data traversal. Record dataset size with the number.

### 10. Re-check as data volume grows

Feature behaviour at 10 goals is not behaviour at 1,000 goals or 10,000
activities. Re-check pagination, query plans and payload when real data volume
arrives. If a feature ships without pagination because "there is no data yet",
it will need a migration later on a live table.

---

## 17. Current Known Gaps

Nothing below has been measured. These are the open questions, stated honestly
rather than filled with plausible numbers.

### No baseline exists **[needs measurement]**

- Current page load time for `/dashboard`, `/login`, `/register`
- Current LCP, INP and CLS — no Core Web Vitals have ever been collected
- Current TTFB, including Proxy session-refresh cost
- Current client JavaScript bundle size, and the per-route split
- Current number of Supabase requests per page view
- Current payload size per response
- Real query latency against the Supabase region
- Whether the Proxy's `getClaims()` is a measurable share of TTFB
- Behaviour under a throttled/slow-network profile
- Cold-start behaviour of the Vercel function

### Cannot be assessed yet, for lack of data **[needs measurement]**

The database held **0 rows in all 8 tables** at last verification, and there are no
feature pages. Therefore these are genuinely unknown:

- Actual slow-query patterns under realistic data volume
- Whether the `EXISTS`-guarded RLS policies are measurable in practice
- Whether `roadmap_steps`' ownership-through-`roadmaps` indirection is costly
- Whether offset pagination degrades, and where cursor pagination would start to
  pay off
- Whether the activity feed needs an aggregate strategy before it becomes slow
- Real-world query plans for any feature query, since none exist

### Verified code findings, documented but **not fixed** in this task

Per the task's rules, these are recorded and left alone. None is an emergency, and
none should be "quickly patched" without measurement.

**F-1 — `requireUser()` runs twice per protected page render. [implemented, real]**
`src/app/(app)/layout.tsx:11` and `src/app/(app)/dashboard/page.tsx:16` both call
it. Each call issues `getClaims()` plus `ensureAppUser()`'s upsert and its separate
read-back select, so roughly 2 of every 4 PostgREST round trips per render are
duplicates of the same single-row query. It is safe and idempotent — just
wasteful. Root cause is a design where auth state is not memoised per request.
Fixing it means fetching the user once per request and reusing it, which is a
behaviour change to `requireUser()` and should be done as its own task, with
measurement before and after.

**F-2 — No `loading.tsx` or `<Suspense>` anywhere. [implemented, real]**
Every protected page blocks its entire render on `requireUser()`. On a slow
network this is a blank screen. The `Skeleton` primitive exists and is unused, so
the fix is straightforward. Left for the first feature page, which needs it.

**F-3 — No `error.tsx` boundary anywhere. [implemented, real]**
An unexpected throw in a Server Component surfaces the framework's default error
screen with no recovery action. Recommended before the first feature page ships.

**F-4 — `resolveName()` may add a round trip per `requireUser()` call. [implemented, possible]**
`src/lib/auth/session.ts:48-65` reads `name` from `claims.user_metadata` and falls
back to `auth.getUser()` when the JWT lacks it. `user_metadata` is an **optional**
claim. If Supabase does not include it in the issued token, **every**
`requireUser()` call costs an extra Auth round trip — and it is called twice per
page, so that is two extra round trips per render. Unverified: worth confirming
against one real token.

**F-5 — No pagination, `limit`, `range` or `order` in `src/`. [implemented, real]**
Zero usages. Not a defect today, since the only query is a single-row lookup. Each
feature should decide, from its expected data volume, how far it needs to bound or
page its list queries — and prefer deciding that up front over retrofitting
pagination onto a live table.

**F-6 — `recharts` installed but unused. [implemented, latent]**
Phase 8 charts will pull a large library into the client bundle. Worth budgeting
for, and worth lazy-loading if the chart is not above the fold.

**F-7 — `src/lib/supabase/client.ts` is unused. [implemented, latent]**
No module imports it. Harmless, but it is dead code that a future developer may
reach for without knowing whether it is the right choice for browser-side data
access under RLS.

---

## 18. Recommended Future Performance Work

### Now — apply during feature development

These are principles to follow from the next feature onwards. No infrastructure.

- Fetch only the columns the UI renders; keep large text bodies off list views.
- Give every list query a sensible upper bound; add `.range()` pagination where
  the expected volume or the user experience calls for it.
- Filter, sort and aggregate in the database, never in JavaScript.
- Avoid N+1: embed relations, or fetch children in one `in(...)` query and group
  in memory.
- Fetch once per request — do not repeat a query per component. (F-1 is the
  existing violation to avoid repeating.)
- Fetch independent queries concurrently with `Promise.all`; keep dependent ones
  sequential.
- Server Components by default; keep `"use client"` deep and minimal.
- Give every async area a clear loading experience, using `loading.tsx` or
  `<Suspense>` as the situation warrants. No blank screens.
- Add an `error.tsx` boundary per segment; handle every Supabase `error`.
- Disable submit controls while pending; give immediate feedback on every action.
- Verify `order()` uses an indexed column.
- Do not add an index without a written query pattern and plan evidence.
- Never bypass RLS, and never cache user data without per-user scoping.
- Measure a feature when it introduces a new query pattern, a new table, a heavy
  library, or a nested traversal.

### Later — only with measurement and evidence

- Establish a real baseline: Core Web Vitals, requests per page view, payload
  sizes, query latency — on realistic data, not an empty database. Then, and only
  then, consider numeric budgets.
- Fix F-1 (duplicate `requireUser()`) with before/after measurement. The likely
  shape is a per-request memoised user lookup.
- Verify F-4 by inspecting one real access token for `user_metadata`.
- Review the `EXISTS`-based RLS policies with `EXPLAIN` once feature queries exist.
- Consider the GIN index on `notes.tags` when AI search (Phase 11) is designed, not
  before.
- Decide on cursor pagination for `learning_activities` if real volume and
  measurement justify it.
- Design an aggregate strategy for dashboard analytics before the activity feed
  grows large.
- Configure `next.config.ts` `images` when uploads and previews arrive (Phase 9).
- Consider `FORCE ROW LEVEL SECURITY` — a security decision, but noted here
  because it affects the performance model of any future elevated-privilege path.
- Consider a real performance budget and CI check once a baseline exists.

### Avoid for now

No evidence justifies any of these, and adding them would cost complexity,
maintenance and debugging surface while solving a problem that has not been shown
to exist.

- Redis or any external cache tier
- WebSockets or realtime subscriptions — ChiroMemo is single-user per account with
  no live collaborative state
- A caching service or cache-invalidation architecture
- Microservices or a separate backend — Next.js is the whole application by design
- A background job queue — AI calls in later phases are user-initiated and can stay
  synchronous unless measurement shows otherwise
- Replacing the Supabase Data API with a direct Postgres connection or another ORM
- A second read replica or a database split
- Automated performance budgets with hard numeric thresholds, before a baseline
  exists
- Bundle-size policing tooling, before there is a measured bundle problem

---

## Related documents

- `docs/ARCHITECTURE.md` — request flow, auth flow, rendering conventions
- `docs/DATABASE.md` — schema, indexes, RLS policies, migration status
- `docs/PROJECT_CONTEXT.md` — current state and scope
- `docs/ROADMAP.md` — phase order; performance applies from Phase 4 onward
