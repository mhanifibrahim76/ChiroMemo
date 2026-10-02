-- ChiroMemo — initial database state (Supabase Native + RLS)
--
-- This file is the COMPLETE initial schema. The earlier Prisma-generated
-- migration was never applied to any database and has been superseded, so this
-- file must never be turned into an incremental/ALTER migration. If it is ever
-- applied and later changes are needed, add a NEW file in this folder.
--
-- Conventions:
--   - snake_case table, column, constraint, index and policy names
--   - timestamptz for every timestamp
--   - public.users.id mirrors auth.users.id by convention; no FK to auth.users
--   - ownership is enforced by Row Level Security, not only by the application
--
-- How to apply:
--   This migration is intended to be applied by the Supabase migration tooling
--   (`supabase db push`), which runs the file inside a single transaction. There
--   is deliberately no BEGIN/COMMIT here, so the file stays compatible with that
--   tooling. Executing it manually through the SQL Editor is a separate
--   procedure: the editor runs statements one at a time with autocommit, and
--   every statement below is a bare CREATE, so a mid-file failure would leave a
--   partially built schema that cannot simply be re-run. Do not execute this
--   file partially or statement-by-statement.
--
-- NOT APPLIED. This file has never been executed against a database.

-- ===========================================================================
-- Enums
-- ===========================================================================

CREATE TYPE public."GoalStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ARCHIVED');

CREATE TYPE public."RoadmapStepStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

CREATE TYPE public."ResourceType" AS ENUM ('PDF', 'VIDEO', 'WEBSITE', 'BOOK', 'COURSE');

CREATE TYPE public."ActivityType" AS ENUM (
    'GOAL_CREATED',
    'GOAL_UPDATED',
    'STEP_COMPLETED',
    'RESOURCE_ADDED',
    'NOTE_CREATED',
    'SUMMARY_GENERATED',
    'STUDY_SESSION'
);

-- ===========================================================================
-- Tables
-- ===========================================================================

CREATE TABLE public.users (
    id uuid PRIMARY KEY,
    email text,
    name text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT users_email_key UNIQUE (email)
);

CREATE TABLE public.learning_goals (
    id text PRIMARY KEY,
    user_id uuid NOT NULL
        REFERENCES public.users (id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    status "GoalStatus" NOT NULL DEFAULT 'ACTIVE',
    target_date timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.roadmaps (
    id text PRIMARY KEY,
    user_id uuid NOT NULL
        REFERENCES public.users (id) ON DELETE CASCADE,
    goal_id text
        REFERENCES public.learning_goals (id) ON DELETE SET NULL,
    title text NOT NULL,
    description text,
    progress_percent integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT roadmaps_progress_percent_check
        CHECK (progress_percent BETWEEN 0 AND 100)
);

CREATE TABLE public.roadmap_steps (
    id text PRIMARY KEY,
    roadmap_id text NOT NULL
        REFERENCES public.roadmaps (id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    "order" integer NOT NULL,
    status "RoadmapStepStatus" NOT NULL DEFAULT 'PENDING',
    completed_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT roadmap_steps_roadmap_id_order_key UNIQUE (roadmap_id, "order")
);

CREATE TABLE public.resources (
    id text PRIMARY KEY,
    user_id uuid NOT NULL
        REFERENCES public.users (id) ON DELETE CASCADE,
    goal_id text
        REFERENCES public.learning_goals (id) ON DELETE SET NULL,
    title text NOT NULL,
    type "ResourceType" NOT NULL,
    url text,
    file_path text,
    author text,
    description text,
    is_archived boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.notes (
    id text PRIMARY KEY,
    user_id uuid NOT NULL
        REFERENCES public.users (id) ON DELETE CASCADE,
    resource_id text
        REFERENCES public.resources (id) ON DELETE SET NULL,
    title text NOT NULL,
    content text NOT NULL,
    tags text[] NOT NULL DEFAULT '{}'::text[],
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.summaries (
    id text PRIMARY KEY,
    user_id uuid NOT NULL
        REFERENCES public.users (id) ON DELETE CASCADE,
    resource_id text
        REFERENCES public.resources (id) ON DELETE SET NULL,
    content text NOT NULL,
    key_points text[] NOT NULL DEFAULT '{}'::text[],
    model text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.learning_activities (
    id text PRIMARY KEY,
    user_id uuid NOT NULL
        REFERENCES public.users (id) ON DELETE CASCADE,
    type "ActivityType" NOT NULL,
    entity_id text,
    metadata jsonb,
    occurred_at timestamptz NOT NULL DEFAULT now()
);

-- ===========================================================================
-- Indexes
--
-- PostgreSQL does not index the referencing side of a foreign key, so every
-- foreign key column that is queried gets an explicit index.
-- ===========================================================================

CREATE INDEX learning_goals_user_id_idx ON public.learning_goals (user_id);

CREATE INDEX roadmaps_user_id_idx ON public.roadmaps (user_id);
CREATE INDEX roadmaps_goal_id_idx ON public.roadmaps (goal_id);

-- roadmap_steps: the UNIQUE constraint (roadmap_id, "order") already creates a
-- btree index whose leading column is roadmap_id, so it also serves every
-- roadmap_id-only lookup. A second standalone index would be redundant.

CREATE INDEX resources_user_id_type_idx ON public.resources (user_id, type);
CREATE INDEX resources_goal_id_idx ON public.resources (goal_id);

CREATE INDEX notes_user_id_idx ON public.notes (user_id);
CREATE INDEX notes_resource_id_idx ON public.notes (resource_id);

CREATE INDEX summaries_user_id_idx ON public.summaries (user_id);
CREATE INDEX summaries_resource_id_idx ON public.summaries (resource_id);

CREATE INDEX learning_activities_user_id_occurred_at_idx
    ON public.learning_activities (user_id, occurred_at);

-- ===========================================================================
-- Grants
--
-- RLS is the security boundary; these grants decide which PostgREST role can
-- reach the tables at all. `anon` is revoked so unauthenticated requests are
-- rejected by permissions before RLS is even evaluated.
-- ===========================================================================

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- ===========================================================================
-- Row Level Security
-- ===========================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_activities ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- users
--
-- No DELETE policy on purpose: accounts are removed through Supabase Auth, not
-- by deleting the profile row.
-- ---------------------------------------------------------------------------

CREATE POLICY users_select_own ON public.users
    FOR SELECT TO authenticated
    USING (id = auth.uid());

CREATE POLICY users_insert_own ON public.users
    FOR INSERT TO authenticated
    WITH CHECK (id = auth.uid());

CREATE POLICY users_update_own ON public.users
    FOR UPDATE TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- ---------------------------------------------------------------------------
-- learning_goals
-- ---------------------------------------------------------------------------

CREATE POLICY learning_goals_select_own ON public.learning_goals
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY learning_goals_insert_own ON public.learning_goals
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY learning_goals_update_own ON public.learning_goals
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY learning_goals_delete_own ON public.learning_goals
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- roadmaps
--
-- user_id = auth.uid() alone is not enough: it would allow a roadmap to point
-- at another user's learning goal through goal_id. The EXISTS clause closes
-- that cross-user reference.
-- ---------------------------------------------------------------------------

CREATE POLICY roadmaps_select_own ON public.roadmaps
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY roadmaps_insert_own ON public.roadmaps
    FOR INSERT TO authenticated
    WITH CHECK (
        user_id = auth.uid()
        AND (
            goal_id IS NULL
            OR EXISTS (
                SELECT 1
                FROM public.learning_goals AS g
                WHERE g.id = roadmaps.goal_id
                  AND g.user_id = auth.uid()
            )
        )
    );

CREATE POLICY roadmaps_update_own ON public.roadmaps
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (
        user_id = auth.uid()
        AND (
            goal_id IS NULL
            OR EXISTS (
                SELECT 1
                FROM public.learning_goals AS g
                WHERE g.id = roadmaps.goal_id
                  AND g.user_id = auth.uid()
            )
        )
    );

CREATE POLICY roadmaps_delete_own ON public.roadmaps
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- roadmap_steps
--
-- A step has no user_id; ownership is inherited from the parent roadmap.
-- ---------------------------------------------------------------------------

CREATE POLICY roadmap_steps_select_own ON public.roadmap_steps
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.roadmaps AS r
            WHERE r.id = roadmap_steps.roadmap_id
              AND r.user_id = auth.uid()
        )
    );

CREATE POLICY roadmap_steps_insert_own ON public.roadmap_steps
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.roadmaps AS r
            WHERE r.id = roadmap_steps.roadmap_id
              AND r.user_id = auth.uid()
        )
    );

CREATE POLICY roadmap_steps_update_own ON public.roadmap_steps
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.roadmaps AS r
            WHERE r.id = roadmap_steps.roadmap_id
              AND r.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.roadmaps AS r
            WHERE r.id = roadmap_steps.roadmap_id
              AND r.user_id = auth.uid()
        )
    );

CREATE POLICY roadmap_steps_delete_own ON public.roadmap_steps
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.roadmaps AS r
            WHERE r.id = roadmap_steps.roadmap_id
              AND r.user_id = auth.uid()
        )
    );

-- ---------------------------------------------------------------------------
-- resources
-- ---------------------------------------------------------------------------

CREATE POLICY resources_select_own ON public.resources
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY resources_insert_own ON public.resources
    FOR INSERT TO authenticated
    WITH CHECK (
        user_id = auth.uid()
        AND (
            goal_id IS NULL
            OR EXISTS (
                SELECT 1
                FROM public.learning_goals AS g
                WHERE g.id = resources.goal_id
                  AND g.user_id = auth.uid()
            )
        )
    );

CREATE POLICY resources_update_own ON public.resources
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (
        user_id = auth.uid()
        AND (
            goal_id IS NULL
            OR EXISTS (
                SELECT 1
                FROM public.learning_goals AS g
                WHERE g.id = resources.goal_id
                  AND g.user_id = auth.uid()
            )
        )
    );

CREATE POLICY resources_delete_own ON public.resources
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- notes
-- ---------------------------------------------------------------------------

CREATE POLICY notes_select_own ON public.notes
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY notes_insert_own ON public.notes
    FOR INSERT TO authenticated
    WITH CHECK (
        user_id = auth.uid()
        AND (
            resource_id IS NULL
            OR EXISTS (
                SELECT 1
                FROM public.resources AS r
                WHERE r.id = notes.resource_id
                  AND r.user_id = auth.uid()
            )
        )
    );

CREATE POLICY notes_update_own ON public.notes
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (
        user_id = auth.uid()
        AND (
            resource_id IS NULL
            OR EXISTS (
                SELECT 1
                FROM public.resources AS r
                WHERE r.id = notes.resource_id
                  AND r.user_id = auth.uid()
            )
        )
    );

CREATE POLICY notes_delete_own ON public.notes
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- summaries
-- ---------------------------------------------------------------------------

CREATE POLICY summaries_select_own ON public.summaries
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY summaries_insert_own ON public.summaries
    FOR INSERT TO authenticated
    WITH CHECK (
        user_id = auth.uid()
        AND (
            resource_id IS NULL
            OR EXISTS (
                SELECT 1
                FROM public.resources AS r
                WHERE r.id = summaries.resource_id
                  AND r.user_id = auth.uid()
            )
        )
    );

CREATE POLICY summaries_update_own ON public.summaries
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (
        user_id = auth.uid()
        AND (
            resource_id IS NULL
            OR EXISTS (
                SELECT 1
                FROM public.resources AS r
                WHERE r.id = summaries.resource_id
                  AND r.user_id = auth.uid()
            )
        )
    );

CREATE POLICY summaries_delete_own ON public.summaries
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- learning_activities
--
-- Append-oriented event log: SELECT / INSERT / DELETE only. There is no UPDATE
-- policy, so updates through the Data API are rejected by RLS.
-- ---------------------------------------------------------------------------

CREATE POLICY learning_activities_select_own ON public.learning_activities
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY learning_activities_insert_own ON public.learning_activities
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY learning_activities_delete_own ON public.learning_activities
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());
