-- ============================================================================
-- ChiroMemo — Reconciliation audit for migration 20261002000000
-- QUERY 1 — Catalog / schema audit (checks S01–S16)
--
-- Source of expectations:
--   supabase/migrations/20261002000000_learning_goals_relationships_and_priority.sql
--   supabase/migrations/20260930000000_init_schema_and_rls.sql (pre-existing
--   roadmaps / notes policies that 20261002000000 keeps)
--
-- Properties:
--   * Read-only: a single SELECT over pg_catalog / information_schema only.
--   * Never references an application table or supabase_migrations directly;
--     missing relations are detected through to_regclass(), which returns NULL
--     instead of raising an error.
--   * Returns exactly 16 rows (one per check) with 6 text columns.
--   * Requires a role that can read pg_catalog and information_schema. The
--     information_schema.columns view only lists columns the current role has
--     privileges on, so run as `postgres` (Supabase SQL Editor default).
--
-- Status semantics:
--   PASS         every catalog property encoded in the check matched.
--   FAIL         the object is missing or at least one property differs.
--   INCONCLUSIVE the structural part matched, but the check cannot prove the
--                full property (RLS expressions -> Query 1B; history -> Q1C).
--                INCONCLUSIVE is never equivalent to PASS.
-- ============================================================================

WITH
-- Policy helper: one row per policy, role list resolved to text.
-- OID 0 in polroles is the PUBLIC pseudo-role (no pg_roles row).
pol AS (
    SELECT
        p.polrelid,
        p.polname::text AS polname,
        p.polcmd::text  AS polcmd,
        p.polpermissive,
        (
            SELECT array_agg(
                       CASE
                           WHEN u.role_oid = 0 THEN 'PUBLIC'
                           ELSE COALESCE(r.rolname::text, '<unknown oid ' || u.role_oid::text || '>')
                       END
                       ORDER BY CASE
                           WHEN u.role_oid = 0 THEN 'PUBLIC'
                           ELSE COALESCE(r.rolname::text, '<unknown oid ' || u.role_oid::text || '>')
                       END
                   )
            FROM unnest(p.polroles) AS u(role_oid)
            LEFT JOIN pg_catalog.pg_roles r ON r.oid = u.role_oid
        ) AS roles
    FROM pg_catalog.pg_policy p
),

-- ----------------------------------------------------------------------------
-- S01: public.goal_roadmaps exists (ordinary table) and RLS is enabled
-- ----------------------------------------------------------------------------
s01_check AS (
    SELECT
        'S01'::text AS check_id,
        'public.goal_roadmaps (table & RLS)'::text AS object_name,
        CASE
            WHEN c.oid IS NULL THEN 'FAIL'
            WHEN c.relrowsecurity THEN 'PASS'
            ELSE 'FAIL'
        END::text AS status,
        CASE
            WHEN c.oid IS NULL THEN 'exists=false'
            ELSE 'exists=true, rls=' || c.relrowsecurity::text
        END::text AS actual_value,
        'exists=true, rls=true'::text AS expected_value,
        CASE
            WHEN c.oid IS NULL THEN 'Ordinary table public.goal_roadmaps not found'
            WHEN NOT c.relrowsecurity THEN 'Table exists but RLS is not enabled'
            ELSE 'Table exists with RLS enabled'
        END::text AS diagnostic_details
    FROM (SELECT 1) AS dummy
    LEFT JOIN pg_catalog.pg_class c
        ON c.oid = to_regclass('public.goal_roadmaps')
       AND c.relkind = 'r'
),

-- ----------------------------------------------------------------------------
-- S02: goal_roadmaps primary key = exactly one constraint on (goal_id, roadmap_id)
-- ----------------------------------------------------------------------------
s02_check AS (
    SELECT
        'S02'::text AS check_id,
        'public.goal_roadmaps primary key'::text AS object_name,
        CASE
            WHEN to_regclass('public.goal_roadmaps') IS NULL THEN 'FAIL'
            WHEN pk.pk_constraint_count = 1
             AND pk.pk_col_count = 2
             AND pk.cols = ARRAY['goal_id', 'roadmap_id']::text[] THEN 'PASS'
            ELSE 'FAIL'
        END::text AS status,
        CASE
            WHEN to_regclass('public.goal_roadmaps') IS NULL THEN 'table missing'
            ELSE 'pk_count=' || pk.pk_constraint_count::text
                 || ', col_count=' || COALESCE(pk.pk_col_count::text, '0')
                 || ', cols=' || COALESCE(array_to_string(pk.cols, ', '), 'NONE')
        END::text AS actual_value,
        'pk_count=1, col_count=2, cols=goal_id, roadmap_id'::text AS expected_value,
        CASE
            WHEN to_regclass('public.goal_roadmaps') IS NULL THEN 'Table public.goal_roadmaps missing'
            WHEN pk.pk_constraint_count = 1
             AND pk.pk_col_count = 2
             AND pk.cols = ARRAY['goal_id', 'roadmap_id']::text[]
                THEN 'Exactly one primary key on (goal_id, roadmap_id) in that order'
            ELSE 'Primary key missing or with different columns/order'
        END::text AS diagnostic_details
    FROM (SELECT 1) AS dummy
    LEFT JOIN (
        SELECT
            (SELECT COUNT(*)::int
               FROM pg_catalog.pg_constraint
              WHERE conrelid = to_regclass('public.goal_roadmaps')
                AND contype = 'p') AS pk_constraint_count,
            MAX(cardinality(con.conkey))::int AS pk_col_count,
            array_agg(a.attname::text ORDER BY u.attpos) AS cols
        FROM pg_catalog.pg_constraint con
        CROSS JOIN LATERAL unnest(con.conkey) WITH ORDINALITY AS u(attnum, attpos)
        JOIN pg_catalog.pg_attribute a
            ON a.attrelid = con.conrelid
           AND a.attnum = u.attnum
           AND a.attnum > 0
        WHERE con.conrelid = to_regclass('public.goal_roadmaps')
          AND con.contype = 'p'
    ) pk ON true
),

-- ----------------------------------------------------------------------------
-- S03: goal_roadmaps has exactly 2 FKs (any arity counted):
--      goal_id -> public.learning_goals(id) ON DELETE CASCADE, validated
--      roadmap_id -> public.roadmaps(id)    ON DELETE CASCADE, validated
-- ----------------------------------------------------------------------------
s03_check AS (
    SELECT
        'S03'::text AS check_id,
        'public.goal_roadmaps foreign keys'::text AS object_name,
        CASE
            WHEN to_regclass('public.goal_roadmaps') IS NULL THEN 'FAIL'
            WHEN fk.total_fks = 2
             AND fk.has_goal_fk IS TRUE
             AND fk.has_roadmap_fk IS TRUE THEN 'PASS'
            ELSE 'FAIL'
        END::text AS status,
        CASE
            WHEN to_regclass('public.goal_roadmaps') IS NULL THEN 'table missing'
            ELSE 'total_fks=' || fk.total_fks::text
                 || ', goal_fk=' || COALESCE(fk.has_goal_fk::text, 'false')
                 || ', roadmap_fk=' || COALESCE(fk.has_roadmap_fk::text, 'false')
        END::text AS actual_value,
        'total_fks=2, goal_fk=true, roadmap_fk=true (CASCADE, validated)'::text AS expected_value,
        CASE
            WHEN to_regclass('public.goal_roadmaps') IS NULL THEN 'Table public.goal_roadmaps missing'
            WHEN fk.total_fks = 2 AND fk.has_goal_fk IS TRUE AND fk.has_roadmap_fk IS TRUE
                THEN 'Exactly the two expected single-column CASCADE FKs, both validated'
            ELSE 'FK set differs: missing, extra (incl. composite), wrong target, action or not validated'
        END::text AS diagnostic_details
    FROM (SELECT 1) AS dummy
    LEFT JOIN (
        SELECT
            (SELECT COUNT(*)::int
               FROM pg_catalog.pg_constraint
              WHERE conrelid = to_regclass('public.goal_roadmaps')
                AND contype = 'f') AS total_fks,
            bool_or(
                a_src.attname::text = 'goal_id'
                AND n_ref.nspname::text = 'public'
                AND c_ref.relname::text = 'learning_goals'
                AND a_ref.attname::text = 'id'
                AND con.confdeltype = 'c'
                AND con.convalidated
                AND cardinality(con.conkey) = 1
                AND cardinality(con.confkey) = 1
            ) AS has_goal_fk,
            bool_or(
                a_src.attname::text = 'roadmap_id'
                AND n_ref.nspname::text = 'public'
                AND c_ref.relname::text = 'roadmaps'
                AND a_ref.attname::text = 'id'
                AND con.confdeltype = 'c'
                AND con.convalidated
                AND cardinality(con.conkey) = 1
                AND cardinality(con.confkey) = 1
            ) AS has_roadmap_fk
        FROM pg_catalog.pg_constraint con
        JOIN pg_catalog.pg_class c_ref      ON c_ref.oid = con.confrelid
        JOIN pg_catalog.pg_namespace n_ref  ON n_ref.oid = c_ref.relnamespace
        JOIN pg_catalog.pg_attribute a_src  ON a_src.attrelid = con.conrelid  AND a_src.attnum = con.conkey[1]  AND a_src.attnum > 0
        JOIN pg_catalog.pg_attribute a_ref  ON a_ref.attrelid = con.confrelid AND a_ref.attnum = con.confkey[1] AND a_ref.attnum > 0
        WHERE con.conrelid = to_regclass('public.goal_roadmaps')
          AND con.contype = 'f'
    ) fk ON true
),

-- ----------------------------------------------------------------------------
-- S04: public.step_resources exists (ordinary table) and RLS is enabled
-- ----------------------------------------------------------------------------
s04_check AS (
    SELECT
        'S04'::text AS check_id,
        'public.step_resources (table & RLS)'::text AS object_name,
        CASE
            WHEN c.oid IS NULL THEN 'FAIL'
            WHEN c.relrowsecurity THEN 'PASS'
            ELSE 'FAIL'
        END::text AS status,
        CASE
            WHEN c.oid IS NULL THEN 'exists=false'
            ELSE 'exists=true, rls=' || c.relrowsecurity::text
        END::text AS actual_value,
        'exists=true, rls=true'::text AS expected_value,
        CASE
            WHEN c.oid IS NULL THEN 'Ordinary table public.step_resources not found'
            WHEN NOT c.relrowsecurity THEN 'Table exists but RLS is not enabled'
            ELSE 'Table exists with RLS enabled'
        END::text AS diagnostic_details
    FROM (SELECT 1) AS dummy
    LEFT JOIN pg_catalog.pg_class c
        ON c.oid = to_regclass('public.step_resources')
       AND c.relkind = 'r'
),

-- ----------------------------------------------------------------------------
-- S05: step_resources primary key = exactly one constraint on (step_id, resource_id)
-- ----------------------------------------------------------------------------
s05_check AS (
    SELECT
        'S05'::text AS check_id,
        'public.step_resources primary key'::text AS object_name,
        CASE
            WHEN to_regclass('public.step_resources') IS NULL THEN 'FAIL'
            WHEN pk.pk_constraint_count = 1
             AND pk.pk_col_count = 2
             AND pk.cols = ARRAY['step_id', 'resource_id']::text[] THEN 'PASS'
            ELSE 'FAIL'
        END::text AS status,
        CASE
            WHEN to_regclass('public.step_resources') IS NULL THEN 'table missing'
            ELSE 'pk_count=' || pk.pk_constraint_count::text
                 || ', col_count=' || COALESCE(pk.pk_col_count::text, '0')
                 || ', cols=' || COALESCE(array_to_string(pk.cols, ', '), 'NONE')
        END::text AS actual_value,
        'pk_count=1, col_count=2, cols=step_id, resource_id'::text AS expected_value,
        CASE
            WHEN to_regclass('public.step_resources') IS NULL THEN 'Table public.step_resources missing'
            WHEN pk.pk_constraint_count = 1
             AND pk.pk_col_count = 2
             AND pk.cols = ARRAY['step_id', 'resource_id']::text[]
                THEN 'Exactly one primary key on (step_id, resource_id) in that order'
            ELSE 'Primary key missing or with different columns/order'
        END::text AS diagnostic_details
    FROM (SELECT 1) AS dummy
    LEFT JOIN (
        SELECT
            (SELECT COUNT(*)::int
               FROM pg_catalog.pg_constraint
              WHERE conrelid = to_regclass('public.step_resources')
                AND contype = 'p') AS pk_constraint_count,
            MAX(cardinality(con.conkey))::int AS pk_col_count,
            array_agg(a.attname::text ORDER BY u.attpos) AS cols
        FROM pg_catalog.pg_constraint con
        CROSS JOIN LATERAL unnest(con.conkey) WITH ORDINALITY AS u(attnum, attpos)
        JOIN pg_catalog.pg_attribute a
            ON a.attrelid = con.conrelid
           AND a.attnum = u.attnum
           AND a.attnum > 0
        WHERE con.conrelid = to_regclass('public.step_resources')
          AND con.contype = 'p'
    ) pk ON true
),

-- ----------------------------------------------------------------------------
-- S06: step_resources has exactly 2 FKs (any arity counted):
--      step_id -> public.roadmap_steps(id)  ON DELETE CASCADE, validated
--      resource_id -> public.resources(id)  ON DELETE CASCADE, validated
-- ----------------------------------------------------------------------------
s06_check AS (
    SELECT
        'S06'::text AS check_id,
        'public.step_resources foreign keys'::text AS object_name,
        CASE
            WHEN to_regclass('public.step_resources') IS NULL THEN 'FAIL'
            WHEN fk.total_fks = 2
             AND fk.has_step_fk IS TRUE
             AND fk.has_resource_fk IS TRUE THEN 'PASS'
            ELSE 'FAIL'
        END::text AS status,
        CASE
            WHEN to_regclass('public.step_resources') IS NULL THEN 'table missing'
            ELSE 'total_fks=' || fk.total_fks::text
                 || ', step_fk=' || COALESCE(fk.has_step_fk::text, 'false')
                 || ', resource_fk=' || COALESCE(fk.has_resource_fk::text, 'false')
        END::text AS actual_value,
        'total_fks=2, step_fk=true, resource_fk=true (CASCADE, validated)'::text AS expected_value,
        CASE
            WHEN to_regclass('public.step_resources') IS NULL THEN 'Table public.step_resources missing'
            WHEN fk.total_fks = 2 AND fk.has_step_fk IS TRUE AND fk.has_resource_fk IS TRUE
                THEN 'Exactly the two expected single-column CASCADE FKs, both validated'
            ELSE 'FK set differs: missing, extra (incl. composite), wrong target, action or not validated'
        END::text AS diagnostic_details
    FROM (SELECT 1) AS dummy
    LEFT JOIN (
        SELECT
            (SELECT COUNT(*)::int
               FROM pg_catalog.pg_constraint
              WHERE conrelid = to_regclass('public.step_resources')
                AND contype = 'f') AS total_fks,
            bool_or(
                a_src.attname::text = 'step_id'
                AND n_ref.nspname::text = 'public'
                AND c_ref.relname::text = 'roadmap_steps'
                AND a_ref.attname::text = 'id'
                AND con.confdeltype = 'c'
                AND con.convalidated
                AND cardinality(con.conkey) = 1
                AND cardinality(con.confkey) = 1
            ) AS has_step_fk,
            bool_or(
                a_src.attname::text = 'resource_id'
                AND n_ref.nspname::text = 'public'
                AND c_ref.relname::text = 'resources'
                AND a_ref.attname::text = 'id'
                AND con.confdeltype = 'c'
                AND con.convalidated
                AND cardinality(con.conkey) = 1
                AND cardinality(con.confkey) = 1
            ) AS has_resource_fk
        FROM pg_catalog.pg_constraint con
        JOIN pg_catalog.pg_class c_ref      ON c_ref.oid = con.confrelid
        JOIN pg_catalog.pg_namespace n_ref  ON n_ref.oid = c_ref.relnamespace
        JOIN pg_catalog.pg_attribute a_src  ON a_src.attrelid = con.conrelid  AND a_src.attnum = con.conkey[1]  AND a_src.attnum > 0
        JOIN pg_catalog.pg_attribute a_ref  ON a_ref.attrelid = con.confrelid AND a_ref.attnum = con.confkey[1] AND a_ref.attnum > 0
        WHERE con.conrelid = to_regclass('public.step_resources')
          AND con.contype = 'f'
    ) fk ON true
),

-- ----------------------------------------------------------------------------
-- S07: notes.step_id is text, nullable, no default
-- ----------------------------------------------------------------------------
s07_check AS (
    SELECT
        'S07'::text AS check_id,
        'public.notes.step_id (column)'::text AS object_name,
        CASE
            WHEN col.column_name IS NULL THEN 'FAIL'
            WHEN col.data_type = 'text'
             AND col.is_nullable = 'YES'
             AND col.column_default IS NULL THEN 'PASS'
            ELSE 'FAIL'
        END::text AS status,
        CASE
            WHEN col.column_name IS NULL THEN 'column missing'
            ELSE 'data_type=' || col.data_type || ', nullable=' || col.is_nullable
                 || ', default=' || COALESCE(col.column_default, 'NULL')
        END::text AS actual_value,
        'data_type=text, nullable=YES, default=NULL'::text AS expected_value,
        CASE
            WHEN col.column_name IS NULL THEN 'Column public.notes.step_id not found (or not visible to current role)'
            WHEN col.data_type = 'text' AND col.is_nullable = 'YES' AND col.column_default IS NULL
                THEN 'Column matches: text, nullable, no default'
            ELSE 'Column has a different type, nullability or default'
        END::text AS diagnostic_details
    FROM (SELECT 1) AS dummy
    LEFT JOIN information_schema.columns col
        ON col.table_schema = 'public'
       AND col.table_name = 'notes'
       AND col.column_name = 'step_id'
),

-- ----------------------------------------------------------------------------
-- S08: notes_step_id_fkey: notes(step_id) -> public.roadmap_steps(id)
--      ON DELETE SET NULL, single column, validated
-- ----------------------------------------------------------------------------
s08_check AS (
    SELECT
        'S08'::text AS check_id,
        'public.notes_step_id_fkey'::text AS object_name,
        CASE
            WHEN to_regclass('public.notes') IS NULL THEN 'FAIL'
            WHEN fk.match_count = 1 AND fk.is_valid_fk IS TRUE THEN 'PASS'
            ELSE 'FAIL'
        END::text AS status,
        CASE
            WHEN to_regclass('public.notes') IS NULL THEN 'table missing'
            WHEN fk.match_count = 0 THEN 'constraint missing'
            ELSE 'src=' || COALESCE(fk.src_col, 'NONE')
                 || ', target=' || COALESCE(fk.ref_schema, 'NONE') || '.' || COALESCE(fk.ref_table, 'NONE')
                 || '(' || COALESCE(fk.ref_col, 'NONE') || ')'
                 || ', on_delete=' || COALESCE(fk.confdeltype, 'NONE')
                 || ', validated=' || COALESCE(fk.convalidated::text, 'false')
                 || ', arity=' || COALESCE(fk.arity::text, '0')
        END::text AS actual_value,
        'src=step_id, target=public.roadmap_steps(id), on_delete=n, validated=true, arity=1'::text AS expected_value,
        CASE
            WHEN to_regclass('public.notes') IS NULL THEN 'Table public.notes missing'
            WHEN fk.match_count = 1 AND fk.is_valid_fk IS TRUE
                THEN 'FK matches source: SET NULL to public.roadmap_steps(id), validated'
            ELSE 'Constraint missing or definition differs from source'
        END::text AS diagnostic_details
    FROM (SELECT 1) AS dummy
    LEFT JOIN (
        SELECT
            COUNT(*)::int                 AS match_count,
            MAX(a_src.attname::text)      AS src_col,
            MAX(n_ref.nspname::text)      AS ref_schema,
            MAX(c_ref.relname::text)      AS ref_table,
            MAX(a_ref.attname::text)      AS ref_col,
            MAX(con.confdeltype::text)    AS confdeltype,
            bool_and(con.convalidated)    AS convalidated,
            MAX(cardinality(con.conkey))  AS arity,
            bool_or(
                n_ref.nspname::text = 'public'
                AND c_ref.relname::text = 'roadmap_steps'
                AND a_src.attname::text = 'step_id'
                AND a_ref.attname::text = 'id'
                AND con.confdeltype = 'n'
                AND con.convalidated
                AND cardinality(con.conkey) = 1
                AND cardinality(con.confkey) = 1
            ) AS is_valid_fk
        FROM pg_catalog.pg_constraint con
        JOIN pg_catalog.pg_class c_ref      ON c_ref.oid = con.confrelid
        JOIN pg_catalog.pg_namespace n_ref  ON n_ref.oid = c_ref.relnamespace
        JOIN pg_catalog.pg_attribute a_src  ON a_src.attrelid = con.conrelid  AND a_src.attnum = con.conkey[1]  AND a_src.attnum > 0
        JOIN pg_catalog.pg_attribute a_ref  ON a_ref.attrelid = con.confrelid AND a_ref.attnum = con.confkey[1] AND a_ref.attnum > 0
        WHERE con.conrelid = to_regclass('public.notes')
          AND con.conname = 'notes_step_id_fkey'
          AND con.contype = 'f'
    ) fk ON true
),

-- ----------------------------------------------------------------------------
-- S09: notes_step_id_idx: ordinary index in public on public.notes,
--      btree, single key column step_id, no INCLUDE, non-unique,
--      no predicate, no expression, indisvalid/indisready/indislive
-- ----------------------------------------------------------------------------
s09_check AS (
    SELECT
        'S09'::text AS check_id,
        'public.notes_step_id_idx'::text AS object_name,
        CASE
            WHEN to_regclass('public.notes') IS NULL THEN 'FAIL'
            WHEN idx.idx_count = 1 AND idx.is_valid_idx IS TRUE THEN 'PASS'
            ELSE 'FAIL'
        END::text AS status,
        CASE
            WHEN to_regclass('public.notes') IS NULL THEN 'table missing'
            WHEN idx.idx_count = 0 THEN 'index missing'
            ELSE 'relkind=' || COALESCE(idx.relkind, 'NONE')
                 || ', am=' || COALESCE(idx.am_name, 'NONE')
                 || ', key0=' || COALESCE(idx.col_name, 'NONE/expression')
                 || ', nkeyatts=' || COALESCE(idx.nkeyatts::text, 'NONE')
                 || ', natts=' || COALESCE(idx.natts::text, 'NONE')
                 || ', unique=' || COALESCE(idx.indisunique::text, 'NONE')
                 || ', has_pred=' || COALESCE(idx.has_pred::text, 'NONE')
                 || ', has_expr=' || COALESCE(idx.has_expr::text, 'NONE')
                 || ', valid=' || COALESCE(idx.indisvalid::text, 'NONE')
                 || ', ready=' || COALESCE(idx.indisready::text, 'NONE')
                 || ', live=' || COALESCE(idx.indislive::text, 'NONE')
        END::text AS actual_value,
        'relkind=i, am=btree, key0=step_id, nkeyatts=1, natts=1, unique=false, has_pred=false, has_expr=false, valid=true, ready=true, live=true'::text AS expected_value,
        CASE
            WHEN to_regclass('public.notes') IS NULL THEN 'Table public.notes missing'
            WHEN idx.idx_count = 0 THEN 'No index named notes_step_id_idx in schema public on public.notes'
            WHEN idx.is_valid_idx IS TRUE
                THEN 'Index definition matches source; catalog lifecycle flags are valid/ready/live'
            ELSE 'Index definition differs from source, or catalog flags show it is not usable by the planner (flags alone do not prove physical corruption)'
        END::text AS diagnostic_details
    FROM (SELECT 1) AS dummy
    LEFT JOIN (
        SELECT
            COUNT(*)::int              AS idx_count,
            MAX(c_idx.relkind::text)   AS relkind,
            MAX(am.amname::text)       AS am_name,
            MAX(a.attname::text)       AS col_name,
            MAX(i.indnkeyatts)         AS nkeyatts,
            MAX(i.indnatts)            AS natts,
            bool_or(i.indisunique)     AS indisunique,
            bool_or(i.indpred IS NOT NULL)   AS has_pred,
            bool_or(i.indexprs IS NOT NULL)  AS has_expr,
            bool_and(i.indisvalid)     AS indisvalid,
            bool_and(i.indisready)     AS indisready,
            bool_and(i.indislive)      AS indislive,
            bool_or(
                c_idx.relkind = 'i'
                AND am.amname::text = 'btree'
                AND a.attname::text = 'step_id'
                AND i.indnkeyatts = 1
                AND i.indnatts = 1
                AND NOT i.indisunique
                AND i.indpred IS NULL
                AND i.indexprs IS NULL
                AND i.indisvalid
                AND i.indisready
                AND i.indislive
            ) AS is_valid_idx
        FROM pg_catalog.pg_class c_idx
        JOIN pg_catalog.pg_namespace n ON n.oid = c_idx.relnamespace
        JOIN pg_catalog.pg_index i     ON i.indexrelid = c_idx.oid
        JOIN pg_catalog.pg_am am       ON am.oid = c_idx.relam
        -- LEFT JOIN so an expression index (indkey[0] = 0) is still counted
        LEFT JOIN pg_catalog.pg_attribute a
            ON a.attrelid = i.indrelid
           AND a.attnum = i.indkey[0]
           AND a.attnum > 0
        WHERE n.nspname = 'public'
          AND c_idx.relname = 'notes_step_id_idx'
          AND i.indrelid = to_regclass('public.notes')
    ) idx ON true
),

-- ----------------------------------------------------------------------------
-- S10: learning_goals.priority is integer NOT NULL DEFAULT 0
-- ----------------------------------------------------------------------------
s10_check AS (
    SELECT
        'S10'::text AS check_id,
        'public.learning_goals.priority (column)'::text AS object_name,
        CASE
            WHEN col.column_name IS NULL THEN 'FAIL'
            WHEN col.data_type = 'integer'
             AND col.is_nullable = 'NO'
             AND col.column_default IN ('0', '0::integer', '''0''::integer') THEN 'PASS'
            ELSE 'FAIL'
        END::text AS status,
        CASE
            WHEN col.column_name IS NULL THEN 'column missing'
            ELSE 'data_type=' || col.data_type || ', nullable=' || col.is_nullable
                 || ', default=' || COALESCE(col.column_default, 'NULL')
        END::text AS actual_value,
        'data_type=integer, nullable=NO, default=0'::text AS expected_value,
        CASE
            WHEN col.column_name IS NULL THEN 'Column public.learning_goals.priority not found (or not visible to current role)'
            WHEN col.data_type = 'integer' AND col.is_nullable = 'NO'
             AND col.column_default IN ('0', '0::integer', '''0''::integer')
                THEN 'Column matches: integer NOT NULL DEFAULT 0'
            ELSE 'Column has a different type, nullability or default'
        END::text AS diagnostic_details
    FROM (SELECT 1) AS dummy
    LEFT JOIN information_schema.columns col
        ON col.table_schema = 'public'
       AND col.table_name = 'learning_goals'
       AND col.column_name = 'priority'
),

-- ----------------------------------------------------------------------------
-- S11: roadmaps.goal_id, roadmaps_goal_id_fkey and roadmaps_goal_id_idx are gone,
--      and public.roadmaps itself still exists
-- ----------------------------------------------------------------------------
s11_check AS (
    SELECT
        'S11'::text AS check_id,
        'public.roadmaps.goal_id (removal)'::text AS object_name,
        CASE
            WHEN NOT r_exists.table_exists THEN 'FAIL'
            WHEN NOT rem.col_exists AND NOT rem.fk_exists AND NOT rem.idx_exists THEN 'PASS'
            ELSE 'FAIL'
        END::text AS status,
        CASE
            WHEN NOT r_exists.table_exists THEN 'table_exists=false'
            ELSE 'table_exists=true, col_exists=' || rem.col_exists::text
                 || ', fk_exists=' || rem.fk_exists::text
                 || ', idx_exists=' || rem.idx_exists::text
        END::text AS actual_value,
        'table_exists=true, col_exists=false, fk_exists=false, idx_exists=false'::text AS expected_value,
        CASE
            WHEN NOT r_exists.table_exists THEN 'Table public.roadmaps does not exist; removal cannot be evaluated'
            WHEN NOT rem.col_exists AND NOT rem.fk_exists AND NOT rem.idx_exists
                THEN 'goal_id column, roadmaps_goal_id_fkey and roadmaps_goal_id_idx are absent'
            ELSE 'Remnants of roadmaps.goal_id are still present'
        END::text AS diagnostic_details
    FROM (SELECT (to_regclass('public.roadmaps') IS NOT NULL) AS table_exists) r_exists
    CROSS JOIN (
        SELECT
            EXISTS (
                SELECT 1 FROM pg_catalog.pg_attribute
                 WHERE attrelid = to_regclass('public.roadmaps')
                   AND attname = 'goal_id'
                   AND attnum > 0
                   AND NOT attisdropped
            ) AS col_exists,
            EXISTS (
                SELECT 1 FROM pg_catalog.pg_constraint
                 WHERE conrelid = to_regclass('public.roadmaps')
                   AND conname = 'roadmaps_goal_id_fkey'
            ) AS fk_exists,
            EXISTS (
                SELECT 1
                  FROM pg_catalog.pg_class c
                  JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
                 WHERE n.nspname = 'public'
                   AND c.relname = 'roadmaps_goal_id_idx'
            ) AS idx_exists
    ) rem
),

-- ----------------------------------------------------------------------------
-- S12: goal_roadmaps policies — exactly 3, matching source names/commands,
--      PERMISSIVE, roles = {authenticated}. Expressions -> Query 1B.
-- ----------------------------------------------------------------------------
s12_check AS (
    SELECT
        'S12'::text AS check_id,
        'public.goal_roadmaps RLS policies (structure)'::text AS object_name,
        CASE
            WHEN to_regclass('public.goal_roadmaps') IS NULL THEN 'FAIL'
            WHEN p.total_policies = 3 AND p.ok_sel IS TRUE AND p.ok_ins IS TRUE AND p.ok_del IS TRUE
                THEN 'INCONCLUSIVE'
            ELSE 'FAIL'
        END::text AS status,
        CASE
            WHEN to_regclass('public.goal_roadmaps') IS NULL THEN 'table missing'
            ELSE 'total=' || p.total_policies::text
                 || ', select_own=' || COALESCE(p.ok_sel::text, 'false')
                 || ', insert_own=' || COALESCE(p.ok_ins::text, 'false')
                 || ', delete_own=' || COALESCE(p.ok_del::text, 'false')
        END::text AS actual_value,
        'total=3, select_own/insert_own/delete_own = true (PERMISSIVE, TO authenticated)'::text AS expected_value,
        CASE
            WHEN to_regclass('public.goal_roadmaps') IS NULL THEN 'Table public.goal_roadmaps missing'
            WHEN p.total_policies = 3 AND p.ok_sel IS TRUE AND p.ok_ins IS TRUE AND p.ok_del IS TRUE
                THEN 'Policy set matches source structurally. USING/WITH CHECK not compared: review Query 1B.'
            ELSE 'Policy missing, extra policy present, or name/command/mode/role differs from source'
        END::text AS diagnostic_details
    FROM (SELECT 1) AS dummy
    LEFT JOIN (
        SELECT
            COUNT(*)::int AS total_policies,
            bool_or(polname = 'goal_roadmaps_select_own' AND polcmd = 'r' AND polpermissive AND roles = ARRAY['authenticated']::text[]) AS ok_sel,
            bool_or(polname = 'goal_roadmaps_insert_own' AND polcmd = 'a' AND polpermissive AND roles = ARRAY['authenticated']::text[]) AS ok_ins,
            bool_or(polname = 'goal_roadmaps_delete_own' AND polcmd = 'd' AND polpermissive AND roles = ARRAY['authenticated']::text[]) AS ok_del
        FROM pol
        WHERE polrelid = to_regclass('public.goal_roadmaps')
    ) p ON true
),

-- ----------------------------------------------------------------------------
-- S13: step_resources policies — exactly 3 (same structure as S12)
-- ----------------------------------------------------------------------------
s13_check AS (
    SELECT
        'S13'::text AS check_id,
        'public.step_resources RLS policies (structure)'::text AS object_name,
        CASE
            WHEN to_regclass('public.step_resources') IS NULL THEN 'FAIL'
            WHEN p.total_policies = 3 AND p.ok_sel IS TRUE AND p.ok_ins IS TRUE AND p.ok_del IS TRUE
                THEN 'INCONCLUSIVE'
            ELSE 'FAIL'
        END::text AS status,
        CASE
            WHEN to_regclass('public.step_resources') IS NULL THEN 'table missing'
            ELSE 'total=' || p.total_policies::text
                 || ', select_own=' || COALESCE(p.ok_sel::text, 'false')
                 || ', insert_own=' || COALESCE(p.ok_ins::text, 'false')
                 || ', delete_own=' || COALESCE(p.ok_del::text, 'false')
        END::text AS actual_value,
        'total=3, select_own/insert_own/delete_own = true (PERMISSIVE, TO authenticated)'::text AS expected_value,
        CASE
            WHEN to_regclass('public.step_resources') IS NULL THEN 'Table public.step_resources missing'
            WHEN p.total_policies = 3 AND p.ok_sel IS TRUE AND p.ok_ins IS TRUE AND p.ok_del IS TRUE
                THEN 'Policy set matches source structurally. USING/WITH CHECK not compared: review Query 1B.'
            ELSE 'Policy missing, extra policy present, or name/command/mode/role differs from source'
        END::text AS diagnostic_details
    FROM (SELECT 1) AS dummy
    LEFT JOIN (
        SELECT
            COUNT(*)::int AS total_policies,
            bool_or(polname = 'step_resources_select_own' AND polcmd = 'r' AND polpermissive AND roles = ARRAY['authenticated']::text[]) AS ok_sel,
            bool_or(polname = 'step_resources_insert_own' AND polcmd = 'a' AND polpermissive AND roles = ARRAY['authenticated']::text[]) AS ok_ins,
            bool_or(polname = 'step_resources_delete_own' AND polcmd = 'd' AND polpermissive AND roles = ARRAY['authenticated']::text[]) AS ok_del
        FROM pol
        WHERE polrelid = to_regclass('public.step_resources')
    ) p ON true
),

-- ----------------------------------------------------------------------------
-- S14: roadmaps policies — exactly 4:
--      roadmaps_select_own / roadmaps_delete_own (from init migration, kept)
--      roadmaps_insert_own / roadmaps_update_own (recreated by 20261002000000)
-- ----------------------------------------------------------------------------
s14_check AS (
    SELECT
        'S14'::text AS check_id,
        'public.roadmaps RLS policies (structure)'::text AS object_name,
        CASE
            WHEN to_regclass('public.roadmaps') IS NULL THEN 'FAIL'
            WHEN p.total_policies = 4 AND p.ok_sel IS TRUE AND p.ok_ins IS TRUE
             AND p.ok_upd IS TRUE AND p.ok_del IS TRUE THEN 'INCONCLUSIVE'
            ELSE 'FAIL'
        END::text AS status,
        CASE
            WHEN to_regclass('public.roadmaps') IS NULL THEN 'table missing'
            ELSE 'total=' || p.total_policies::text
                 || ', select_own=' || COALESCE(p.ok_sel::text, 'false')
                 || ', insert_own=' || COALESCE(p.ok_ins::text, 'false')
                 || ', update_own=' || COALESCE(p.ok_upd::text, 'false')
                 || ', delete_own=' || COALESCE(p.ok_del::text, 'false')
        END::text AS actual_value,
        'total=4, select/insert/update/delete_own = true (PERMISSIVE, TO authenticated)'::text AS expected_value,
        CASE
            WHEN to_regclass('public.roadmaps') IS NULL THEN 'Table public.roadmaps missing'
            WHEN p.total_policies = 4 AND p.ok_sel IS TRUE AND p.ok_ins IS TRUE
             AND p.ok_upd IS TRUE AND p.ok_del IS TRUE
                THEN 'Policy set matches source structurally. Confirm in Query 1B that insert/update no longer reference goal_id.'
            ELSE 'Policy missing, extra policy present, or name/command/mode/role differs from source'
        END::text AS diagnostic_details
    FROM (SELECT 1) AS dummy
    LEFT JOIN (
        SELECT
            COUNT(*)::int AS total_policies,
            bool_or(polname = 'roadmaps_select_own' AND polcmd = 'r' AND polpermissive AND roles = ARRAY['authenticated']::text[]) AS ok_sel,
            bool_or(polname = 'roadmaps_insert_own' AND polcmd = 'a' AND polpermissive AND roles = ARRAY['authenticated']::text[]) AS ok_ins,
            bool_or(polname = 'roadmaps_update_own' AND polcmd = 'w' AND polpermissive AND roles = ARRAY['authenticated']::text[]) AS ok_upd,
            bool_or(polname = 'roadmaps_delete_own' AND polcmd = 'd' AND polpermissive AND roles = ARRAY['authenticated']::text[]) AS ok_del
        FROM pol
        WHERE polrelid = to_regclass('public.roadmaps')
    ) p ON true
),

-- ----------------------------------------------------------------------------
-- S15: notes policies — exactly 4:
--      notes_select_own / notes_delete_own (from init migration, kept)
--      notes_insert_own / notes_update_own (recreated by 20261002000000)
-- ----------------------------------------------------------------------------
s15_check AS (
    SELECT
        'S15'::text AS check_id,
        'public.notes RLS policies (structure)'::text AS object_name,
        CASE
            WHEN to_regclass('public.notes') IS NULL THEN 'FAIL'
            WHEN p.total_policies = 4 AND p.ok_sel IS TRUE AND p.ok_ins IS TRUE
             AND p.ok_upd IS TRUE AND p.ok_del IS TRUE THEN 'INCONCLUSIVE'
            ELSE 'FAIL'
        END::text AS status,
        CASE
            WHEN to_regclass('public.notes') IS NULL THEN 'table missing'
            ELSE 'total=' || p.total_policies::text
                 || ', select_own=' || COALESCE(p.ok_sel::text, 'false')
                 || ', insert_own=' || COALESCE(p.ok_ins::text, 'false')
                 || ', update_own=' || COALESCE(p.ok_upd::text, 'false')
                 || ', delete_own=' || COALESCE(p.ok_del::text, 'false')
        END::text AS actual_value,
        'total=4, select/insert/update/delete_own = true (PERMISSIVE, TO authenticated)'::text AS expected_value,
        CASE
            WHEN to_regclass('public.notes') IS NULL THEN 'Table public.notes missing'
            WHEN p.total_policies = 4 AND p.ok_sel IS TRUE AND p.ok_ins IS TRUE
             AND p.ok_upd IS TRUE AND p.ok_del IS TRUE
                THEN 'Policy set matches source structurally. Confirm in Query 1B that insert/update validate step_id ownership.'
            ELSE 'Policy missing, extra policy present, or name/command/mode/role differs from source'
        END::text AS diagnostic_details
    FROM (SELECT 1) AS dummy
    LEFT JOIN (
        SELECT
            COUNT(*)::int AS total_policies,
            bool_or(polname = 'notes_select_own' AND polcmd = 'r' AND polpermissive AND roles = ARRAY['authenticated']::text[]) AS ok_sel,
            bool_or(polname = 'notes_insert_own' AND polcmd = 'a' AND polpermissive AND roles = ARRAY['authenticated']::text[]) AS ok_ins,
            bool_or(polname = 'notes_update_own' AND polcmd = 'w' AND polpermissive AND roles = ARRAY['authenticated']::text[]) AS ok_upd,
            bool_or(polname = 'notes_delete_own' AND polcmd = 'd' AND polpermissive AND roles = ARRAY['authenticated']::text[]) AS ok_del
        FROM pol
        WHERE polrelid = to_regclass('public.notes')
    ) p ON true
),

-- ----------------------------------------------------------------------------
-- S16: supabase_migrations.schema_migrations exists (contents -> Query 1C)
-- ----------------------------------------------------------------------------
s16_check AS (
    SELECT
        'S16'::text AS check_id,
        'supabase_migrations.schema_migrations (existence)'::text AS object_name,
        CASE
            WHEN to_regclass('supabase_migrations.schema_migrations') IS NOT NULL THEN 'INCONCLUSIVE'
            ELSE 'FAIL'
        END::text AS status,
        CASE
            WHEN to_regclass('supabase_migrations.schema_migrations') IS NOT NULL THEN 'table exists'
            ELSE 'table missing'
        END::text AS actual_value,
        'table exists (then run Query 1C)'::text AS expected_value,
        CASE
            WHEN to_regclass('supabase_migrations.schema_migrations') IS NOT NULL
                THEN 'History table exists. Run Query 1C. A recorded version does not prove schema or data correctness.'
            ELSE 'History table not found. Do not run Query 1C.'
        END::text AS diagnostic_details
    FROM (SELECT 1) AS dummy
)

SELECT * FROM s01_check
UNION ALL SELECT * FROM s02_check
UNION ALL SELECT * FROM s03_check
UNION ALL SELECT * FROM s04_check
UNION ALL SELECT * FROM s05_check
UNION ALL SELECT * FROM s06_check
UNION ALL SELECT * FROM s07_check
UNION ALL SELECT * FROM s08_check
UNION ALL SELECT * FROM s09_check
UNION ALL SELECT * FROM s10_check
UNION ALL SELECT * FROM s11_check
UNION ALL SELECT * FROM s12_check
UNION ALL SELECT * FROM s13_check
UNION ALL SELECT * FROM s14_check
UNION ALL SELECT * FROM s15_check
UNION ALL SELECT * FROM s16_check
ORDER BY check_id;
