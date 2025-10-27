
--! ==================================================================
-- ⚠️  AVERTISSEMENT — REVUES REQUISES
-- Ce fichier révoque des privilèges sur des tables de taxonomie et des
-- fonctions d'analyse/search. Confirmer l'impact sur la recherche et les
-- analytics avant exécution en production. Voir doc/INCIDENT_POSTMORTEM_RLS_GRANTS_2025-10-27.md
--! ==================================================================

-- Migration: Revoke privileges on categories tables and analytics/search functions (Round 9)
-- Date: 2025-10-26
-- Purpose: Remove table-level grants from categories tables and custom analytics/search functions
-- Safe: Idempotent - uses DO blocks with exception handling

-- =====================================================================
-- ROUND 9: Categories Tables + Analytics/Search Functions
-- =====================================================================

-- 1. public.categories (authenticated) - Categories table
DO $$
BEGIN
  BEGIN
    REVOKE ALL ON TABLE public.categories FROM authenticated;
    RAISE NOTICE 'Revoked ALL on public.categories from authenticated';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'Table public.categories does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.categories: % - skipping', SQLERRM;
  END;
END;
$$;

-- 2. public.categories_hierarchy (authenticated) - Categories hierarchy view/table
DO $$
BEGIN
  BEGIN
    REVOKE ALL ON TABLE public.categories_hierarchy FROM authenticated;
    RAISE NOTICE 'Revoked ALL on public.categories_hierarchy from authenticated';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'Table public.categories_hierarchy does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.categories_hierarchy: % - skipping', SQLERRM;
  END;
END;
$$;

-- 3. public.show_trgm(text) (PUBLIC) - Trigram search function
DO $$
BEGIN
  BEGIN
    REVOKE ALL ON FUNCTION public.show_trgm(text) FROM PUBLIC;
    RAISE NOTICE 'Revoked ALL on public.show_trgm from PUBLIC';
  EXCEPTION
    WHEN undefined_function THEN
      RAISE NOTICE 'Function public.show_trgm does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.show_trgm: % - skipping', SQLERRM;
  END;
END;
$$;

-- 4. public.spectacles_versioning_trigger() (authenticated) - Versioning trigger function
DO $$
BEGIN
  BEGIN
    REVOKE EXECUTE ON FUNCTION public.spectacles_versioning_trigger() FROM authenticated;
    RAISE NOTICE 'Revoked EXECUTE on public.spectacles_versioning_trigger from authenticated';
  EXCEPTION
    WHEN undefined_function THEN
      RAISE NOTICE 'Function public.spectacles_versioning_trigger does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.spectacles_versioning_trigger: % - skipping', SQLERRM;
  END;
END;
$$;

-- 5. public.to_tsvector_french(text) (authenticated) - French text search function
DO $$
BEGIN
  BEGIN
    REVOKE EXECUTE ON FUNCTION public.to_tsvector_french(text) FROM authenticated;
    RAISE NOTICE 'Revoked EXECUTE on public.to_tsvector_french from authenticated';
  EXCEPTION
    WHEN undefined_function THEN
      RAISE NOTICE 'Function public.to_tsvector_french does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.to_tsvector_french: % - skipping', SQLERRM;
  END;
END;
$$;

-- 6. public.track_analytics_event(text, jsonb) (authenticated) - Analytics tracking function
DO $$
BEGIN
  BEGIN
    REVOKE EXECUTE ON FUNCTION public.track_analytics_event(p_event_type text, p_metadata jsonb) FROM authenticated;
    RAISE NOTICE 'Revoked EXECUTE on public.track_analytics_event from authenticated';
  EXCEPTION
    WHEN undefined_function THEN
      RAISE NOTICE 'Function public.track_analytics_event does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.track_analytics_event: % - skipping', SQLERRM;
  END;
END;
$$;

-- Note: Round 9 addresses:
-- - categories: Spectacle categories - Should use RLS policies
-- - categories_hierarchy: Hierarchical category structure - Should use RLS
-- - show_trgm(): Trigram similarity function - Custom wrapper, should not be PUBLIC
-- - spectacles_versioning_trigger(): Trigger function - Executes with definer privileges
-- - to_tsvector_french(): French full-text search helper - Should not have authenticated EXECUTE
-- - track_analytics_event(): Analytics event tracker - Should be called via API route, not directly
--
-- These functions are either:
-- 1. Trigger functions (execute automatically, don't need grants)
-- 2. Utility functions (should be called server-side only)
-- 3. Analytics functions (should go through controlled API endpoints)
--
-- Verify: After applying, run supabase/scripts/audit_grants_filtered.sql to confirm.
