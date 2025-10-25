-- Migration: Revoke privileges on storage.buckets_analytics and persistent search functions (Round 11)
-- Date: 2025-10-26
-- Purpose: Complete cleanup of storage analytics table and search functions that persist
-- Safe: Idempotent - uses DO blocks with exception handling

-- =====================================================================
-- ROUND 11: Storage Analytics Table + Persistent Search Functions
-- =====================================================================

-- 1. storage.buckets_analytics (authenticated, anon) - Storage analytics system table
DO $$
BEGIN
  BEGIN
    REVOKE ALL ON TABLE storage.buckets_analytics FROM PUBLIC;
    RAISE NOTICE 'Revoked ALL on storage.buckets_analytics from PUBLIC';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'Table storage.buckets_analytics does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke storage.buckets_analytics from PUBLIC: % - skipping', SQLERRM;
  END;
END;
$$;

DO $$
BEGIN
  BEGIN
    REVOKE ALL ON TABLE storage.buckets_analytics FROM authenticated;
    RAISE NOTICE 'Revoked ALL on storage.buckets_analytics from authenticated';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'Table storage.buckets_analytics does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke storage.buckets_analytics from authenticated: % - skipping', SQLERRM;
  END;
END;
$$;

DO $$
BEGIN
  BEGIN
    REVOKE ALL ON TABLE storage.buckets_analytics FROM anon;
    RAISE NOTICE 'Revoked ALL on storage.buckets_analytics from anon';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'Table storage.buckets_analytics does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke storage.buckets_analytics from anon: % - skipping', SQLERRM;
  END;
END;
$$;

-- 2. public.show_limit() - PERSISTENT (still has PUBLIC grant after Round 10)
-- Note: This function may be re-created by extensions or have default PUBLIC grants
DO $$
BEGIN
  BEGIN
    REVOKE ALL PRIVILEGES ON FUNCTION public.show_limit() FROM PUBLIC;
    RAISE NOTICE 'Revoked ALL PRIVILEGES on public.show_limit from PUBLIC';
  EXCEPTION
    WHEN undefined_function THEN
      RAISE NOTICE 'Function public.show_limit does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.show_limit: % - skipping', SQLERRM;
  END;
END;
$$;

-- 3. public.show_trgm(text) - STILL PERSISTENT (PUBLIC, anon, authenticated remain)
-- Comprehensive cleanup with ALL PRIVILEGES syntax
DO $$
BEGIN
  BEGIN
    REVOKE ALL PRIVILEGES ON FUNCTION public.show_trgm(text) FROM PUBLIC;
    RAISE NOTICE 'Revoked ALL PRIVILEGES on public.show_trgm from PUBLIC';
  EXCEPTION
    WHEN undefined_function THEN
      RAISE NOTICE 'Function public.show_trgm does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.show_trgm from PUBLIC: % - skipping', SQLERRM;
  END;
END;
$$;

DO $$
BEGIN
  BEGIN
    REVOKE ALL PRIVILEGES ON FUNCTION public.show_trgm(text) FROM anon;
    RAISE NOTICE 'Revoked ALL PRIVILEGES on public.show_trgm from anon';
  EXCEPTION
    WHEN undefined_function THEN
      RAISE NOTICE 'Function public.show_trgm does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.show_trgm from anon: % - skipping', SQLERRM;
  END;
END;
$$;

DO $$
BEGIN
  BEGIN
    REVOKE ALL PRIVILEGES ON FUNCTION public.show_trgm(text) FROM authenticated;
    RAISE NOTICE 'Revoked ALL PRIVILEGES on public.show_trgm from authenticated';
  EXCEPTION
    WHEN undefined_function THEN
      RAISE NOTICE 'Function public.show_trgm does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.show_trgm from authenticated: % - skipping', SQLERRM;
  END;
END;
$$;

-- Note: Round 11 addresses persistent grants that survived previous rounds:
--
-- 1. storage.buckets_analytics:
--    - New analytics table discovered in storage schema
--    - Has grants to both authenticated (arwdDxtm) and anon (arwdDxtm)
--    - Full privileges including write/delete - very dangerous!
--    - Should be whitelisted like storage.buckets (system table)
--
-- 2. show_limit() and show_trgm(text):
--    - These functions PERSIST even after Round 10 revokes
--    - Possible causes:
--      a) Extension default grants (pg_trgm creates these with PUBLIC by default)
--      b) Migration or schema recreation re-added the grants
--      c) Using REVOKE EXECUTE instead of REVOKE ALL PRIVILEGES
--    - Solution: Use REVOKE ALL PRIVILEGES syntax for completeness
--
-- These functions may be re-created by:
-- - pg_trgm extension installation/upgrade
-- - Database migrations that recreate functions
-- - Schema dumps/restores
--
-- Strategy: Add to audit whitelist if they continue to persist after this round
--
-- Verify: After applying, run supabase/scripts/audit_grants_filtered.sql to confirm.
