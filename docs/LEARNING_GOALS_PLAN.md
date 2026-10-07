# Learning Goals Plan

> **Status:** Final planning blueprint — read/review before implementation
>
> **Scope:** Learning Goals feature and the database relationships required to support it.
>
> **Important:** This document separates the **CURRENT STATE** of the repository/database from the **TARGET DESIGN**. Product decisions in the target design must not be treated as facts about the current schema.

---

## 1. Purpose

This document defines the implementation plan for the Learning Goals feature in ChiroMemo.

The purpose is to establish:

- the Learning Goals user experience;
- the Goal lifecycle;
- Goal ↔ Roadmap relationships;
- Roadmap ↔ Step relationships;
- Step ↔ Resource relationships;
- Note relationships;
- deletion and preservation behavior;
- RLS/security requirements;
- required database migration;
- application architecture;
- validation;
- loading/error/empty states;
- testing;
- implementation phases.

This document is a **planning document**, not permission to modify the codebase or database by itself.

---

# 2. Current Repository State

## 2.1 Application Architecture

The current application uses:

- Next.js 16.3.7
- Next.js App Router
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Supabase Auth
- Supabase SSR
- Supabase Data API
- PostgreSQL through Supabase
- Supabase Row Level Security (RLS)
- Zod for validation

Prisma has been removed.

All application data access should use the existing Supabase Data API + RLS architecture.

The generated database types are located at:

```text
src/lib/supabase/database.types.ts
```

and are used through the `Database` generic.

---

## 2.2 Existing Authentication

Authentication is already implemented.

Important existing components include:

```text
src/lib/auth/session.ts
src/lib/auth/actions.ts
src/lib/supabase/server.ts
src/proxy.ts
```

`requireUser()` is the application-level authentication gate.

The current proxy protection includes:

```text
PROTECTED_PREFIXES = ["/dashboard"]
```

### Target

The Learning Goals routes must also be protected:

```text
PROTECTED_PREFIXES = ["/dashboard", "/goals"]
```

The exact implementation should preserve the existing authentication architecture rather than introducing a second authentication mechanism.

---

## 2.3 Planned Routes

Learning Goals will use:

```text
/goals
/goals/[id]
```

### `/goals`

Responsible for the Goal list and Goal-level actions.

Expected responsibilities:

- show user's Goals;
- show Goal status;
- show priority/order;
- provide create Goal action;
- provide navigation to Goal detail;
- provide edit action;
- provide permanent delete action with strong confirmation;
- provide archive/completion actions according to lifecycle rules.

### `/goals/[id]`

Responsible for one Goal.

Expected responsibilities:

- show Goal information;
- show Goal status;
- show Goal priority;
- show Roadmaps associated with the Goal;
- allow navigation into associated Roadmaps;
- allow Goal editing;
- allow lifecycle changes;
- allow permanent deletion with warning.

The exact visual design can be refined during UI implementation, but the route responsibilities should remain separated.

---

# 3. Current Database State

The current public schema contains 8 tables:

```text
users
learning_goals
roadmaps
roadmap_steps
resources
notes
summaries
learning_activities
```

There are 4 enums:

```text
GoalStatus
RoadmapStepStatus
ResourceType
ActivityType
```

There are currently 11 foreign keys:

- 7 with `ON DELETE CASCADE`
- 4 with `ON DELETE SET NULL`

RLS is enabled on all 8 existing public tables.

There are currently 30 RLS policies.

The existing policies are scoped to the `authenticated` role.

---

## 3.1 Learning Goals — Current

Current conceptual structure:

```text
learning_goals
├── id
├── user_id
├── title
├── description
├── status
├── target_date
├── created_at
└── updated_at
```

Important current facts:

- `learning_goals.id` is `text`;
- it has no database default;
- the application must generate the ID;
- `GoalStatus` currently contains:
  - ACTIVE
  - COMPLETED
  - ARCHIVED
- there is currently no priority column.

### Target

The application should generate Goal IDs consistently with the existing application ID pattern.

The target design also requires a persistent user-defined Goal priority/order.

A priority field is therefore expected to be added to `learning_goals`.

The exact numeric semantics should be simple and maintainable. Implementation should not introduce unnecessary ranking infrastructure.

---

## 3.2 Goal ↔ Roadmap — CURRENT

The current schema is **NOT many-to-many**.

Current relationship:

```text
learning_goals
      1
      │
      │
      N
roadmaps.goal_id
```

Specifically:

```text
roadmaps.goal_id
    → learning_goals.id
```

Properties:

- nullable;
- foreign key;
- `ON DELETE SET NULL`.

Therefore:

> CURRENT: one Goal can have many Roadmaps, while one Roadmap can reference at most one Goal.

This must not be confused with the target product design.

---

## 3.3 Goal ↔ Roadmap — TARGET

The target relationship is:

```text
Goal >────────< Roadmap
          │
   goal_roadmaps
```

A Goal can use multiple Roadmaps.

A Roadmap can be reused by multiple Goals.

The shared Roadmap model means:

> The same Roadmap is reused by multiple Goals inside the same user's data.

It is **not cross-user sharing**.

Example:

```text
Goal A ──┐
         ├── Data Engineering Roadmap
Goal B ──┘
```

If the user edits the shared Roadmap, the change is visible from all Goals connected to that Roadmap.

The UI should make this shared behavior clear when appropriate.

---

# 4. Product Decisions

The following decisions are considered fixed for this implementation plan.

## 4.1 Goal Lifecycle

Goal status values:

```text
ACTIVE
COMPLETED
ARCHIVED
```

Deletion is not a status.

Deletion is a permanent destructive action.

---

## 4.2 Permanent Goal Deletion

There is no Trash system.

There is no time-based automatic deletion.

When the user permanently deletes a Goal, the UI must display a strong warning explaining that the Goal itself will be permanently removed.

The warning should also explain what happens to related data.

---

## 4.3 Multiple Active Goals

The system should support multiple active Goals.

The design must not assume that a user has only one active Goal.

---

## 4.4 Goal Priority

Users should be able to define their own persistent Goal priority/order.

This is different from temporary display sorting.

### Priority

A persistent user-defined preference.

### Sort

A display/query ordering such as:

- newest;
- oldest;
- priority;
- status.

The implementation must not confuse these concepts.

---

## 4.5 Roadmaps Are Reusable

Roadmaps are reusable within the user's own data.

A Roadmap does not need to belong to exactly one Goal.

A Roadmap may exist without a Goal.

A Goal may exist without a Roadmap.

---

# 5. Target Conceptual Data Model

The target model is:

```text
                 ┌───────────────┐
                 │     GOAL      │
                 └───────┬───────┘
                         │
                    N : M│
                         │
                 ┌───────▼───────┐
                 │    ROADMAP    │
                 └───────┬───────┘
                         │
                       1 : N
                         │
                 ┌───────▼───────┐
                 │     STEP      │
                 └───────┬───────┘
                         │
                    N : M│
                         │
                 ┌───────▼───────┐
                 │   RESOURCE    │
                 └───────────────┘
```

Notes:

```text
Step ──→ Note
       optional
```

Summaries:

```text
Resource ──→ Summary
```

Learning Activities remain historical records and continue using their current polymorphic `entity_id` model.

---

# 6. Entity Relationships

## 6.1 Goal ↔ Roadmap

### CURRENT

```text
roadmaps.goal_id → learning_goals.id
```

One-to-many.

### TARGET

Introduce:

```text
goal_roadmaps
├── goal_id
└── roadmap_id
```

with:

```text
Goal >────< Roadmap
```

Recommended constraints:

- composite primary key or equivalent unique constraint on `(goal_id, roadmap_id)`;
- `goal_id` FK → `learning_goals.id`;
- `roadmap_id` FK → `roadmaps.id`;
- both FKs use `ON DELETE CASCADE`.

After migration:

```text
roadmaps.goal_id
```

must be removed.

---

## 6.2 Roadmap → Step

### CURRENT

```text
roadmaps
   │
   └──< roadmap_steps
```

`roadmap_steps.roadmap_id` is a foreign key with `ON DELETE CASCADE`.

### TARGET

Keep this relationship unchanged.

Deleting a Roadmap deletes its Steps.

---

## 6.3 Step ↔ Resource

### CURRENT

There is no direct Step ↔ Resource relationship.

### TARGET

Create:

```text
step_resources
├── step_id
└── resource_id
```

Relationship:

```text
Step >────< Resource
```

Recommended behavior:

- both foreign keys use `ON DELETE CASCADE`;
- duplicate `(step_id, resource_id)` pairs are not allowed.

Deleting a Step removes its association rows.

Deleting a Resource removes its association rows.

The Resource itself is not deleted because a Step was deleted.

---

## 6.4 Note → Step

The product decision is now:

> Notes may optionally be associated with a Step.

Target:

```text
notes.step_id → roadmap_steps.id
```

Properties:

- nullable;
- `ON DELETE SET NULL`.

This means Notes survive Step deletion.

If a Step is deleted:

```text
Step DELETE
     ↓
Note remains
     ↓
note.step_id = NULL
```

There is no direct `roadmap_id` on Note.

The Roadmap context is inherited through the Step when `step_id` exists.

---

## 6.5 Note → Resource

The current relationship remains:

```text
notes.resource_id → resources.id
```

Properties:

- nullable;
- `ON DELETE SET NULL`.

This relationship is retained.

Therefore a Note may have:

- a Step;
- a Resource;
- both;
- neither.

This flexibility is intentional.

The UI should avoid forcing the user to manually understand database relationships. Context should be inferred from where the Note is created whenever possible.

---

## 6.6 Summary → Resource

Keep the current relationship:

```text
summaries.resource_id → resources.id
```

with `ON DELETE SET NULL`.

Deleting a Resource does not delete its Summary.

The Summary survives and loses the Resource association.

No Goal/Roadmap/Step relationship is added to Summary as part of this feature.

---

## 6.7 Learning Activities

`learning_activities` currently uses:

```text
entity_id
```

as a nullable text field without a foreign key.

This is treated as a polymorphic historical reference.

For Learning Goals implementation:

- do not redesign this relationship;
- do not add new polymorphic infrastructure;
- preserve historical activity records.

Activities should remain even if the referenced Goal, Roadmap, Step, or Resource is later deleted.

The UI should not assume that every historical `entity_id` still resolves to a current entity.

---

# 7. Goal Lifecycle

The lifecycle is:

```text
ACTIVE
   │
   ├──→ COMPLETED
   │
   └──→ ARCHIVED
```

Completed and archived Goals remain stored.

Deletion is separate:

```text
Goal
  │
  └── DELETE → permanently removed
```

No Trash.

No soft-delete replacement.

---

## 7.1 Archived Goals

Archived Goals remain available as historical user data.

The exact editing restrictions for archived Goals should not be invented during implementation.

If the UI needs a restriction, it must follow an explicit product decision rather than silently introducing one.

---

# 8. Delete and Preservation Rules

## 8.1 Delete Goal

When a Goal is permanently deleted:

```text
DELETE GOAL
│
├── delete Goal
├── delete Goal ↔ Roadmap associations
├── preserve Roadmaps
├── preserve Roadmap Steps
├── preserve Resources
├── preserve Notes
├── preserve Summaries
└── preserve Learning Activities
```

After migration, `goal_roadmaps` uses `ON DELETE CASCADE`, so Goal deletion automatically removes only association rows.

Resources currently connected through `resources.goal_id` remain because that FK uses `ON DELETE SET NULL`.

---

## 8.2 Delete Roadmap

When a Roadmap is deleted:

```text
DELETE ROADMAP
│
├── delete Roadmap
├── delete Goal ↔ Roadmap associations
├── delete Roadmap Steps
├── delete Step ↔ Resource associations
├── preserve Resources
├── preserve Notes
└── preserve Learning Activities
```

Because `roadmap_steps.roadmap_id` uses CASCADE, Steps are deleted.

Because `step_resources.step_id` uses CASCADE, Step ↔ Resource association rows are deleted.

Resources themselves remain.

If Notes use `step_id` with `ON DELETE SET NULL`, Notes remain and become detached from the deleted Step.

---

## 8.3 Delete Step

```text
DELETE STEP
│
├── delete Step
├── delete Step ↔ Resource associations
├── preserve Resources
└── preserve Notes; set notes.step_id = NULL
```

---

## 8.4 Delete Resource

```text
DELETE RESOURCE
│
├── delete Resource
├── delete Step ↔ Resource associations
├── preserve Notes; set notes.resource_id = NULL
└── preserve Summaries; set summaries.resource_id = NULL
```

Learning Activities remain.

---

## 8.5 Delete Note

A Note is an independent user-owned record.

Deleting a Note deletes only the Note.

It does not delete:

- Step;
- Resource;
- Roadmap;
- Goal.

---

# 9. Goal Priority Design

The current `learning_goals` table has no priority field.

The target design requires persistent user-defined priority.

Recommended initial implementation:

```text
priority integer NOT NULL DEFAULT 0
```

The exact semantics must be kept simple.

The application should allow users to change Goal priority without introducing drag-and-drop ranking infrastructure unless it is actually needed by the UX.

Priority and sorting must remain separate concepts.

Example:

```text
Goal A → priority 1
Goal B → priority 2
Goal C → priority 3
```

A temporary sort such as "Newest" should not overwrite priority.

An index on priority should only be added if query patterns justify it. If the implementation queries priority together with `user_id`, a composite index may be more useful than a priority-only index.

Do not invent a complex ranking algorithm.

---

# 10. Routes and Page Responsibilities

## 10.1 `/goals`

Purpose:

Goal overview/list.

Should provide:

- list of the authenticated user's Goals;
- status;
- priority;
- target date where relevant;
- create Goal;
- edit Goal;
- lifecycle actions;
- permanent delete;
- navigation to Goal detail.

Default display ordering should be predictable.

Priority should be available as a meaningful ordering option.

---

## 10.2 `/goals/[id]`

Purpose:

Detailed view of one Goal.

Should provide:

- Goal title;
- description;
- status;
- target date;
- priority;
- associated Roadmaps;
- actions to edit;
- lifecycle actions;
- permanent delete;
- navigation into associated Roadmaps.

A Goal without a Roadmap must be a valid empty state.

---

## 10.3 Protected Routes

`/goals` must be protected in `src/proxy.ts`.

Every Goal page should also use the existing server-side `requireUser()` pattern.

Do not create a separate auth guard.

---

# 11. UI / UX Plan

## 11.1 Goal List

The list should make the following information easy to understand:

- Goal title;
- status;
- priority;
- target date;
- creation date where useful.

The UI should not expose database IDs.

---

## 11.2 Create Goal

Minimum fields:

- title;
- description;
- target date;
- priority if the UX exposes it directly.

A new Goal should default to:

```text
status = ACTIVE
```

and use the defined default priority.

---

## 11.3 Edit Goal

Users should be able to update editable Goal fields.

`updated_at` must be updated by application code because no automatic database trigger currently exists.

---

## 11.4 Permanent Delete Confirmation

Deletion must require explicit confirmation.

The warning should communicate:

- the Goal will be permanently deleted;
- there is no Trash/recovery mechanism;
- associated Goal ↔ Roadmap links will be removed;
- Roadmaps themselves will remain;
- other preserved data will remain according to the delete rules.

The UI should use an explicit destructive action rather than making deletion easy to trigger accidentally.

---

## 11.5 Shared Roadmap Warning

Because a Roadmap can belong to multiple Goals, the Roadmap UI should make shared behavior clear when editing a Roadmap.

Example concept:

> This Roadmap is connected to multiple Goals. Changes to this Roadmap will be visible from all connected Goals.

The exact copy can be refined during implementation.

---

## 11.6 Notes

When creating a Note from a Step context:

```text
Current Step
    ↓
Create Note
    ↓
step_id automatically assigned
```

The user should not need to manually choose the Step when the context is already known.

If a Note is created from a broader context, `step_id` may remain NULL.

Resource association can remain optional.

---

# 12. Validation Plan

Use the existing Zod validation approach.

## Goal creation

Validate:

- title is present and meaningful;
- description is optional;
- target date is valid when provided;
- priority follows the chosen numeric constraints;
- status is controlled by application logic.

## Goal update

Validate:

- Goal ID;
- editable fields;
- status transitions allowed by the product behavior;
- priority.

## Goal deletion

Require:

- authenticated user;
- valid Goal ID;
- ownership through RLS/data query;
- explicit destructive confirmation in UI.

Validation must not replace RLS.

RLS remains the final database-level ownership boundary.

---

# 13. Data Access and Server Actions

The implementation should follow the existing Supabase Data API pattern.

Do not reintroduce Prisma.

Do not introduce a second database access layer.

Recommended structure:

```text
UI
 ↓
Server Action / Server Component
 ↓
Supabase server client
 ↓
PostgREST / Data API
 ↓
PostgreSQL + RLS
```

Server Actions should be responsible for:

- validating input;
- obtaining the authenticated user;
- performing the intended operation;
- returning a controlled result/error.

Database ownership must still be enforced by RLS.

---

## 13.1 Goal Data Access

A Goal helper/data-access module may provide operations such as:

```text
listGoals()
getGoal(id)
createGoal(input)
updateGoal(id, input)
deleteGoal(id)
updateGoalStatus(id, status)
updateGoalPriority(id, priority)
```

Exact function naming should follow existing project conventions.

Do not create unnecessary abstractions.

---

## 13.2 ID Generation

The current `learning_goals.id` has no database default.

The application must generate the ID.

The implementation should use a consistent ID-generation strategy rather than adding a new ID library mid-feature.

**Not verified from the current repository.** No application code in the current repository generates IDs for these tables yet, so there is no established in-repo pattern to reuse. The schema uses `text` ids with no database default, which is consistent with an application-generated cuid, but this is a **recommended strategy**, not a verified existing convention.

Before implementation, confirm:
- whether any existing utility or library already provides ID generation;
- whether the project already depends on a cuid/cuid2/ksguid library;
- whether a different convention (uuid, nanoid, etc.) is preferred.

If no existing convention is found, cuid is recommended because it matches the schema design and is widely supported. This decision must be made explicitly rather than left to the implementation agent.

---

## 13.3 updated_at

There is no automatic database trigger currently responsible for `updated_at`.

Therefore:

```text
UPDATE Goal
    ↓
application sets updated_at
```

Do not silently assume a trigger exists.

A future trigger can be considered separately, but it is not required for the Learning Goals implementation.

---

# 14. RLS and Security Plan

RLS must remain the primary database ownership boundary.

All new tables must have RLS enabled.

## 14.1 goal_roadmaps

The authenticated user must only be able to access associations where:

```text
goal belongs to auth.uid()
AND
roadmap belongs to auth.uid()
```

This applies to:

- SELECT;
- INSERT;
- UPDATE if needed;
- DELETE.

If the join table is modeled with a composite primary key and no mutable fields, UPDATE may not be necessary for normal application behavior. Do not add unnecessary UPDATE capability solely because other tables have it.

---

## 14.2 step_resources

The authenticated user must only be able to access an association where:

```text
step belongs to a roadmap
AND
roadmap belongs to auth.uid()
AND
resource belongs to auth.uid()
```

Because `roadmap_steps` has no direct `user_id`, ownership must be derived through:

```text
roadmap_steps
    ↓
roadmaps
    ↓
users
```

and separately through:

```text
resources.user_id
```

---

## 14.3 Existing Roadmap RLS

After removing:

```text
roadmaps.goal_id
```

the existing Roadmap INSERT/UPDATE policies must no longer reference `goal_id`.

Any ownership condition that only exists to validate `goal_id` must be removed or rewritten.

The normal Roadmap ownership check must remain.

---

## 14.4 No Cross-User Sharing

"Shared Roadmap" means:

> reusable among multiple Goals belonging to the same authenticated user.

It does not mean:

> visible to another user.

No public/cross-user Roadmap sharing is part of this feature.

---

# 15. Database Migration Plan

The migration must be deliberate and preserve user data.

## Step 1 — Create `goal_roadmaps`

Target:

```text
goal_roadmaps
├── goal_id text NOT NULL
└── roadmap_id text NOT NULL
```

Constraints:

```text
PRIMARY KEY (goal_id, roadmap_id)
```

or equivalent uniqueness.

Foreign keys:

```text
goal_id
    → learning_goals.id
    ON DELETE CASCADE

roadmap_id
    → roadmaps.id
    ON DELETE CASCADE
```

---

## Step 2 — Migrate existing Goal ↔ Roadmap associations

Before dropping `roadmaps.goal_id`, preserve existing relationships.

Conceptually:

```text
INSERT INTO goal_roadmaps (goal_id, roadmap_id)
SELECT goal_id, id
FROM roadmaps
WHERE goal_id IS NOT NULL;
```

This must happen before the old column is removed.

---

## Step 3 — Create `step_resources`

Target:

```text
step_resources
├── step_id text NOT NULL
└── resource_id text NOT NULL
```

with unique/composite primary key on:

```text
(step_id, resource_id)
```

Foreign keys:

```text
step_id
    → roadmap_steps.id
    ON DELETE CASCADE

resource_id
    → resources.id
    ON DELETE CASCADE
```

---

## Step 4 — Add `notes.step_id`

Add:

```text
notes.step_id text NULL
```

with:

```text
FOREIGN KEY → roadmap_steps.id
ON DELETE SET NULL
```

No `roadmap_id` should be added to Notes.

---

## Step 5 — Add Goal priority

Add:

```text
learning_goals.priority
```

with the chosen default.

Initial recommended shape:

```text
integer NOT NULL DEFAULT 0
```

Existing Goals must receive a valid default value.

---

## Step 6 — Remove old `roadmaps.goal_id`

Only after existing associations have been migrated:

- remove the FK;
- remove the `roadmaps.goal_id` column;
- remove its obsolete index;
- update Roadmap RLS policies that referenced it.

---

## Step 7 — Enable RLS and create policies

Enable RLS on:

```text
goal_roadmaps
step_resources
```

Create ownership policies based on authenticated user ownership.

Update any affected existing policies.

---

## Step 8 — Regenerate database types

After schema migration:

```text
src/lib/supabase/database.types.ts
```

must be regenerated from the live schema.

The generated types must reflect:

- `goal_roadmaps`;
- `step_resources`;
- `notes.step_id`;
- `learning_goals.priority`;
- removal of `roadmaps.goal_id`.

---

# 16. Performance Considerations

Follow the existing performance strategy.

## 16.1 Query Bounds

Goal list queries should have sensible bounds.

Pagination should be introduced when actual volume or UX requires it.

Do not add arbitrary pagination solely because it is theoretically possible.

---

## 16.2 Indexes

Consider indexes for:

```text
goal_roadmaps(goal_id)
goal_roadmaps(roadmap_id)

step_resources(step_id)
step_resources(resource_id)

notes(step_id)
learning_goals(user_id, priority)
```

The exact index set should be based on actual query patterns and existing indexes.

Avoid duplicate/redundant indexes.

---

## 16.3 RLS Performance

RLS ownership checks should use indexed columns where practical.

For join-table policies, ensure the columns used to find parent ownership are indexed or backed by existing primary/foreign-key indexes where appropriate.

Do not sacrifice correctness for micro-optimization.

---

## 16.4 Rendering

Use Server Components by default where appropriate.

Use client components only where interactivity requires them.

Use `loading.tsx` or `Suspense` according to actual rendering/data-loading needs.

Do not introduce unnecessary client-side fetching.

---

# 17. Error / Loading / Empty States

## Goal list loading

The user should receive clear loading feedback when data retrieval takes noticeable time.

## Goal list empty state

If the user has no Goals:

Explain:

- they do not have any Goals yet;
- what a Goal represents;
- how to create the first Goal.

Provide a clear Create Goal action.

---

## Goal not found

If `/goals/[id]` does not resolve to a Goal owned by the current user:

Do not reveal whether another user's Goal exists.

Return the appropriate not-found behavior.

---

## Delete failure

If deletion fails:

- do not pretend it succeeded;
- show a clear error;
- keep the user on a recoverable screen where possible.

---

## Validation failure

Display field-level or form-level validation errors where appropriate.

---

# 18. Testing Plan

Testing should cover both application behavior and database security.

## 18.1 Goal CRUD

Test:

- create Goal;
- list Goals;
- view Goal;
- update Goal;
- delete Goal.

---

## 18.2 Lifecycle

Test:

- ACTIVE;
- COMPLETED;
- ARCHIVED;
- lifecycle updates;
- deleted Goal no longer appears.

---

## 18.3 Ownership

Test that User A cannot:

- read User B's Goal;
- update User B's Goal;
- delete User B's Goal;
- attach their Goal to User B's Roadmap.

---

## 18.4 Goal ↔ Roadmap

Test:

- Goal can have multiple Roadmaps;
- Roadmap can be connected to multiple Goals belonging to the same user;
- deleting a Goal removes only its association rows;
- deleting a Goal does not delete the Roadmap;
- deleting a Roadmap removes its association rows;
- deleting a Roadmap does not delete Goals.

---

## 18.5 Step ↔ Resource

Test:

- Step can use multiple Resources;
- Resource can be used by multiple Steps;
- deleting a Step removes association rows;
- deleting a Resource removes association rows;
- deleting either side does not incorrectly delete the other entity.

---

## 18.6 Notes

Test:

- Note without Step;
- Note with Step;
- Note with Resource;
- Note with both Step and Resource;
- deleting Step sets `notes.step_id` to NULL;
- deleting Resource sets `notes.resource_id` to NULL;
- deleting Note does not affect Step or Resource.

---

## 18.7 RLS

Test database access as authenticated users.

Specifically test:

```text
User A
   ↓
cannot access
   ↓
User B's Goal
User B's Roadmap
User B's Step
User B's Resource
User B's Goal ↔ Roadmap associations
User B's Step ↔ Resource associations
```

---

## 18.8 Migration

Before and after migration verify:

- existing Goal records remain;
- existing Roadmaps remain;
- existing Goal ↔ Roadmap relationships are preserved;
- existing Resources remain;
- existing Notes remain;
- existing Summaries remain;
- existing Learning Activities remain.

---

# 19. Implementation Phases

Implementation should be incremental.

## Phase 1 — Schema migration

Implement only the required database changes:

- `goal_roadmaps`;
- migrate existing `roadmaps.goal_id` relationships;
- remove `roadmaps.goal_id`;
- `step_resources`;
- `notes.step_id`;
- Goal priority;
- RLS policies;
- indexes where justified;
- regenerate database types.

Do not build the UI in the same uncontrolled change if the migration cannot be verified independently.

---

## Phase 2 — Authentication / routing protection

Update:

```text
src/proxy.ts
```

to protect:

```text
/goals
```

Use existing `requireUser()`.

Do not build Goal pages or Goal data-access code before the route is protected, so that no server action or page is reachable on an unprotected prefix while the feature is being wired up.

---

## Phase 3 — Goal data access

Implement:

- Goal list query;
- Goal detail query;
- create;
- update;
- lifecycle update;
- delete;
- priority update.

Use Supabase Data API + RLS.

These functions can be built and unit-tested independently of the UI, but they must not be exposed on an unprotected route.

---

## Phase 4 — Goal list UI

Build:

```text
/goals
```

with:

- list;
- empty state;
- create;
- edit;
- lifecycle actions;
- delete confirmation;
- priority presentation.

---

## Phase 5 — Goal detail UI

Build:

```text
/goals/[id]
```

with:

- Goal information;
- associated Roadmaps;
- empty Roadmap state;
- lifecycle actions;
- delete confirmation.

---

## Phase 6 — Relationship integration

Integrate:

- Goal ↔ Roadmap;
- Roadmap → Step;
- Step ↔ Resource;
- Note → Step.

The implementation should make the underlying relationship model understandable without exposing unnecessary database complexity.

---

## Phase 7 — Validation and error handling

Add:

- Zod validation;
- action error handling;
- not-found behavior;
- loading states;
- empty states;
- destructive confirmation.

---

## Phase 8 — Testing and verification

Run:

- typecheck;
- lint;
- application tests where available;
- database/RLS tests;
- relationship/delete behavior checks;
- migration verification.

---

## Phase 9 — Documentation / checkpoint

After the implementation is verified:

- update relevant documentation;
- create a Git checkpoint commit;
- keep the commit focused on the Learning Goals feature.

Do not combine unrelated refactors into the checkpoint.

---

# 20. Open Questions / Decisions Required Before Coding

The following decisions are considered resolved:

- Goal ↔ Roadmap is many-to-many.
- Roadmaps are reusable within one user's own data.
- Step ↔ Resource is many-to-many.
- Notes may optionally reference a Step.
- Notes retain their existing optional Resource relationship.
- `notes.step_id` uses `ON DELETE SET NULL`.
- Goal deletion is permanent.
- Goal deletion preserves Roadmaps, Steps, Resources, Notes, Summaries, and Learning Activities.
- Roadmap deletion deletes its Steps and associations but preserves Resources, Notes, and Activities.
- No Trash mechanism.

The following should still be verified against existing project conventions before implementation:

1. Exact Goal ID generator already used elsewhere in the application.
2. Exact numeric priority semantics and whether duplicate priority values are acceptable.
3. Exact lifecycle transition rules, if any restrictions are desired.
4. Whether archived Goals remain fully editable.
5. Whether `FORCE ROW LEVEL SECURITY` should be enabled before deployment.

These should not be silently invented by the implementation agent.

If a decision is needed that is not covered by this document, stop and request clarification rather than introducing a product rule without approval.

---

# 21. Final Recommended Architecture

The final target architecture is:

```text
                         ┌──────────────┐
                         │    GOALS     │
                         └──────┬───────┘
                                │
                           N : M│
                                │
                         ┌──────▼───────┐
                         │   ROADMAPS   │
                         └──────┬───────┘
                                │
                              1 : N
                                │
                         ┌──────▼───────┐
                         │    STEPS     │
                         └──────┬───────┘
                                │
                           N : M│
                                │
                         ┌──────▼───────┐
                         │  RESOURCES   │
                         └──────┬───────┘
                                │
                               N:1
                                │
                         ┌──────▼───────┐
                         │  SUMMARIES   │
                         └──────────────┘

STEP ────────────────→ NOTE
        optional

LEARNING_ACTIVITIES
        │
        └── historical / polymorphic entity reference
```

Database association tables:

```text
goal_roadmaps
─────────────
goal_id
roadmap_id


step_resources
──────────────
step_id
resource_id
```

Core principles:

1. **Goal describes what the user wants to achieve.**
2. **Roadmap describes one way to approach that Goal.**
3. **A Goal can use multiple Roadmaps.**
4. **A Roadmap can be reused by multiple Goals belonging to the same user.**
5. **A Roadmap contains Steps.**
6. **Steps can use reusable Resources.**
7. **Notes can optionally belong to a Step and/or Resource.**
8. **Resources and Notes are reusable/preservable data, not disposable children of Goals.**
9. **Summaries remain associated with Resources.**
10. **Learning Activities remain historical records.**
11. **Deleting a Goal removes the Goal and its associations, not the reusable learning data.**
12. **Deleting a Roadmap removes its Steps and relationship records, while preserving reusable Resources and Notes.**
13. **RLS remains the database-level ownership boundary.**
14. **No cross-user Roadmap sharing is introduced.**
15. **Supabase Data API + RLS remains the only application data-access path.**
16. **Do not reintroduce Prisma.**
17. **Do not add relationships or product behavior not defined in this plan without explicit approval.**

---

## Implementation Safety Rule

This document is a plan.

Before any implementation agent changes code or database:

1. Read this document.
2. Inspect the actual repository.
3. Inspect the actual live schema/migration state.
4. Distinguish current state from target state.
5. Confirm that migration steps preserve existing data.
6. Confirm RLS policies before exposing new tables.
7. Run validation after each meaningful phase.
8. Do not silently invent unresolved product decisions.
9. Do not modify unrelated features.
10. Create a focused Git checkpoint after successful implementation.

**The implementation agent must treat the TARGET DESIGN as the intended architecture, while treating the CURRENT STATE section as a description of what exists today.**
