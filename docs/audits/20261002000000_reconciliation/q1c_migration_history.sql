-- ============================================================================
-- ChiroMemo — Reconciliation audit for migration 20261002000000
-- QUERY 1C — Migration History Verification
--
-- Prerequisite:
--   S16 in Query 1 returned 'INCONCLUSIVE' (table exists).
--   If S16 returned 'FAIL', DO NOT execute this query; investigate migration runner.
--
-- Purpose:
--   Read recorded migrations from supabase_migrations.schema_migrations.
--   Uses jsonb row extraction so it executes identically whether on
--   Supabase CLI v1 (version only) or v2 (version, statements, name).
--
-- Properties:
--   * Read-only.
--   * Evaluates presence of 20260930000000, 20261002000000, and later RPC migrations.
-- ============================================================================

SELECT
    (to_jsonb(sm) ->> 'version') AS version,
    (to_jsonb(sm) ->> 'name') AS name,
    CASE
        WHEN (to_jsonb(sm) ->> 'version') = '20260930000000' THEN 'Baseline schema & initial RLS'
        WHEN (to_jsonb(sm) ->> 'version') = '20261002000000' THEN 'Target migration under audit (many-to-many & priority)'
        WHEN (to_jsonb(sm) ->> 'version') = '20261013000000' THEN 'Roadmap step reorder RPC'
        WHEN (to_jsonb(sm) ->> 'version') = '20261013000001' THEN 'Roadmap step delete & reorder RPC'
        ELSE 'Additional / uncatalogued migration'
    END AS description,
    CASE
        WHEN (to_jsonb(sm) ->> 'version') = '20261002000000' THEN 'RECORDED'
        ELSE 'OTHER_VERSION'
    END AS status_target_migration
FROM supabase_migrations.schema_migrations sm
ORDER BY (to_jsonb(sm) ->> 'version') ASC;
