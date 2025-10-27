
--! ==================================================================
-- ⚠️  AVERTISSEMENT — REVUES REQUISES
-- Ce fichier modifie des objets de stockage système et des fonctions de
-- recherche. Avant exécution, vérifier les conséquences pour les APIs de
-- recherche et le stockage. Voir doc/INCIDENT_POSTMORTEM_RLS_GRANTS_2025-10-27.md
--! ==================================================================

-- Migration: Revoke privileges on storage.buckets and search utility functions (Round 10)
-- Date: 2025-10-26
-- Purpose: Remove excessive grants from storage.buckets and public search functions
-- Safe: Idempotent - uses DO blocks with exception handling

-- =====================================================================
-- ROUND 10: Storage System Table + Search Utility Functions
-- =====================================================================

-- 1. storage.buckets (authenticated) - Supabase Storage system table
DO $$
BEGIN
  BEGIN
    REVOKE ALL ON TABLE storage.buckets FROM authenticated;
    RAISE NOTICE 'Revoked ALL on storage.buckets from authenticated';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'Table storage.buckets does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke storage.buckets: % - skipping', SQLERRM;
  END;
END;
$$;

-- 2. public.show_limit() (PUBLIC) - Search limit utility function
DO $$
BEGIN
  BEGIN
    REVOKE EXECUTE ON FUNCTION public.show_limit() FROM PUBLIC;
    RAISE NOTICE 'Revoked EXECUTE on public.show_limit from PUBLIC';
  EXCEPTION
    WHEN undefined_function THEN
      RAISE NOTICE 'Function public.show_limit does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.show_limit: % - skipping', SQLERRM;
  END;
END;
$$;

-- 3. public.show_trgm(text) - COMPLETE CLEANUP (PUBLIC, anon, authenticated)
-- Note: This was partially addressed in Round 9, but we need to revoke from ALL roles
DO $$
BEGIN
  BEGIN
    REVOKE EXECUTE ON FUNCTION public.show_trgm(text) FROM PUBLIC;
    RAISE NOTICE 'Revoked EXECUTE on public.show_trgm from PUBLIC';
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
    REVOKE EXECUTE ON FUNCTION public.show_trgm(text) FROM anon;
    RAISE NOTICE 'Revoked EXECUTE on public.show_trgm from anon';
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
    REVOKE EXECUTE ON FUNCTION public.show_trgm(text) FROM authenticated;
    RAISE NOTICE 'Revoked EXECUTE on public.show_trgm from authenticated';
  EXCEPTION
    WHEN undefined_function THEN
      RAISE NOTICE 'Function public.show_trgm does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.show_trgm from authenticated: % - skipping', SQLERRM;
  END;
END;
$$;

-- Note: Round 10 addresses:
--
-- 1. storage.buckets (Supabase Storage system table):
--    - Should NOT have direct table-level grants to authenticated
--    - Access controlled via Supabase Storage API and RLS policies on storage.objects
--    - Similar to realtime.* tables - system managed, not for direct querying
--
-- 2. show_limit() (pg_trgm extension function wrapper):
--    - Custom wrapper around pg_trgm functionality
--    - Should be called server-side only (Server Actions, API routes)
--    - Not needed for client-side execution
--
-- 3. show_trgm(text) (COMPLETE CLEANUP):
--    - Already partially revoked in Round 9 (PUBLIC only)
--    - Now revoking from anon and authenticated as well
--    - Trigram similarity function should be server-side only
--    - Used in search algorithms, not for direct client access
--
-- Security Rationale:
-- - Storage access should go through Supabase Storage API (storage.objects RLS)
-- - Search functions are utility functions for server-side queries
-- - Prevents potential abuse of search/similarity functions
-- - Follows principle of least privilege
--
-- Verify: After applying, run supabase/scripts/audit_grants_filtered.sql to confirm.
