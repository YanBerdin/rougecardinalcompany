
--! ==================================================================
-- ⚠️  AVERTISSEMENT — REVUES REQUISES
-- Ce fichier modifie des objets de stockage critiques (storage.objects)
-- et des fonctions métier/admin. Valider l'impact sur l'API de stockage
-- et les opérations d'administration avant exécution en production.
-- Voir doc/INCIDENT_POSTMORTEM_RLS_GRANTS_2025-10-27.md
--! ==================================================================

-- Migration: Revoke privileges on storage.objects and team/content management functions (Round 12)
-- Date: 2025-10-26
-- Purpose: Remove grants from storage.objects system table and business management functions
-- Safe: Idempotent - uses DO blocks with exception handling

-- =====================================================================
-- ROUND 12: Storage Objects Table + Business Management Functions
-- =====================================================================

-- 1. storage.objects (anon, authenticated) - Supabase Storage objects table
-- This is the MAIN storage table - access should be via Storage API and RLS policies only
DO $$
BEGIN
  BEGIN
    REVOKE ALL ON TABLE storage.objects FROM anon;
    RAISE NOTICE 'Revoked ALL on storage.objects from anon';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'Table storage.objects does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke storage.objects from anon: % - skipping', SQLERRM;
  END;
END;
$$;

DO $$
BEGIN
  BEGIN
    REVOKE ALL ON TABLE storage.objects FROM authenticated;
    RAISE NOTICE 'Revoked ALL on storage.objects from authenticated';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'Table storage.objects does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke storage.objects from authenticated: % - skipping', SQLERRM;
  END;
END;
$$;

-- 2. public.reorder_team_members(jsonb) (authenticated) - Admin function for team ordering
DO $$
BEGIN
  BEGIN
    REVOKE EXECUTE ON FUNCTION public.reorder_team_members(items jsonb) FROM authenticated;
    RAISE NOTICE 'Revoked EXECUTE on public.reorder_team_members from authenticated';
  EXCEPTION
    WHEN undefined_function THEN
      RAISE NOTICE 'Function public.reorder_team_members does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.reorder_team_members: % - skipping', SQLERRM;
  END;
END;
$$;

-- 3. public.restore_content_version(bigint, text) (authenticated) - Admin function for version restore
DO $$
BEGIN
  BEGIN
    REVOKE EXECUTE ON FUNCTION public.restore_content_version(p_version_id bigint, p_change_summary text) FROM authenticated;
    RAISE NOTICE 'Revoked EXECUTE on public.restore_content_version from authenticated';
  EXCEPTION
    WHEN undefined_function THEN
      RAISE NOTICE 'Function public.restore_content_version does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.restore_content_version: % - skipping', SQLERRM;
  END;
END;
$$;

-- 4. public.set_messages_contact_consent_timestamp() (authenticated) - Trigger function
DO $$
BEGIN
  BEGIN
    REVOKE EXECUTE ON FUNCTION public.set_messages_contact_consent_timestamp() FROM authenticated;
    RAISE NOTICE 'Revoked EXECUTE on public.set_messages_contact_consent_timestamp from authenticated';
  EXCEPTION
    WHEN undefined_function THEN
      RAISE NOTICE 'Function public.set_messages_contact_consent_timestamp does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.set_messages_contact_consent_timestamp: % - skipping', SQLERRM;
  END;
END;
$$;

-- 5. public.set_slug_if_empty() (authenticated) - Trigger function for auto-slug generation
DO $$
BEGIN
  BEGIN
    REVOKE EXECUTE ON FUNCTION public.set_slug_if_empty() FROM authenticated;
    RAISE NOTICE 'Revoked EXECUTE on public.set_slug_if_empty from authenticated';
  EXCEPTION
    WHEN undefined_function THEN
      RAISE NOTICE 'Function public.set_slug_if_empty does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.set_slug_if_empty: % - skipping', SQLERRM;
  END;
END;
$$;

-- Note: Round 12 addresses:
--
-- 1. storage.objects (Supabase Storage main table):
--    - CRITICAL: Has full privileges (arwdDxtm) to both anon and authenticated
--    - arwdDxtm = all privileges including SELECT, INSERT, UPDATE, DELETE, TRIGGER, etc.
--    - This bypasses Supabase Storage RLS policies completely!
--    - Access should ONLY be via Supabase Storage API which enforces RLS
--    - Similar to storage.buckets - must whitelist as system table
--
-- 2. reorder_team_members(jsonb):
--    - Admin-only function for reordering team member display order
--    - Should be called via protected Server Action with admin check
--    - No need for table-level EXECUTE grant to authenticated
--
-- 3. restore_content_version(bigint, text):
--    - Admin-only function for restoring previous content versions
--    - Critical business function - should require explicit admin authorization
--    - Must be called via protected API route, not directly by client
--
-- 4. set_messages_contact_consent_timestamp():
--    - Trigger function for GDPR consent timestamp
--    - Executes automatically with DEFINER privileges
--    - Does NOT need EXECUTE grant to authenticated
--
-- 5. set_slug_if_empty():
--    - Trigger function for auto-generating slugs from titles
--    - Executes automatically with DEFINER privileges
--    - Does NOT need EXECUTE grant to authenticated
--
-- Security Rationale:
-- - Storage.objects access via Storage API only (enforces RLS + policies)
-- - Admin functions should go through auth-protected Server Actions
-- - Trigger functions execute automatically, no grants needed
-- - Principle of least privilege: no direct client access to business functions
--
-- Verify: After applying, run supabase/scripts/audit_grants_filtered.sql to confirm.
