--! ==================================================================
-- ⚠️  DANGER — NE PAS APPLIQUER SANS APPROBATION
-- Ce script révoque des privilèges sur des tables applicatives (anonymous
-- / authenticated / PUBLIC). L'exécution a provoqué des interruptions en
-- production lors de la campagne de révocations (voir le post-mortem).
-- Avant toute ré-exécution : ouvrir un ticket, joindre une justification,
-- et coordonner la remise des GRANTs (plan de rollback). Voir
-- doc/INCIDENT_POSTMORTEM_RLS_GRANTS_2025-10-27.md
--! ==================================================================

-- Migration: Revoke final exposed objects detected by CI audit
-- Date: 2025-10-25
-- Purpose: Remove grants to PUBLIC/authenticated on remaining exposed objects
-- Safe: Idempotent - uses DO blocks with exception handling

-- 1. Revoke PUBLIC grant on information_schema view (system object - needs safe handling)
DO $$
BEGIN
  -- Attempt to revoke PUBLIC on information_schema.administrable_role_authorizations
  -- This is a system view, so we handle potential errors gracefully
  BEGIN
    EXECUTE 'REVOKE ALL ON TABLE information_schema.administrable_role_authorizations FROM PUBLIC';
    RAISE NOTICE 'Revoked PUBLIC on information_schema.administrable_role_authorizations';
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'Insufficient privilege to revoke information_schema.administrable_role_authorizations - skipping';
    WHEN undefined_table THEN
      RAISE NOTICE 'Object information_schema.administrable_role_authorizations does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke information_schema.administrable_role_authorizations: % - skipping', SQLERRM;
  END;
END;
$$;

-- 2. Revoke authenticated grants on public.content_versions
DO $$
BEGIN
  BEGIN
    REVOKE ALL ON TABLE public.content_versions FROM authenticated;
    RAISE NOTICE 'Revoked ALL on public.content_versions from authenticated';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'Table public.content_versions does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.content_versions: % - skipping', SQLERRM;
  END;
END;
$$;

-- 3. Revoke authenticated grants on public.content_versions_detailed
DO $$
BEGIN
  BEGIN
    REVOKE ALL ON TABLE public.content_versions_detailed FROM authenticated;
    RAISE NOTICE 'Revoked ALL on public.content_versions_detailed from authenticated';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'Table public.content_versions_detailed does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.content_versions_detailed: % - skipping', SQLERRM;
  END;
END;
$$;

-- 4. Revoke authenticated grants on public.evenements
DO $$
BEGIN
  BEGIN
    REVOKE ALL ON TABLE public.evenements FROM authenticated;
    RAISE NOTICE 'Revoked ALL on public.evenements from authenticated';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'Table public.evenements does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.evenements: % - skipping', SQLERRM;
  END;
END;
$$;

-- 5. Revoke authenticated grants on public.home_about_content
DO $$
BEGIN
  BEGIN
    REVOKE ALL ON TABLE public.home_about_content FROM authenticated;
    RAISE NOTICE 'Revoked ALL on public.home_about_content from authenticated';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'Table public.home_about_content does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.home_about_content: % - skipping', SQLERRM;
  END;
END;
$$;

-- Note: If these tables require authenticated users to have SELECT access,
-- you should explicitly re-grant SELECT after applying this migration:
-- GRANT SELECT ON TABLE public.content_versions TO authenticated;
-- etc.

-- Verify: After applying, run supabase/scripts/audit_grants.sql to confirm no exposed objects remain.
