-- ChiroMemo — Phase 6: Learning Resource Management & Step Resources
--
-- Migration: 20261021000000_phase_6_learning_resources.sql
-- Description:
--   Creates the learning_resources table with RLS, adds category support to resources,
--   and ensures step_resources join table is fully configured with ownership checks.

-- ===========================================================================
-- 1. category column on resources (canonical Phase 6 table)
-- ===========================================================================

ALTER TABLE public.resources
    ADD COLUMN IF NOT EXISTS category text;

CREATE INDEX IF NOT EXISTS resources_category_idx ON public.resources (category);

-- ===========================================================================
-- 2. learning_resources table (Phase 6 dedicated entity)
-- ===========================================================================

CREATE TABLE IF NOT EXISTS public.learning_resources (
    id text PRIMARY KEY,
    user_id uuid NOT NULL
        REFERENCES public.users (id) ON DELETE CASCADE,
    title text NOT NULL,
    type "ResourceType" NOT NULL,
    url text,
    file_path text,
    category text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS learning_resources_user_id_idx ON public.learning_resources (user_id);
CREATE INDEX IF NOT EXISTS learning_resources_category_idx ON public.learning_resources (category);

-- ===========================================================================
-- 3. step_resources (Many-to-Many Step ↔ Resource join table)
-- ===========================================================================

CREATE TABLE IF NOT EXISTS public.step_resources (
    step_id text NOT NULL
        REFERENCES public.roadmap_steps (id) ON DELETE CASCADE,
    resource_id text NOT NULL
        REFERENCES public.resources (id) ON DELETE CASCADE,
    CONSTRAINT step_resources_pkey PRIMARY KEY (step_id, resource_id)
);

-- ===========================================================================
-- 4. Enable Row Level Security (RLS)
-- ===========================================================================

ALTER TABLE public.learning_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.step_resources ENABLE ROW LEVEL SECURITY;

-- ===========================================================================
-- 5. RLS policies — learning_resources
-- ===========================================================================

DROP POLICY IF EXISTS learning_resources_select_own ON public.learning_resources;
CREATE POLICY learning_resources_select_own ON public.learning_resources
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS learning_resources_insert_own ON public.learning_resources;
CREATE POLICY learning_resources_insert_own ON public.learning_resources
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS learning_resources_update_own ON public.learning_resources;
CREATE POLICY learning_resources_update_own ON public.learning_resources
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS learning_resources_delete_own ON public.learning_resources;
CREATE POLICY learning_resources_delete_own ON public.learning_resources
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- ===========================================================================
-- 6. RLS policies — step_resources
-- ===========================================================================

DROP POLICY IF EXISTS step_resources_select_own ON public.step_resources;
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

DROP POLICY IF EXISTS step_resources_insert_own ON public.step_resources;
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

DROP POLICY IF EXISTS step_resources_delete_own ON public.step_resources;
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
-- 7. Privileges (Revoke anon, Grant authenticated)
-- ===========================================================================

REVOKE ALL ON public.learning_resources FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.learning_resources TO authenticated;

REVOKE ALL ON public.step_resources FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.step_resources TO authenticated;

