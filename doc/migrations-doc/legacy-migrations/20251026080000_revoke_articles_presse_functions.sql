
--! ==================================================================
-- ⚠️  AVERTISSEMENT — REVUES REQUISES
-- Ce fichier révoque des privilèges sur des vues/tables et des fonctions
-- métier (articles_presse, triggers). Valider l'impact sur l'affichage
-- public et les triggers de mise à jour avant exécution en production.
-- Voir doc/INCIDENT_POSTMORTEM_RLS_GRANTS_2025-10-27.md
--! ==================================================================

-- Migration: Revoke privileges on articles_presse tables and trigger functions (Round 8)
-- Date: 2025-10-26
-- Purpose: Remove table-level grants from articles_presse_public, articles_tags and custom functions
-- Safe: Idempotent - uses DO blocks with exception handling

-- =====================================================================
-- ROUND 8: Articles Presse Tables + Custom Trigger Functions
-- =====================================================================

-- 1. public.articles_presse_public (authenticated) - View for public articles
DO $$
BEGIN
  BEGIN
    REVOKE ALL ON TABLE public.articles_presse_public FROM authenticated;
    RAISE NOTICE 'Revoked ALL on public.articles_presse_public from authenticated';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'View public.articles_presse_public does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.articles_presse_public: % - skipping', SQLERRM;
  END;
END;
$$;

-- 2. public.articles_tags (authenticated) - Junction table for article tags
DO $$
BEGIN
  BEGIN
    REVOKE ALL ON TABLE public.articles_tags FROM authenticated;
    RAISE NOTICE 'Revoked ALL on public.articles_tags from authenticated';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'Table public.articles_tags does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.articles_tags: % - skipping', SQLERRM;
  END;
END;
$$;

-- 3. public.update_tag_usage_count() (authenticated) - Trigger function
DO $$
BEGIN
  BEGIN
    REVOKE EXECUTE ON FUNCTION public.update_tag_usage_count() FROM authenticated;
    RAISE NOTICE 'Revoked EXECUTE on public.update_tag_usage_count from authenticated';
  EXCEPTION
    WHEN undefined_function THEN
      RAISE NOTICE 'Function public.update_tag_usage_count does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.update_tag_usage_count: % - skipping', SQLERRM;
  END;
END;
$$;

-- 4. public.update_updated_at_column() (authenticated) - Trigger function
DO $$
BEGIN
  BEGIN
    REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM authenticated;
    RAISE NOTICE 'Revoked EXECUTE on public.update_updated_at_column from authenticated';
  EXCEPTION
    WHEN undefined_function THEN
      RAISE NOTICE 'Function public.update_updated_at_column does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.update_updated_at_column: % - skipping', SQLERRM;
  END;
END;
$$;

-- 5. public.validate_communique_creation(bigint) (authenticated) - Validation function
DO $$
BEGIN
  BEGIN
    REVOKE EXECUTE ON FUNCTION public.validate_communique_creation(bigint) FROM authenticated;
    RAISE NOTICE 'Revoked EXECUTE on public.validate_communique_creation from authenticated';
  EXCEPTION
    WHEN undefined_function THEN
      RAISE NOTICE 'Function public.validate_communique_creation does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.validate_communique_creation: % - skipping', SQLERRM;
  END;
END;
$$;

-- 6. public.validate_rrule(text) (authenticated) - RRULE validation function
DO $$
BEGIN
  BEGIN
    REVOKE EXECUTE ON FUNCTION public.validate_rrule(text) FROM authenticated;
    RAISE NOTICE 'Revoked EXECUTE on public.validate_rrule from authenticated';
  EXCEPTION
    WHEN undefined_function THEN
      RAISE NOTICE 'Function public.validate_rrule does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.validate_rrule: % - skipping', SQLERRM;
  END;
END;
$$;

-- Note: Round 8 addresses:
-- - articles_presse_public: Public view for press articles - Should use RLS on base table
-- - articles_tags: Junction table for article-tag relationship - Should use RLS policies
-- - Trigger functions: update_tag_usage_count, update_updated_at_column
-- - Validation functions: validate_communique_creation, validate_rrule
--
-- These are custom business functions that should NOT have EXECUTE grants to authenticated.
-- If they are trigger functions, they will execute with definer privileges anyway.
-- If they are called directly, access should be controlled via explicit grants in code, not default grants.
--
-- Verify: After applying, run supabase/scripts/audit_grants_filtered.sql to confirm.
