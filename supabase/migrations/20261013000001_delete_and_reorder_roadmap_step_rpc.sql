-- ChiroMemo — RPC function for atomic Step deletion with reordering
--
-- This migration is part of Phase 5 (Learning Roadmaps).
-- It is NOT applied to any database here; it is a draft file for manual review.
--
-- Depends on:
--   supabase/migrations/20260930000000_init_schema_and_rls.sql
--   supabase/migrations/20261002000000_learning_goals_relationships_and_priority.sql
--   supabase/migrations/20261013000000_reorder_roadmap_steps_rpc.sql (create & reorder RPCs)
--
-- Function:
--   - delete_and_reorder_roadmap_step(p_roadmap_id text, p_step_id text) RETURNS void
--
-- Uses SECURITY INVOKER, ownership check via auth.uid(), FOR UPDATE lock on parent roadmap,
-- and two-phase update to preserve unique constraint on (roadmap_id, "order").

-- ===========================================================================
-- delete_and_reorder_roadmap_step
-- ===========================================================================
CREATE OR REPLACE FUNCTION public.delete_and_reorder_roadmap_step(
    p_roadmap_id text,
    p_step_id text
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
DECLARE
    v_step_record RECORD;
    v_step_ids text[];
    v_step_count integer;
    v_updated_count integer;
    i integer;
BEGIN
    -- Acquire row lock on parent roadmap to serialize with create/reorder
    -- Consistent lock order: roadmap first, then steps
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

    -- Verify target step exists and belongs to this roadmap
    SELECT 1 INTO v_step_record
    FROM public.roadmap_steps
    WHERE id = p_step_id
      AND roadmap_id = p_roadmap_id
    LIMIT 1;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Step not found in roadmap'
            USING ERRCODE = 'P0001';
    END IF;

    -- Delete the target step
    DELETE FROM public.roadmap_steps
    WHERE id = p_step_id
      AND roadmap_id = p_roadmap_id;

    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    IF v_updated_count <> 1 THEN
        RAISE EXCEPTION 'Failed to delete step (rows affected: %)', v_updated_count
            USING ERRCODE = 'P0001';
    END IF;

    -- Get remaining steps ordered by their current order
    SELECT array_agg(id ORDER BY "order" ASC)
    INTO v_step_ids
    FROM public.roadmap_steps
    WHERE roadmap_id = p_roadmap_id;

    -- If no steps remain, we're done
    IF v_step_ids IS NULL OR cardinality(v_step_ids) = 0 THEN
        RETURN;
    END IF;

    v_step_count := cardinality(v_step_ids);

    -- ============================================================
    -- PHASE 1: Move all remaining steps to unique negative temporary orders
    -- ============================================================
    -- This avoids unique constraint violations on (roadmap_id, "order")
    FOR i IN 1 .. v_step_count LOOP
        UPDATE public.roadmap_steps
        SET "order" = -i,
            updated_at = now()
        WHERE id = v_step_ids[i]
          AND roadmap_id = p_roadmap_id;

        GET DIAGNOSTICS v_updated_count = ROW_COUNT;
        IF v_updated_count <> 1 THEN
            RAISE EXCEPTION 'Failed to move step % to temporary order (rows affected: %)', v_step_ids[i], v_updated_count
                USING ERRCODE = 'P0001';
        END IF;
    END LOOP;

    -- ============================================================
    -- PHASE 2: Set final contiguous orders 0 to n-1
    -- ============================================================
    FOR i IN 1 .. v_step_count LOOP
        UPDATE public.roadmap_steps
        SET "order" = (i - 1),
            updated_at = now()
        WHERE id = v_step_ids[i]
          AND roadmap_id = p_roadmap_id;

        GET DIAGNOSTICS v_updated_count = ROW_COUNT;
        IF v_updated_count <> 1 THEN
            RAISE EXCEPTION 'Failed to set final order for step % (rows affected: %)', v_step_ids[i], v_updated_count
                USING ERRCODE = 'P0001';
        END IF;
    END LOOP;

    RETURN;
END;
$$;

-- ===========================================================================
-- Grants
-- ===========================================================================
-- Revoke default PUBLIC and anon execute privilege (security hardening)
REVOKE EXECUTE ON FUNCTION public.delete_and_reorder_roadmap_step(text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.delete_and_reorder_roadmap_step(text, text) FROM anon;

-- authenticated role can execute this function
GRANT EXECUTE ON FUNCTION public.delete_and_reorder_roadmap_step(text, text) TO authenticated;