--! ==================================================================
-- ⚠️  DANGER — NE PAS APPLIQUER SANS APPROBATION
-- Révocation des privileges sur tables applicatives (seo, spectacles, sitemap).
-- L'exécution de ces migrations fait partie d'une campagne qui a provoqué
-- des erreurs de permission (42501) en production. Ne pas exécuter sans
-- revue d'impact, justification et plan de restauration des GRANTs.
-- Voir doc/INCIDENT_POSTMORTEM_RLS_GRANTS_2025-10-27.md
--! ==================================================================

-- Migration: Revoke authenticated on SEO, spectacles tables (final round 5)
-- Date: 2025-10-25
-- Purpose: Remove grants to authenticated on SEO, sitemap, spectacles and categories tables
-- Safe: Idempotent - uses DO blocks with exception handling

-- 1. Revoke authenticated grants on public.seo_redirects (table)
DO $$
BEGIN
  BEGIN
    REVOKE ALL ON TABLE public.seo_redirects FROM authenticated;
    RAISE NOTICE 'Revoked ALL on public.seo_redirects from authenticated';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'Table public.seo_redirects does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.seo_redirects: % - skipping', SQLERRM;
  END;
END;
$$;

-- 2. Revoke authenticated grants on public.sitemap_entries (table)
DO $$
BEGIN
  BEGIN
    REVOKE ALL ON TABLE public.sitemap_entries FROM authenticated;
    RAISE NOTICE 'Revoked ALL on public.sitemap_entries from authenticated';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'Table public.sitemap_entries does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.sitemap_entries: % - skipping', SQLERRM;
  END;
END;
$$;

-- 3. Revoke authenticated grants on public.spectacles (table)
DO $$
BEGIN
  BEGIN
    REVOKE ALL ON TABLE public.spectacles FROM authenticated;
    RAISE NOTICE 'Revoked ALL on public.spectacles from authenticated';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'Table public.spectacles does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.spectacles: % - skipping', SQLERRM;
  END;
END;
$$;

-- 4. Revoke authenticated grants on public.spectacles_categories (junction table)
DO $$
BEGIN
  BEGIN
    REVOKE ALL ON TABLE public.spectacles_categories FROM authenticated;
    RAISE NOTICE 'Revoked ALL on public.spectacles_categories from authenticated';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'Table public.spectacles_categories does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.spectacles_categories: % - skipping', SQLERRM;
  END;
END;
$$;

-- 5. Re-attempt revoke PUBLIC on information_schema (system view - may have been missed)
DO $$
BEGIN
  BEGIN
    EXECUTE 'REVOKE ALL ON TABLE information_schema.administrable_role_authorizations FROM PUBLIC';
    RAISE NOTICE 'Revoked PUBLIC on information_schema.administrable_role_authorizations';
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'Insufficient privilege to revoke information_schema.administrable_role_authorizations - may require superuser';
    WHEN undefined_table THEN
      RAISE NOTICE 'Object information_schema.administrable_role_authorizations does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke information_schema.administrable_role_authorizations: % - skipping', SQLERRM;
  END;
END;
$$;

-- Note: These tables have RLS policies defined in the declarative schema.
-- Access control should be handled entirely through RLS, not table-level grants.
-- 
-- seo_redirects: Admin-only (SEO management)
-- sitemap_entries: Public read (if indexed), Admin write
-- spectacles: Public read (if public=true), Admin write
-- spectacles_categories: Public read, Admin write (junction table)
-- information_schema: System view - should not be granted to PUBLIC/authenticated
--
-- No re-grant needed - RLS policies provide the necessary access control.

-- Verify: After applying, run supabase/scripts/audit_grants.sql to confirm no exposed objects remain.
