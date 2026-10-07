-- ChiroMemo — Learning Goals relationships, priority, and updated RLS
--
-- This migration is part of Phase 1A (schema transition only).
-- It is NOT applied to any database here; it is a draft file for manual review.
--
-- Depends on:
--   supabase/migrations/20260930000000_init_schema_and_rls.sql
--
-- Changes:
--   - goal_roadmaps (many-to-many Goal ↔ Roadmap)
--   - step_resources (many-to-many Step ↔ Resource)
--   - notes.step_id (optional Step reference)
--   - learning_goals.priority (user-defined ordering)
--   - removal of roadmaps.goal_id and its dependent objects
--   - RLS policies for the two new join tables
--   - updated Roadmap RLS policies (no longer reference goal_id)
--
-- Existing Goal ↔ Roadmap associations are preserved by copying them into
-- goal_roadmaps BEFORE roadmaps.goal_id is dropped.

-- ===========================================================================
-- 1. goal_roadmaps
-- ===========================================================================

CREATE TABLE public.goal_roadmaps (
    goal_id text NOT NULL
        REFERENCES public.learning_goals (id) ON DELETE CASCADE,
    roadmap_id text NOT NULL
        REFERENCES public.roadmaps (id) ON DELETE CASCADE,
    CONSTRAINT goal_roadmaps_pkey PRIMARY KEY (goal_id, roadmap_id)
);

-- The composite primary key (goal_id, roadmap_id) already creates a btree index
-- whose leading column is goal_id, which serves lookups in both directions.
-- No additional indexes are needed.

-- ===========================================================================
-- 2. step_resources
-- ===========================================================================

CREATE TABLE public.step_resources (
    step_id text NOT NULL
        REFERENCES public.roadmap_steps (id) ON DELETE CASCADE,
    resource_id text NOT NULL
        REFERENCES public.resources (id) ON DELETE CASCADE,
    CONSTRAINT step_resources_pkey PRIMARY KEY (step_id, resource_id)
);

-- ===========================================================================
-- 3. notes.step_id
-- ===========================================================================

ALTER TABLE public.notes
    ADD COLUMN step_id text;

ALTER TABLE public.notes
    ADD CONSTRAINT notes_step_id_fkey
        FOREIGN KEY (step_id)
        REFERENCES public.roadmap_steps (id)
        ON DELETE SET NULL;

CREATE INDEX notes_step_id_idx ON public.notes (step_id);

-- ===========================================================================
-- 4. learning_goals.priority
-- ===========================================================================

ALTER TABLE public.learning_goals
    ADD COLUMN priority integer NOT NULL DEFAULT 0;

-- ===========================================================================
-- 5. Preserve existing Goal ↔ Roadmap associations
-- ===========================================================================
--
-- roadmaps.goal_id is still present at this point, so existing non-null
-- associations can be copied into goal_roadmaps before the column is removed.
--
-- Roadmaps whose goal_id is NULL remain valid Roadmaps without a Goal.

INSERT INTO public.goal_roadmaps (goal_id, roadmap_id)
SELECT goal_id, id
FROM public.roadmaps
WHERE goal_id IS NOT NULL;

-- ===========================================================================
-- 6. Update Roadmap RLS policies (remove goal_id references)
-- ===========================================================================
--
-- The INSERT and UPDATE policies currently validate goal_id ownership.
-- After the migration to goal_roadmaps, roadmaps.goal_id no longer exists,
-- so these policies must be replaced with versions that only check user_id.

DROP POLICY roadmaps_insert_own ON public.roadmaps;
DROP POLICY roadmaps_update_own ON public.roadmaps;

CREATE POLICY roadmaps_insert_own ON public.roadmaps
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY roadmaps_update_own ON public.roadmaps
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ===========================================================================
-- 7. Remove old roadmaps.goal_id
-- ===========================================================================

ALTER TABLE public.roadmaps
    DROP CONSTRAINT roadmaps_goal_id_fkey;

DROP INDEX roadmaps_goal_id_idx;

ALTER TABLE public.roadmaps
    DROP COLUMN goal_id;

-- ===========================================================================
-- 8. Enable RLS on new tables
-- ===========================================================================

ALTER TABLE public.goal_roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.step_resources ENABLE ROW LEVEL SECURITY;

-- ===========================================================================
-- 9. RLS policies — goal_roadmaps
-- ===========================================================================
--
-- Ownership must be verified through BOTH sides:
--   - the Goal belongs to auth.uid()
--   - the Roadmap belongs to auth.uid()
--
-- This prevents a user from creating or accessing a relationship between
-- their Goal and another user's Roadmap, or vice versa.

CREATE POLICY goal_roadmaps_select_own ON public.goal_roadmaps
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.learning_goals AS g
            WHERE g.id = goal_roadmaps.goal_id
              AND g.user_id = auth.uid()
        )
        AND EXISTS (
            SELECT 1
            FROM public.roadmaps AS r
            WHERE r.id = goal_roadmaps.roadmap_id
              AND r.user_id = auth.uid()
        )
    );

CREATE POLICY goal_roadmaps_insert_own ON public.goal_roadmaps
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.learning_goals AS g
            WHERE g.id = goal_roadmaps.goal_id
              AND g.user_id = auth.uid()
        )
        AND EXISTS (
            SELECT 1
            FROM public.roadmaps AS r
            WHERE r.id = goal_roadmaps.roadmap_id
              AND r.user_id = auth.uid()
        )
    );

CREATE POLICY goal_roadmaps_delete_own ON public.goal_roadmaps
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.learning_goals AS g
            WHERE g.id = goal_roadmaps.goal_id
              AND g.user_id = auth.uid()
        )
        AND EXISTS (
            SELECT 1
            FROM public.roadmaps AS r
            WHERE r.id = goal_roadmaps.roadmap_id
              AND r.user_id = auth.uid()
        )
    );

-- ===========================================================================
-- 10. RLS policies — step_resources
-- ===========================================================================
--
-- Ownership must be verified through BOTH sides:
--   - the Step belongs to a Roadmap owned by auth.uid()
--   - the Resource belongs to auth.uid()
--
-- roadmap_steps has no user_id, so ownership is derived through:
--   roadmap_steps → roadmaps → auth.uid()

CREATE POLICY step_resources_select_own ON public.step_resources
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.roadmap_steps AS s
            JOIN public.roadmaps AS r ON r.id = s.roadmap_id
            WHERE s.id = step_resources.step_id
              AND r.user_id = auth.uid()
        )
        AND EXISTS (
            SELECT 1
            FROM public.resources AS res
            WHERE res.id = step_resources.resource_id
              AND res.user_id = auth.uid()
        )
    );

CREATE POLICY step_resources_insert_own ON public.step_resources
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.roadmap_steps AS s
            JOIN public.roadmaps AS r ON r.id = s.roadmap_id
            WHERE s.id = step_resources.step_id
              AND r.user_id = auth.uid()
        )
        AND EXISTS (
            SELECT 1
            FROM public.resources AS res
            WHERE res.id = step_resources.resource_id
              AND res.user_id = auth.uid()
        )
    );

CREATE POLICY step_resources_delete_own ON public.step_resources
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.roadmap_steps AS s
            JOIN public.roadmaps AS r ON r.id = s.roadmap_id
            WHERE s.id = step_resources.step_id
              AND r.user_id = auth.uid()
        )
        AND EXISTS (
            SELECT 1
            FROM public.resources AS res
            WHERE res.id = step_resources.resource_id
              AND res.user_id = auth.uid()
        )
    );

-- ===========================================================================
-- 11. RLS policies — notes (add step_id cross-ownership check)
-- ===========================================================================
--
-- The existing notes INSERT/UPDATE policies already validate resource_id
-- ownership. step_id must be validated the same way so a Note cannot be
-- attached to another user's Step.

DROP POLICY notes_insert_own ON public.notes;
DROP POLICY notes_update_own ON public.notes;

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
        AND (
            step_id IS NULL
            OR EXISTS (
                SELECT 1
                FROM public.roadmap_steps AS s
                JOIN public.roadmaps AS r ON r.id = s.roadmap_id
                WHERE s.id = notes.step_id
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
        AND (
            step_id IS NULL
            OR EXISTS (
                SELECT 1
                FROM public.roadmap_steps AS s
                JOIN public.roadmaps AS r ON r.id = s.roadmap_id
                WHERE s.id = notes.step_id
                  AND r.user_id = auth.uid()
            )
        )
    );
