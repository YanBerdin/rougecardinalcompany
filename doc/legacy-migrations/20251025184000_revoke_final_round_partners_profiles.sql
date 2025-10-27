--! ==================================================================
-- ⚠️  DANGER — NE PAS APPLIQUER SANS APPROBATION
-- Ce script révoque des privilèges sur des tables applicatives (profiles,
-- partners). Il fait partie de la campagne de révocations ayant causé
-- une interruption en production. Ne pas exécuter sans revue, ticket et
-- plan de rétablissement. Voir doc/INCIDENT_POSTMORTEM_RLS_GRANTS_2025-10-27.md
--! ==================================================================

-- Migration: Revoke authenticated on partners, profiles and their admin views (final round 4)
-- Date: 2025-10-25
-- Purpose: Remove grants to authenticated on partners, profiles tables and admin/tag views
-- Safe: Idempotent - uses DO blocks with exception handling

-- 1. Revoke authenticated grants on public.partners (table)
DO $$
BEGIN
  BEGIN
    REVOKE ALL ON TABLE public.partners FROM authenticated;
    RAISE NOTICE 'Revoked ALL on public.partners from authenticated';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'Table public.partners does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.partners: % - skipping', SQLERRM;
  END;
END;
$$;

-- 2. Revoke authenticated grants on public.partners_admin (view)
DO $$
BEGIN
  BEGIN
    REVOKE ALL ON TABLE public.partners_admin FROM authenticated;
    RAISE NOTICE 'Revoked ALL on public.partners_admin from authenticated';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'View public.partners_admin does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.partners_admin: % - skipping', SQLERRM;
  END;
END;
$$;

-- 3. Revoke authenticated grants on public.popular_tags (view)
DO $$
BEGIN
  BEGIN
    REVOKE ALL ON TABLE public.popular_tags FROM authenticated;
    RAISE NOTICE 'Revoked ALL on public.popular_tags from authenticated';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'View public.popular_tags does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.popular_tags: % - skipping', SQLERRM;
  END;
END;
$$;

-- 4. Revoke authenticated grants on public.profiles (table)
DO $$
BEGIN
  BEGIN
    REVOKE ALL ON TABLE public.profiles FROM authenticated;
    RAISE NOTICE 'Revoked ALL on public.profiles from authenticated';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'Table public.profiles does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.profiles: % - skipping', SQLERRM;
  END;
END;
$$;

-- Note: These tables/views have RLS policies defined in the declarative schema.
-- Access control should be handled entirely through RLS, not table-level grants.
-- 
-- partners: Public read (active partners), admin write
-- partners_admin: Admin-only view with versioning metadata (SECURITY INVOKER)
-- popular_tags: Public read view for tag statistics (SECURITY INVOKER)
-- profiles: Public read (own profile + public profiles), authenticated write (own profile only)
--
-- No re-grant needed - RLS policies provide the necessary access control.

-- Verify: After applying, run supabase/scripts/audit_grants.sql to confirm no exposed objects remain.
