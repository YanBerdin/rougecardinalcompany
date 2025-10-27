
--! ==================================================================
-- ⚠️  AVERTISSEMENT — REVUES REQUISES
-- Ce fichier révoque des EXECUTE sur des fonctions trigger sensibles
-- (audit/versioning). Avant exécution en production, valider qu'il existe
-- un plan pour préserver les opérations d'audit et le comportement des
-- triggers. Voir doc/INCIDENT_POSTMORTEM_RLS_GRANTS_2025-10-27.md
--! ==================================================================

-- Migration: Revoke privileges on remaining versioning and audit trigger functions (Round 16)
-- Date: 2025-10-26
-- Purpose: Remove grants from versioning trigger functions for articles, communiques, and company data
-- Safe: Idempotent - uses DO blocks with exception handling

-- =====================================================================
-- ROUND 16: Remaining Versioning Trigger Functions
-- =====================================================================

-- 1. public.articles_versioning_trigger() (authenticated) - Articles versioning trigger
DO $$
BEGIN
  BEGIN
    REVOKE EXECUTE ON FUNCTION public.articles_versioning_trigger() FROM authenticated;
    RAISE NOTICE 'Revoked EXECUTE on public.articles_versioning_trigger from authenticated';
  EXCEPTION
    WHEN undefined_function THEN
      RAISE NOTICE 'Function public.articles_versioning_trigger does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.articles_versioning_trigger: % - skipping', SQLERRM;
  END;
END;
$$;

-- 2. public.audit_trigger() (authenticated) - Audit logging trigger function
DO $$
BEGIN
  BEGIN
    REVOKE EXECUTE ON FUNCTION public.audit_trigger() FROM authenticated;
    RAISE NOTICE 'Revoked EXECUTE on public.audit_trigger from authenticated';
  EXCEPTION
    WHEN undefined_function THEN
      RAISE NOTICE 'Function public.audit_trigger does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.audit_trigger: % - skipping', SQLERRM;
  END;
END;
$$;

-- 3. public.communiques_versioning_trigger() (authenticated) - Press releases versioning trigger
DO $$
BEGIN
  BEGIN
    REVOKE EXECUTE ON FUNCTION public.communiques_versioning_trigger() FROM authenticated;
    RAISE NOTICE 'Revoked EXECUTE on public.communiques_versioning_trigger from authenticated';
  EXCEPTION
    WHEN undefined_function THEN
      RAISE NOTICE 'Function public.communiques_versioning_trigger does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.communiques_versioning_trigger: % - skipping', SQLERRM;
  END;
END;
$$;

-- 4. public.compagnie_presentation_sections_versioning_trigger() (authenticated)
DO $$
BEGIN
  BEGIN
    REVOKE EXECUTE ON FUNCTION public.compagnie_presentation_sections_versioning_trigger() FROM authenticated;
    RAISE NOTICE 'Revoked EXECUTE on public.compagnie_presentation_sections_versioning_trigger from authenticated';
  EXCEPTION
    WHEN undefined_function THEN
      RAISE NOTICE 'Function public.compagnie_presentation_sections_versioning_trigger does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.compagnie_presentation_sections_versioning_trigger: % - skipping', SQLERRM;
  END;
END;
$$;

-- 5. public.compagnie_stats_versioning_trigger() (authenticated)
DO $$
BEGIN
  BEGIN
    REVOKE EXECUTE ON FUNCTION public.compagnie_stats_versioning_trigger() FROM authenticated;
    RAISE NOTICE 'Revoked EXECUTE on public.compagnie_stats_versioning_trigger from authenticated';
  EXCEPTION
    WHEN undefined_function THEN
      RAISE NOTICE 'Function public.compagnie_stats_versioning_trigger does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.compagnie_stats_versioning_trigger: % - skipping', SQLERRM;
  END;
END;
$$;

-- 6. public.compagnie_values_versioning_trigger() (authenticated)
DO $$
BEGIN
  BEGIN
    REVOKE EXECUTE ON FUNCTION public.compagnie_values_versioning_trigger() FROM authenticated;
    RAISE NOTICE 'Revoked EXECUTE on public.compagnie_values_versioning_trigger from authenticated';
  EXCEPTION
    WHEN undefined_function THEN
      RAISE NOTICE 'Function public.compagnie_values_versioning_trigger does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.compagnie_values_versioning_trigger: % - skipping', SQLERRM;
  END;
END;
$$;

-- Note: Round 16 addresses the FINAL batch of versioning trigger functions:
--
-- All these are TRIGGER FUNCTIONS that execute automatically on INSERT/UPDATE/DELETE.
-- They ALL run with SECURITY DEFINER (postgres) privileges.
-- NONE of them need EXECUTE grant to authenticated role.
--
-- 1. articles_versioning_trigger():
--    - Creates version snapshots when articles (press articles) are modified
--    - Part of content versioning system for articles table
--
-- 2. audit_trigger():
--    - CRITICAL: Logs all data changes to logs_audit table
--    - Captures WHO changed WHAT and WHEN for compliance/security
--    - Executed automatically on tracked tables
--
-- 3. communiques_versioning_trigger():
--    - Creates version snapshots for press releases (communiques)
--    - Part of content versioning system
--
-- 4. compagnie_presentation_sections_versioning_trigger():
--    - Versions company presentation sections content
--    - Tracks changes to "about us" and company info sections
--
-- 5. compagnie_stats_versioning_trigger():
--    - Versions company statistics (numbers, achievements)
--    - Part of company data versioning
--
-- 6. compagnie_values_versioning_trigger():
--    - Versions company values and mission statements
--    - Part of company data versioning
--
-- Security Rationale:
-- - ALL trigger functions execute with DEFINER privileges (no grants needed)
-- - Revoking EXECUTE prevents direct client calls
-- - Maintains automatic versioning and audit logging functionality
-- - Follows principle of least privilege
-- - Prevents potential abuse of versioning infrastructure
--
-- Versioning trigger functions secured in previous rounds:
-- - spectacles_versioning_trigger (Round 9)
-- - membres_equipe_versioning_trigger (Round 13)
-- - partners_versioning_trigger (Round 13)
-- - evenements_versioning_trigger (Round 15)
--
-- This round completes the versioning trigger security cleanup!
--
-- Verify: After applying, run supabase/scripts/audit_grants_filtered.sql to confirm.
