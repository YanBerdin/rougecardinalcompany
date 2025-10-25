-- Migration: Revoke privileges on newly detected objects (Round 8)
-- Date: 2025-10-25
-- Purpose: Remove table-level grants from newsletter subscribers, analytics and extension functions
-- Safe: Idempotent - uses DO blocks with exception handling

-- =====================================================================
-- ROUND 8: Newsletter, Analytics Tables + Extension Functions
-- =====================================================================

-- 1. public.abonnes_newsletter (authenticated)
DO $$
BEGIN
  BEGIN
    REVOKE ALL ON TABLE public.abonnes_newsletter FROM authenticated;
    RAISE NOTICE 'Revoked ALL on public.abonnes_newsletter from authenticated';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'Table public.abonnes_newsletter does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.abonnes_newsletter: % - skipping', SQLERRM;
  END;
END;
$$;

-- 2. public.analytics_events (authenticated)
DO $$
BEGIN
  BEGIN
    REVOKE ALL ON TABLE public.analytics_events FROM authenticated;
    RAISE NOTICE 'Revoked ALL on public.analytics_events from authenticated';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'Table public.analytics_events does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.analytics_events: % - skipping', SQLERRM;
  END;
END;
$$;

-- 3. graphql.comment_directive (PUBLIC, anon, authenticated)
-- Note: This is likely from pg_graphql extension - may need whitelist if system function
DO $$
BEGIN
  BEGIN
    REVOKE EXECUTE ON FUNCTION graphql.comment_directive(text) FROM PUBLIC, anon, authenticated;
    RAISE NOTICE 'Revoked EXECUTE on graphql.comment_directive from PUBLIC, anon, authenticated';
  EXCEPTION
    WHEN undefined_function THEN
      RAISE NOTICE 'Function graphql.comment_directive does not exist - skipping';
    WHEN invalid_schema_name THEN
      RAISE NOTICE 'Schema graphql does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke graphql.comment_directive: % - skipping', SQLERRM;
  END;
END;
$$;

-- 4. graphql.exception (PUBLIC, anon, authenticated)
DO $$
BEGIN
  BEGIN
    REVOKE EXECUTE ON FUNCTION graphql.exception(text) FROM PUBLIC, anon, authenticated;
    RAISE NOTICE 'Revoked EXECUTE on graphql.exception from PUBLIC, anon, authenticated';
  EXCEPTION
    WHEN undefined_function THEN
      RAISE NOTICE 'Function graphql.exception does not exist - skipping';
    WHEN invalid_schema_name THEN
      RAISE NOTICE 'Schema graphql does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke graphql.exception: % - skipping', SQLERRM;
  END;
END;
$$;

-- 5. public.gtrgm_consistent (PUBLIC, anon, authenticated)
-- Note: This is from pg_trgm extension - may be system function
DO $$
BEGIN
  BEGIN
    REVOKE EXECUTE ON FUNCTION public.gtrgm_consistent(internal, text, smallint, oid, internal) FROM PUBLIC, anon, authenticated;
    RAISE NOTICE 'Revoked EXECUTE on public.gtrgm_consistent from PUBLIC, anon, authenticated';
  EXCEPTION
    WHEN undefined_function THEN
      RAISE NOTICE 'Function public.gtrgm_consistent does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.gtrgm_consistent: % - skipping', SQLERRM;
  END;
END;
$$;

-- 6. public.gtrgm_decompress (authenticated)
DO $$
BEGIN
  BEGIN
    REVOKE EXECUTE ON FUNCTION public.gtrgm_decompress(internal) FROM authenticated;
    RAISE NOTICE 'Revoked EXECUTE on public.gtrgm_decompress from authenticated';
  EXCEPTION
    WHEN undefined_function THEN
      RAISE NOTICE 'Function public.gtrgm_decompress does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.gtrgm_decompress: % - skipping', SQLERRM;
  END;
END;
$$;

-- Note: Round 8 addresses:
-- - Newsletter subscribers table (abonnes_newsletter): Should be controlled by RLS policies
-- - Analytics events table (analytics_events): Should be controlled by RLS policies
-- - GraphQL extension functions (graphql.*): May need whitelist if used by Supabase GraphQL API
-- - Trigram extension functions (gtrgm_*): Part of pg_trgm for fuzzy search - may need whitelist
--
-- If these extension functions are required for application functionality, they should be
-- whitelisted in the filtered audit script instead of being revoked.
--
-- Verify: After applying, run supabase/scripts/audit_grants_filtered.sql to confirm.
