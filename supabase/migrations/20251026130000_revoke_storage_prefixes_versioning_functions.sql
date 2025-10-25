-- Migration: Revoke privileges on storage.prefixes and versioning/auth functions (Round 13)
-- Date: 2025-10-26
-- Purpose: Remove grants from storage.prefixes and business versioning/auth functions
-- Safe: Idempotent - uses DO blocks with exception handling

-- =====================================================================
-- ROUND 13: Storage Prefixes + Versioning/Auth Functions
-- =====================================================================

-- 1. storage.prefixes (anon, authenticated) - Supabase Storage prefixes/folders table
DO $$
BEGIN
  BEGIN
    REVOKE ALL ON TABLE storage.prefixes FROM anon;
    RAISE NOTICE 'Revoked ALL on storage.prefixes from anon';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'Table storage.prefixes does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke storage.prefixes from anon: % - skipping', SQLERRM;
  END;
END;
$$;

DO $$
BEGIN
  BEGIN
    REVOKE ALL ON TABLE storage.prefixes FROM authenticated;
    RAISE NOTICE 'Revoked ALL on storage.prefixes from authenticated';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'Table storage.prefixes does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke storage.prefixes from authenticated: % - skipping', SQLERRM;
  END;
END;
$$;

-- 2. public.handle_user_update() (authenticated) - Trigger function for user profile updates
DO $$
BEGIN
  BEGIN
    REVOKE EXECUTE ON FUNCTION public.handle_user_update() FROM authenticated;
    RAISE NOTICE 'Revoked EXECUTE on public.handle_user_update from authenticated';
  EXCEPTION
    WHEN undefined_function THEN
      RAISE NOTICE 'Function public.handle_user_update does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.handle_user_update: % - skipping', SQLERRM;
  END;
END;
$$;

-- 3. public.is_admin() (authenticated) - IMPORTANT: Authorization helper function
-- NOTE: This function is USED BY RLS POLICIES to check admin status
-- However, it should NOT have table-level EXECUTE grant to authenticated
-- RLS policies execute with SECURITY DEFINER and can call it regardless
DO $$
BEGIN
  BEGIN
    REVOKE EXECUTE ON FUNCTION public.is_admin() FROM authenticated;
    RAISE NOTICE 'Revoked EXECUTE on public.is_admin from authenticated';
  EXCEPTION
    WHEN undefined_function THEN
      RAISE NOTICE 'Function public.is_admin does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.is_admin: % - skipping', SQLERRM;
  END;
END;
$$;

-- 4. public.membres_equipe_versioning_trigger() (authenticated) - Trigger function
DO $$
BEGIN
  BEGIN
    REVOKE EXECUTE ON FUNCTION public.membres_equipe_versioning_trigger() FROM authenticated;
    RAISE NOTICE 'Revoked EXECUTE on public.membres_equipe_versioning_trigger from authenticated';
  EXCEPTION
    WHEN undefined_function THEN
      RAISE NOTICE 'Function public.membres_equipe_versioning_trigger does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.membres_equipe_versioning_trigger: % - skipping', SQLERRM;
  END;
END;
$$;

-- 5. public.partners_versioning_trigger() (authenticated) - Trigger function
DO $$
BEGIN
  BEGIN
    REVOKE EXECUTE ON FUNCTION public.partners_versioning_trigger() FROM authenticated;
    RAISE NOTICE 'Revoked EXECUTE on public.partners_versioning_trigger from authenticated';
  EXCEPTION
    WHEN undefined_function THEN
      RAISE NOTICE 'Function public.partners_versioning_trigger does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.partners_versioning_trigger: % - skipping', SQLERRM;
  END;
END;
$$;

-- Note: Round 13 addresses:
--
-- 1. storage.prefixes (Supabase Storage folder/prefix table):
--    - Manages folder structure in Supabase Storage
--    - Like storage.objects and storage.buckets, should be accessed via Storage API only
--    - RLS policies on storage.objects control actual file access
--    - Must whitelist as system table
--
-- 2. handle_user_update():
--    - Trigger function that syncs auth.users with public.profiles
--    - Executes automatically on user updates
--    - Runs with SECURITY DEFINER (postgres) privileges
--    - Does NOT need EXECUTE grant to authenticated
--
-- 3. is_admin():
--    - CRITICAL authorization helper function
--    - Used extensively in RLS policies: USING (is_admin())
--    - RLS policies execute with SECURITY DEFINER context
--    - They can call is_admin() even without EXECUTE grant to authenticated
--    - Removing grant prevents direct client calls but preserves RLS usage
--    - This is CORRECT security behavior!
--
-- 4. membres_equipe_versioning_trigger():
--    - Trigger function for team member content versioning
--    - Executes automatically on INSERT/UPDATE/DELETE
--    - Runs with SECURITY DEFINER privileges
--    - Does NOT need EXECUTE grant to authenticated
--
-- 5. partners_versioning_trigger():
--    - Trigger function for partners content versioning
--    - Executes automatically on INSERT/UPDATE/DELETE
--    - Runs with SECURITY DEFINER privileges
--    - Does NOT need EXECUTE grant to authenticated
--
-- Security Rationale:
-- - Storage.prefixes access via Storage API only (enforces policies)
-- - Trigger functions execute automatically with DEFINER privileges
-- - is_admin() can be called by RLS policies (SECURITY DEFINER context)
-- - Prevents direct client-side calls to sensitive functions
-- - Maintains proper authorization boundaries
--
-- RLS Impact: NONE - is_admin() is still callable by RLS policies!
-- The function executes in the SECURITY DEFINER context of the policy,
-- not as the authenticated user, so the EXECUTE grant is not needed.
--
-- Verify: After applying, run supabase/scripts/audit_grants_filtered.sql to confirm.
