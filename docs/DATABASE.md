# Database

Provider: **Supabase Postgres** · ORM: **Prisma** · Schema location: `prisma/schema.prisma`
Migration tooling: Prisma CLI. Connection string: `DATABASE_URL` (`.env.local`).

> Status: **planned only**. The Prisma schema is written in Phase 2
> (Database and Prisma). This document is the design that Phase 2 must satisfy.

## Enums

| Enum                | Values                                                   |
| ------------------- | -------------------------------------------------------- |
| `ResourceType`      | `PDF`, `VIDEO`, `WEBSITE`, `BOOK`, `COURSE`               |
| `GoalStatus`        | `ACTIVE`, `COMPLETED`, `ARCHIVED`                        |
| `RoadmapStepStatus` | `PENDING`, `IN_PROGRESS`, `COMPLETED`                    |
| `ActivityType`      | `GOAL_CREATED`, `GOAL_UPDATED`, `STEP_COMPLETED`, `RESOURCE_ADDED`, `NOTE_CREATED`, `SUMMARY_GENERATED`, `STUDY_SESSION` |

## Models

### User

Linked 1:1 to `auth.users` (Supabase Auth). Prisma does not create this table;
the id mirrors the Supabase Auth user id.

| Field    | Type      | Notes                        |
| -------- | --------- | ---------------------------- |
| `id`     | `String`  | PK, Supabase Auth user id    |
| `email`  | `String?` | unique                       |
| `name`   | `String?` |                              |
| `createdAt` / `updatedAt` | `DateTime` | |

Relations: goals, roadmaps, resources, notes, summaries, learningActivities.

### LearningGoal

| Field                 | Type       | Notes                                    |
| --------------------- | ---------- | ---------------------------------------- |
| `id`                  | `String`   | PK, cuid                                 |
| `userId`              | `String`   | FK -> User, cascade                       |
| `title`               | `String`   | required                                 |
| `description`         | `String?`  |                                          |
| `status`              | `GoalStatus` | default `ACTIVE`                       |
| `targetDate`          | `DateTime?` |                                         |
| `createdAt`/`updatedAt` | `DateTime` |                                         |

Relations: user, roadmaps[].

### Roadmap

A roadmap is a plan attached to a learning goal.

| Field            | Type     | Notes                          |
| ---------------- | -------- | ------------------------------ |
| `id`             | `String` | PK, cuid                       |
| `userId`         | `String` | FK -> User, cascade             |
| `goalId`         | `String?`| FK -> LearningGoal, set null    |
| `title`          | `String` | required                       |
| `description`    | `String?`|                                |
| `progressPercent`| `Int`    | default 0, 0-100, cached       |
| `createdAt`/`updatedAt` | `DateTime` |                         |

Relations: user, goal, steps[].

### RoadmapStep

| Field          | Type                 | Notes                        |
| -------------- | -------------------- | ---------------------------- |
| `id`           | `String`             | PK, cuid                     |
| `roadmapId`    | `String`             | FK -> Roadmap, cascade       |
| `title`        | `String`             | required                     |
| `description`  | `String?`            |                              |
| `order`        | `Int`                | position within the roadmap  |
| `status`       | `RoadmapStepStatus`  | default `PENDING`            |
| `completedAt`  | `DateTime?`          |                              |
| `createdAt`/`updatedAt` | `DateTime` |                     |

### Resource

| Field        | Type         | Notes                                       |
| ------------ | ------------ | ------------------------------------------- |
| `id`         | `String`     | PK, cuid                                    |
| `userId`     | `String`     | FK -> User, cascade                          |
| `title`      | `String`     | required                                    |
| `type`       | `ResourceType` | required                                  |
| `url`        | `String?`    | for website/video/course                    |
| `filePath`   | `String?`    | Supabase Storage path for PDF               |
| `author`     | `String?`    |                                            |
| `description`| `String?`    |                                            |
| `goalId`     | `String?`    | FK -> LearningGoal, set null                |
| `isArchived` | `Boolean`    | default false                               |
| `createdAt`/`updatedAt` | `DateTime` |                                 |

Relations: user, goal, notes[], summaries[].

### Note

| Field        | Type      | Notes                          |
| ------------ | --------- | ------------------------------ |
| `id`         | `String`  | PK, cuid                       |
| `userId`     | `String`  | FK -> User, cascade            |
| `resourceId` | `String?` | FK -> Resource, set null       |
| `title`      | `String`  | required                       |
| `content`    | `String`  | markdown source                |
| `tags`       | `String[]`| default `[]`                   |
| `createdAt`/`updatedAt` | `DateTime` |                     |

Indexes: `(userId)`, `(resourceId)`, `tags` (GIN, added in Phase 11 for search).

### Summary

AI-generated summary of a resource or uploaded document.

| Field          | Type      | Notes                                    |
| -------------- | --------- | ---------------------------------------- |
| `id`           | `String`  | PK, cuid                                 |
| `userId`       | `String`  | FK -> User, cascade                      |
| `resourceId`   | `String?` | FK -> Resource, set null                 |
| `content`      | `String`  | summary markdown                         |
| `keyPoints`    | `String[]`| default `[]`                             |
| `model`        | `String?` | Gemini model id used                     |
| `createdAt`/`updatedAt` | `DateTime` |                                 |

### LearningActivity

Event log that powers dashboard analytics and progress tracking.

| Field       | Type         | Notes                        |
| ----------- | ------------ | ---------------------------- |
| `id`        | `String`     | PK, cuid                     |
| `userId`    | `String`     | FK -> User, cascade          |
| `type`      | `ActivityType` | required                   |
| `entityId`  | `String?`    | related record id            |
| `metadata`  | `Json?`      | extra detail                 |
| `occurredAt`| `DateTime`   | default now, indexed         |

## Relationship summary

```
User
 ├─ 1:N ─ LearningGoal ─ 1:N ─ Roadmap ─ 1:N ─ RoadmapStep
 ├─ 1:N ─ Resource ─ 1:N ─ Note
 │        └────── 1:N ─ Summary
 └─ 1:N ─ LearningActivity
```

## Conventions

- `id`: `cuid()` except `User.id`, which is the Supabase Auth uuid string.
- All user-owned rows carry `userId`; every query filters on it.
- Timestamps: `createdAt`, `updatedAt` (`@updatedAt`).
- Deleting a `User` cascades; deleting a `Resource` sets `Note.resourceId` and
  `Summary.resourceId` to null so notes/summaries survive.
- `progressPercent` on `Roadmap` is derived from step statuses; recomputed by the
  server on step updates (Phase 5).

## Planned indexes

- `LearningActivity(userId, occurredAt)` — dashboard time series
- `RoadmapStep(roadmapId, order)` — ordered step listing
- `Resource(userId, type)`, `Note(userId, resourceId)`

## Migration commands (Phase 2)

```bash
npx prisma migrate dev --name init
npx prisma generate
npx prisma studio
```
