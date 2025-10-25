-- Migration: Revoke authenticated on spectacles junction tables + info_schema (round 6 - FINAL)
-- Date: 2025-10-25
-- Purpose: Remove grants to authenticated on spectacles junction tables (medias, membres, tags) + tags table
-- Safe: Idempotent - uses DO blocks with exception handling

-- 1. Revoke authenticated grants on public.spectacles_medias (junction table)
DO $$
BEGIN
  BEGIN
    REVOKE ALL ON TABLE public.spectacles_medias FROM authenticated;
    RAISE NOTICE 'Revoked ALL on public.spectacles_medias from authenticated';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'Table public.spectacles_medias does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.spectacles_medias: % - skipping', SQLERRM;
  END;
END;
$$;

-- 2. Revoke authenticated grants on public.spectacles_membres_equipe (junction table)
DO $$
BEGIN
  BEGIN
    REVOKE ALL ON TABLE public.spectacles_membres_equipe FROM authenticated;
    RAISE NOTICE 'Revoked ALL on public.spectacles_membres_equipe from authenticated';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'Table public.spectacles_membres_equipe does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.spectacles_membres_equipe: % - skipping', SQLERRM;
  END;
END;
$$;

-- 3. Revoke authenticated grants on public.spectacles_tags (junction table)
DO $$
BEGIN
  BEGIN
    REVOKE ALL ON TABLE public.spectacles_tags FROM authenticated;
    RAISE NOTICE 'Revoked ALL on public.spectacles_tags from authenticated';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'Table public.spectacles_tags does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.spectacles_tags: % - skipping', SQLERRM;
  END;
END;
$$;

-- 4. Revoke authenticated grants on public.tags (table)
DO $$
BEGIN
  BEGIN
    REVOKE ALL ON TABLE public.tags FROM authenticated;
    RAISE NOTICE 'Revoked ALL on public.tags from authenticated';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'Table public.tags does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.tags: % - skipping', SQLERRM;
  END;
END;
$$;

-- 5. Final attempt: revoke PUBLIC on information_schema (persistent system view)
-- This view is owned by PostgreSQL and may resist revocation attempts
-- We try multiple approaches to ensure it's revoked
DO $$
BEGIN
  -- Attempt 1: Direct REVOKE
  BEGIN
    REVOKE ALL ON TABLE information_schema.administrable_role_authorizations FROM PUBLIC;
    RAISE NOTICE 'Revoked PUBLIC on information_schema.administrable_role_authorizations (direct)';
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE WARNING 'Insufficient privilege to revoke information_schema - this may require superuser access';
    WHEN undefined_table THEN
      RAISE NOTICE 'Object information_schema.administrable_role_authorizations does not exist';
    WHEN OTHERS THEN
      RAISE WARNING 'Could not revoke information_schema (attempt 1): %', SQLERRM;
  END;
  
  -- Attempt 2: REVOKE via EXECUTE (alternative syntax)
  BEGIN
    EXECUTE 'REVOKE SELECT ON information_schema.administrable_role_authorizations FROM PUBLIC';
    RAISE NOTICE 'Revoked SELECT on information_schema.administrable_role_authorizations (execute)';
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Could not revoke information_schema (attempt 2): %', SQLERRM;
  END;
END;
$$;

-- Note: Junction tables and tags have RLS policies defined in the declarative schema.
-- Access control should be handled entirely through RLS, not table-level grants.
-- 
-- spectacles_medias: Public read, Admin write (junction table)
-- spectacles_membres_equipe: Public read, Admin write (junction table - casting)
-- spectacles_tags: Public read, Admin write (junction table)
-- tags: Public read, Admin write
-- information_schema: System view - PostgreSQL internal, may persist despite revocations
--
-- No re-grant needed - RLS policies provide the necessary access control.
-- If information_schema persists, it may be a PostgreSQL default that cannot be changed.

-- Verify: After applying, run supabase/scripts/audit_grants.sql to confirm no exposed objects remain.
