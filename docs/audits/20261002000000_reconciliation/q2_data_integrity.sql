-- ============================================================================
-- ChiroMemo — Reconciliation audit for migration 20261002000000
-- QUERY 2 — Data Integrity & Orphan Check
--
-- Prerequisite Structural Gates (MUST PASS Query 1 first):
--   * S01 (public.goal_roadmaps table exists) = PASS
--   * S07 (public.learning_goals.priority column exists) = PASS
--   * S10 (public.notes.step_id column exists) = PASS
--   DO NOT EXECUTE this script if any of the above gates return FAIL,
--   as PostgreSQL will raise a parse error on missing relations or columns.
--
-- Properties:
--   * 100% Read-Only: SELECT queries only. Zero DDL, zero INSERT/UPDATE/DELETE.
--   * Zero string concatenation (||): avoids NULL propagation bug (DEF-08).
--   * Accurately distinguishes problem_groups from affected_rows.
--   * Run as `postgres` in Supabase SQL Editor.
-- ============================================================================

WITH
-- D01A: Duplicate (goal_id, roadmap_id) pairs in goal_roadmaps
d01a AS (
    SELECT
        COUNT(*) AS problem_groups,
        COALESCE(SUM(cnt), 0) AS affected_rows
    FROM (
        SELECT goal_id, roadmap_id, COUNT(*) AS cnt
        FROM public.goal_roadmaps
        GROUP BY goal_id, roadmap_id
        HAVING COUNT(*) > 1
    ) sub
),

-- D01B: Orphan goal_id in goal_roadmaps (references non-existent learning_goals)
d01b AS (
    SELECT
        COUNT(DISTINCT gr.goal_id) AS problem_groups,
        COUNT(*) AS affected_rows
    FROM public.goal_roadmaps gr
    LEFT JOIN public.learning_goals lg ON lg.id = gr.goal_id
    WHERE lg.id IS NULL
),

-- D01C: Orphan roadmap_id in goal_roadmaps (references non-existent roadmaps)
d01c AS (
    SELECT
        COUNT(DISTINCT gr.roadmap_id) AS problem_groups,
        COUNT(*) AS affected_rows
    FROM public.goal_roadmaps gr
    LEFT JOIN public.roadmaps r ON r.id = gr.roadmap_id
    WHERE r.id IS NULL
),

-- D01D: Cross-user association in goal_roadmaps (goal owner != roadmap owner)
d01d AS (
    SELECT
        COUNT(*) AS problem_groups,
        COUNT(*) AS affected_rows
    FROM public.goal_roadmaps gr
    JOIN public.learning_goals lg ON lg.id = gr.goal_id
    JOIN public.roadmaps r ON r.id = gr.roadmap_id
    WHERE lg.user_id IS DISTINCT FROM r.user_id
),

-- D02A: NULL priority values in learning_goals (violates NOT NULL)
d02a AS (
    SELECT
        COUNT(*) AS problem_groups,
        COUNT(*) AS affected_rows
    FROM public.learning_goals
    WHERE priority IS NULL
),

-- D02B: Negative priority values in learning_goals (diagnostic check: default is 0)
d02b AS (
    SELECT
        COUNT(DISTINCT priority) AS problem_groups,
        COUNT(*) AS affected_rows
    FROM public.learning_goals
    WHERE priority IS NOT NULL AND priority < 0
),

-- D03A: Orphan step_id in notes (references non-existent roadmap_steps)
d03a AS (
    SELECT
        COUNT(DISTINCT n.step_id) AS problem_groups,
        COUNT(*) AS affected_rows
    FROM public.notes n
    LEFT JOIN public.roadmap_steps rs ON rs.id = n.step_id
    WHERE n.step_id IS NOT NULL AND rs.id IS NULL
),

-- D03B: User isolation violation in notes (note owner != step roadmap owner)
d03b AS (
    SELECT
        COUNT(*) AS problem_groups,
        COUNT(*) AS affected_rows
    FROM public.notes n
    JOIN public.roadmap_steps rs ON rs.id = n.step_id
    JOIN public.roadmaps r ON r.id = rs.roadmap_id
    WHERE n.step_id IS NOT NULL AND n.user_id IS DISTINCT FROM r.user_id
),

-- D04: Orphan roadmap_id in roadmap_steps (references non-existent roadmaps)
d04 AS (
    SELECT
        COUNT(DISTINCT rs.roadmap_id) AS problem_groups,
        COUNT(*) AS affected_rows
    FROM public.roadmap_steps rs
    LEFT JOIN public.roadmaps r ON r.id = rs.roadmap_id
    WHERE r.id IS NULL
)

SELECT
    'D01A' AS check_id,
    'goal_roadmaps PK uniqueness' AS check_name,
    problem_groups,
    affected_rows,
    CASE WHEN affected_rows = 0 THEN 'PASS' ELSE 'VIOLATION' END AS status,
    'Pairs of (goal_id, roadmap_id) appearing more than once' AS diagnostic_details
FROM d01a

UNION ALL

SELECT
    'D01B' AS check_id,
    'goal_roadmaps -> learning_goals FK integrity' AS check_name,
    problem_groups,
    affected_rows,
    CASE WHEN affected_rows = 0 THEN 'PASS' ELSE 'VIOLATION' END AS status,
    'Orphan goal_id rows referencing missing learning_goals' AS diagnostic_details
FROM d01b

UNION ALL

SELECT
    'D01C' AS check_id,
    'goal_roadmaps -> roadmaps FK integrity' AS check_name,
    problem_groups,
    affected_rows,
    CASE WHEN affected_rows = 0 THEN 'PASS' ELSE 'VIOLATION' END AS status,
    'Orphan roadmap_id rows referencing missing roadmaps' AS diagnostic_details
FROM d01c

UNION ALL

SELECT
    'D01D' AS check_id,
    'goal_roadmaps user ownership parity' AS check_name,
    problem_groups,
    affected_rows,
    CASE WHEN affected_rows = 0 THEN 'PASS' ELSE 'VIOLATION' END AS status,
    'Cross-tenant pairings where goal.user_id != roadmap.user_id' AS diagnostic_details
FROM d01d

UNION ALL

SELECT
    'D02A' AS check_id,
    'learning_goals.priority NOT NULL integrity' AS check_name,
    problem_groups,
    affected_rows,
    CASE WHEN affected_rows = 0 THEN 'PASS' ELSE 'VIOLATION' END AS status,
    'Rows where learning_goals.priority is NULL' AS diagnostic_details
FROM d02a

UNION ALL

SELECT
    'D02B' AS check_id,
    'learning_goals.priority domain check' AS check_name,
    problem_groups,
    affected_rows,
    CASE WHEN affected_rows = 0 THEN 'PASS' ELSE 'VIOLATION' END AS status,
    'Rows with priority values < 0 (expected non-negative integer)' AS diagnostic_details
FROM d02b

UNION ALL

SELECT
    'D03A' AS check_id,
    'notes.step_id -> roadmap_steps FK integrity' AS check_name,
    problem_groups,
    affected_rows,
    CASE WHEN affected_rows = 0 THEN 'PASS' ELSE 'VIOLATION' END AS status,
    'Notes referencing non-existent roadmap_steps' AS diagnostic_details
FROM d03a

UNION ALL

SELECT
    'D03B' AS check_id,
    'notes.step_id user ownership parity' AS check_name,
    problem_groups,
    affected_rows,
    CASE WHEN affected_rows = 0 THEN 'PASS' ELSE 'VIOLATION' END AS status,
    'Notes attached to steps belonging to a different user' AS diagnostic_details
FROM d03b

UNION ALL

SELECT
    'D04' AS check_id,
    'roadmap_steps -> roadmaps FK integrity' AS check_name,
    problem_groups,
    affected_rows,
    CASE WHEN affected_rows = 0 THEN 'PASS' ELSE 'VIOLATION' END AS status,
    'Roadmap steps referencing non-existent roadmaps' AS diagnostic_details
FROM d04

ORDER BY check_id;
