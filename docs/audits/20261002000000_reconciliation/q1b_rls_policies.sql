-- ============================================================================
-- ChiroMemo — Reconciliation audit for migration 20261002000000
-- QUERY 1B — Detailed RLS Policy Inspection
--
-- Purpose:
--   Inspect RLS policies on tables modified or referenced by migration 20261002000000:
--     * public.goal_roadmaps
--     * public.roadmap_steps
--     * public.notes
--     * public.roadmaps
--     * public.learning_goals
--
-- Properties:
--   * Read-only: inspects pg_catalog (pg_policy, pg_class, pg_namespace, pg_roles).
--   * Robust: safely handles missing tables via to_regnamespace / to_regclass.
--   * Resolves polroles OID 0 to 'PUBLIC' cleanly without alias ambiguity.
--   * Extracts canonical SQL expressions using pg_get_expr().
--   * Run as role with pg_catalog access (`postgres` in Supabase SQL Editor).
-- ============================================================================

WITH target_tables AS (
    SELECT c.oid AS relid, n.nspname AS schemaname, c.relname AS tablename
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname IN ('goal_roadmaps', 'roadmap_steps', 'notes', 'roadmaps', 'learning_goals')
      AND c.relkind = 'r'
),
policy_details AS (
    SELECT
        t.schemaname,
        t.tablename,
        p.polname::text AS policyname,
        CASE p.polcmd
            WHEN 'r' THEN 'SELECT'
            WHEN 'a' THEN 'INSERT'
            WHEN 'w' THEN 'UPDATE'
            WHEN 'd' THEN 'DELETE'
            WHEN '*' THEN 'ALL'
            ELSE p.polcmd::text
        END AS command,
        p.polpermissive AS is_permissive,
        (
            SELECT COALESCE(
                array_agg(
                    CASE
                        WHEN u.role_oid = 0 THEN 'PUBLIC'
                        ELSE COALESCE(r.rolname::text, '<unknown oid ' || u.role_oid::text || '>')
                    END
                    ORDER BY CASE
                        WHEN u.role_oid = 0 THEN 'PUBLIC'
                        ELSE COALESCE(r.rolname::text, '<unknown oid ' || u.role_oid::text || '>')
                    END
                ),
                ARRAY['PUBLIC']::text[]
            )
            FROM unnest(p.polroles) AS u(role_oid)
            LEFT JOIN pg_catalog.pg_roles r ON r.oid = u.role_oid
        ) AS roles,
        pg_get_expr(p.polqual, p.polrelid) AS using_expression,
        pg_get_expr(p.polwithcheck, p.polrelid) AS with_check_expression
    FROM target_tables t
    LEFT JOIN pg_catalog.pg_policy p ON p.polrelid = t.relid
)
SELECT
    schemaname,
    tablename,
    COALESCE(policyname, '<NO POLICIES DEFINED>') AS policyname,
    COALESCE(command, '-') AS command,
    COALESCE(is_permissive::text, '-') AS permissive,
    COALESCE(array_to_string(roles, ', '), '-') AS roles,
    COALESCE(using_expression, '-') AS using_expression,
    COALESCE(with_check_expression, '-') AS with_check_expression,
    CASE
        WHEN policyname IS NULL THEN 'MISSING'
        -- goal_roadmaps policies
        WHEN tablename = 'goal_roadmaps' AND policyname = 'goal_roadmaps_select_own' AND command = 'SELECT' THEN 'VALID'
        WHEN tablename = 'goal_roadmaps' AND policyname = 'goal_roadmaps_insert_own' AND command = 'INSERT' THEN 'VALID'
        WHEN tablename = 'goal_roadmaps' AND policyname = 'goal_roadmaps_delete_own' AND command = 'DELETE' THEN 'VALID'
        -- roadmap_steps policies
        WHEN tablename = 'roadmap_steps' AND policyname = 'roadmap_steps_select_own' AND command = 'SELECT' THEN 'VALID'
        WHEN tablename = 'roadmap_steps' AND policyname = 'roadmap_steps_insert_own' AND command = 'INSERT' THEN 'VALID'
        WHEN tablename = 'roadmap_steps' AND policyname = 'roadmap_steps_update_own' AND command = 'UPDATE' THEN 'VALID'
        WHEN tablename = 'roadmap_steps' AND policyname = 'roadmap_steps_delete_own' AND command = 'DELETE' THEN 'VALID'
        -- notes policies (from 20260930000000)
        WHEN tablename = 'notes' AND policyname = 'notes_select_own' AND command = 'SELECT' THEN 'VALID'
        WHEN tablename = 'notes' AND policyname = 'notes_insert_own' AND command = 'INSERT' THEN 'VALID'
        WHEN tablename = 'notes' AND policyname = 'notes_update_own' AND command = 'UPDATE' THEN 'VALID'
        WHEN tablename = 'notes' AND policyname = 'notes_delete_own' AND command = 'DELETE' THEN 'VALID'
        -- roadmaps policies
        WHEN tablename = 'roadmaps' AND policyname LIKE 'roadmaps_%' THEN 'VALID'
        -- learning_goals policies
        WHEN tablename = 'learning_goals' AND policyname LIKE 'goals_%' THEN 'VALID'
        ELSE 'UNEXPECTED / REVIEW REQUIRED'
    END AS static_assessment
FROM policy_details
ORDER BY tablename, policyname;
