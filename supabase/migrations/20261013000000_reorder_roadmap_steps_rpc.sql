-- ChiroMemo — RPC functions for Roadmap Steps (create & reorder)
--
-- This migration is part of Phase 5 (Learning Roadmaps).
-- It is NOT applied to any database here; it is a draft file for manual review.
--
-- Depends on:
--   supabase/migrations/20260930000000_init_schema_and_rls.sql
--   supabase/migrations/20261002000000_learning_goals_relationships_and_priority.sql
--
-- Functions:
--   - create_roadmap_step(p_roadmap_id text, p_title text, p_description text, p_order integer DEFAULT NULL) RETURNS jsonb
--   - reorder_roadmap_steps(p_roadmap_id text, p_steps jsonb) RETURNS void
--
-- Both use SECURITY INVOKER, ownership check via auth.uid(), and proper execute grants.
-- Reorder uses two-phase approach in a single transaction to avoid unique constraint violations.
-- Both RPCs acquire FOR UPDATE lock on the parent roadmap to serialize concurrent mutations.

-- ===========================================================================
-- create_roadmap_step
-- ===========================================================================
CREATE OR REPLACE FUNCTION public.create_roadmap_step(
    p_roadmap_id text,
    p_title text,
    p_description text,
    p_order integer DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_step public.roadmap_steps%ROWTYPE;
    v_max_order integer;
    v_result jsonb;
BEGIN
    -- Acquire row lock on parent roadmap to serialize concurrent create/reorder
    -- This prevents race conditions between create_roadmap_step and reorder_roadmap_steps
    -- on the same roadmap. Lock is held until transaction commits/rollbacks.
    IF NOT EXISTS (
        SELECT 1
        FROM public.roadmaps
        WHERE id = p_roadmap_id
          AND user_id = auth.uid()
        FOR UPDATE
    ) THEN
        RAISE EXCEPTION 'Roadmap not found or access denied'
            USING ERRCODE = 'P0001';
    END IF;

    -- Validate title
    IF p_title IS NULL OR trim(p_title) = '' THEN
        RAISE EXCEPTION 'Title cannot be empty'
            USING ERRCODE = 'P0001';
    END IF;

    -- Validate order bounds (PostgreSQL integer range)
    IF p_order IS NOT NULL AND (p_order < -2147483648 OR p_order > 2147483647) THEN
        RAISE EXCEPTION 'Order value out of integer range'
            USING ERRCODE = 'P0001';
    END IF;

    -- If order is NULL or negative, append at the end (matches TypeScript contract)
    IF p_order IS NULL OR p_order < 0 THEN
        SELECT COALESCE(MAX("order"), -1) + 1 INTO v_max_order
        FROM public.roadmap_steps
        WHERE roadmap_id = p_roadmap_id;

        -- Check for integer overflow after computation
        IF v_max_order > 2147483647 THEN
            RAISE EXCEPTION 'Computed order exceeds integer maximum'
                USING ERRCODE = 'P0001';
        END IF;

        p_order := v_max_order;
    END IF;

    -- Final validation: order must be non-negative
    IF p_order < 0 THEN
        RAISE EXCEPTION 'Order must be non-negative'
            USING ERRCODE = 'P0001';
    END IF;

    -- If explicit non-negative order provided, verify the slot is free
    IF p_order IS NOT NULL AND p_order >= 0 THEN
        IF EXISTS (
            SELECT 1
            FROM public.roadmap_steps
            WHERE roadmap_id = p_roadmap_id
              AND "order" = p_order
        ) THEN
            RAISE EXCEPTION 'Order % already occupied in this roadmap', p_order
                USING ERRCODE = 'P0001';
        END IF;
    END IF;

    -- Insert the new step
    INSERT INTO public.roadmap_steps (id, roadmap_id, title, description, "order", status, created_at, updated_at)
    VALUES (
        gen_random_uuid()::text,
        p_roadmap_id,
        trim(p_title),
        p_description,
        p_order,
        'PENDING'::public."RoadmapStepStatus",
        now(),
        now()
    )
    RETURNING * INTO v_step;

    -- Build validated JSONB response matching StepRow type
    v_result := jsonb_build_object(
        'id', v_step.id,
        'roadmap_id', v_step.roadmap_id,
        'title', v_step.title,
        'description', v_step.description,
        'order', v_step."order",
        'status', v_step.status,
        'completed_at', v_step.completed_at,
        'created_at', v_step.created_at,
        'updated_at', v_step.updated_at
    );

    RETURN v_result;
END;
$$;

-- ===========================================================================
-- reorder_roadmap_steps
-- ===========================================================================
CREATE OR REPLACE FUNCTION public.reorder_roadmap_steps(
    p_roadmap_id text,
    p_steps jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_step_record RECORD;
    v_input_step jsonb;
    v_db_step_count integer;
    v_input_step_count integer;
    v_updated_count integer;
    v_seen_orders jsonb := '[]'::jsonb;
    v_seen_ids jsonb := '[]'::jsonb;
    v_temp_order integer;
    i integer;
    v_step_id text;
    v_new_order integer;
    v_orders_array integer[];
BEGIN
    -- Acquire row lock on parent roadmap to serialize concurrent create/reorder
    -- Consistent lock order (roadmap first, then steps) prevents deadlocks.
    -- This protects against:
    --   - Concurrent reorder_roadmap_steps calls on same roadmap
    --   - Concurrent create_roadmap_step on same roadmap
    --   - Concurrent updateRoadmapStep with order change on same roadmap
    -- Note: This does NOT protect against direct table writes bypassing these RPCs.
    IF NOT EXISTS (
        SELECT 1
        FROM public.roadmaps
        WHERE id = p_roadmap_id
          AND user_id = auth.uid()
        FOR UPDATE
    ) THEN
        RAISE EXCEPTION 'Roadmap not found or access denied'
            USING ERRCODE = 'P0001';
    END IF;

    -- Validate input is a JSON array
    IF p_steps IS NULL OR jsonb_typeof(p_steps) <> 'array' THEN
        RAISE EXCEPTION 'p_steps must be a JSON array'
            USING ERRCODE = 'P0001';
    END IF;

    v_input_step_count := jsonb_array_length(p_steps);

    -- Empty array is valid (no-op)
    IF v_input_step_count = 0 THEN
        RETURN;
    END IF;

    -- Validate each element and check for duplicates
    FOR i IN 0 .. v_input_step_count - 1 LOOP
        v_input_step := p_steps->i;

        -- Must be an object
        IF jsonb_typeof(v_input_step) <> 'object' THEN
            RAISE EXCEPTION 'Each step must be an object at index %', i
                USING ERRCODE = 'P0001';
        END IF;

        -- Extract id (required)
        v_step_id := v_input_step->>'id';
        IF v_step_id IS NULL OR trim(v_step_id) = '' THEN
            RAISE EXCEPTION 'Step at index % missing or empty id', i
                USING ERRCODE = 'P0001';
        END IF;

        -- Check duplicate id in input
        IF v_seen_ids @> jsonb_build_array(v_step_id) THEN
            RAISE EXCEPTION 'Duplicate step id in input: %', v_step_id
                USING ERRCODE = 'P0001';
        END IF;
        v_seen_ids := v_seen_ids || jsonb_build_array(v_step_id);

        -- Extract order (required, must be integer)
        IF NOT (v_input_step ? 'order') THEN
            RAISE EXCEPTION 'Step % missing order', v_step_id
                USING ERRCODE = 'P0001';
        END IF;

        -- Parse order with controlled error handling
        BEGIN
            v_new_order := (v_input_step->>'order')::integer;
        EXCEPTION WHEN sqlstate '22P02' THEN
            RAISE EXCEPTION 'Order for step % must be an integer', v_step_id
                USING ERRCODE = 'P0001';
        END;

        -- Validate order bounds: must be within [0, v_input_step_count - 1]
        IF v_new_order < 0 OR v_new_order >= v_input_step_count THEN
            RAISE EXCEPTION 'Order for step % out of valid range (0..%)', v_step_id, v_input_step_count - 1
                USING ERRCODE = 'P0001';
        END IF;

        -- Check duplicate order in input
        IF v_seen_orders @> jsonb_build_array(v_new_order) THEN
            RAISE EXCEPTION 'Duplicate order in input: %', v_new_order
                USING ERRCODE = 'P0001';
        END IF;
        v_seen_orders := v_seen_orders || jsonb_build_array(v_new_order);
    END LOOP;

    -- Verify all steps exist and belong to this roadmap
    FOR i IN 0 .. v_input_step_count - 1 LOOP
        v_step_id := (p_steps->i->>'id')::text;

        SELECT 1 INTO v_step_record
        FROM public.roadmap_steps
        WHERE id = v_step_id
          AND roadmap_id = p_roadmap_id
        LIMIT 1;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Step % not found in roadmap %', v_step_id, p_roadmap_id
                USING ERRCODE = 'P0001';
        END IF;
    END LOOP;

    -- Verify no missing steps (input must contain ALL steps of this roadmap)
    SELECT COUNT(*) INTO v_db_step_count
    FROM public.roadmap_steps
    WHERE roadmap_id = p_roadmap_id;

    IF v_db_step_count <> v_input_step_count THEN
        RAISE EXCEPTION 'Input must contain all % steps of the roadmap (received %)', v_db_step_count, v_input_step_count
            USING ERRCODE = 'P0001';
    END IF;

    -- Enforce contiguous final orders 0..n-1 (matching reorder contract)
    -- Extract orders from input, sort, and verify they form [0,1,2,...,n-1]
    SELECT array_agg((elem->>'order')::integer ORDER BY (elem->>'order')::integer)
    FROM jsonb_array_elements(p_steps) AS elem
    INTO v_orders_array;

    IF v_orders_array IS NOT NULL THEN
        FOR i IN 1 .. v_input_step_count LOOP
            IF v_orders_array[i] <> (i - 1) THEN
                RAISE EXCEPTION 'Final orders must be contiguous 0..% (found % at position %)', v_input_step_count - 1, v_orders_array[i], (i - 1)
                    USING ERRCODE = 'P0001';
            END IF;
        END LOOP;
    END IF;

    -- ============================================================
    -- PHASE 1: Move all steps to unique negative temporary orders
    -- ============================================================
    -- Use a sequence of negative numbers that cannot collide with valid orders (>= 0)
    v_temp_order := -1;

    FOR i IN 0 .. v_input_step_count - 1 LOOP
        v_step_id := (p_steps->i->>'id')::text;

        UPDATE public.roadmap_steps
        SET "order" = v_temp_order,
            updated_at = now()
        WHERE id = v_step_id
          AND roadmap_id = p_roadmap_id;

        GET DIAGNOSTICS v_updated_count = ROW_COUNT;
        IF v_updated_count <> 1 THEN
            RAISE EXCEPTION 'Failed to move step % to temporary order (rows affected: %)', v_step_id, v_updated_count
                USING ERRCODE = 'P0001';
        END IF;

        v_temp_order := v_temp_order - 1;

        -- Defensive: prevent integer underflow (practically impossible)
        IF v_temp_order < -2147483648 THEN
            RAISE EXCEPTION 'Temporary order underflow (too many steps)'
                USING ERRCODE = 'P0001';
        END IF;
    END LOOP;

    -- ============================================================
    -- PHASE 2: Set final orders from 0 to n-1
    -- ============================================================
    FOR i IN 0 .. v_input_step_count - 1 LOOP
        v_step_id := (p_steps->i->>'id')::text;
        v_new_order := (p_steps->i->>'order')::integer;

        UPDATE public.roadmap_steps
        SET "order" = v_new_order,
            updated_at = now()
        WHERE id = v_step_id
          AND roadmap_id = p_roadmap_id;

        GET DIAGNOSTICS v_updated_count = ROW_COUNT;
        IF v_updated_count <> 1 THEN
            RAISE EXCEPTION 'Failed to set final order for step % (rows affected: %)', v_step_id, v_updated_count
                USING ERRCODE = 'P0001';
        END IF;
    END LOOP;

    -- All done successfully
    RETURN;
END;
$$;

-- ===========================================================================
-- Grants
-- ===========================================================================
-- Revoke default PUBLIC and anon execute privilege (security hardening)
REVOKE EXECUTE ON FUNCTION public.create_roadmap_step(text, text, text, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.create_roadmap_step(text, text, text, integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.reorder_roadmap_steps(text, jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.reorder_roadmap_steps(text, jsonb) FROM anon;

-- authenticated role can execute both functions
GRANT EXECUTE ON FUNCTION public.create_roadmap_step(text, text, text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reorder_roadmap_steps(text, jsonb) TO authenticated;

-- No SECURITY DEFINER helper exists; no additional grants needed.