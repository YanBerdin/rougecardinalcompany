
--! ==================================================================
-- ⚠️  AVERTISSEMENT — REVUES REQUISES
-- Ce fichier cible des tables/funcitons de stockage et utilitaires. Avant
-- exécution en production, vérifier l'impact sur les uploads multipart et
-- les triggers dépendants. Voir doc/INCIDENT_POSTMORTEM_RLS_GRANTS_2025-10-27.md
--! ==================================================================

-- Migration: Revoke privileges on storage.s3_multipart_uploads_parts and utility functions (Round 15)
-- Date: 2025-10-26
-- Purpose: Remove grants from storage multipart parts table and versioning/utility functions
-- Safe: Idempotent - uses DO blocks with exception handling

-- =====================================================================
-- ROUND 15: Storage Multipart Parts + Versioning/Utility Functions
-- =====================================================================

-- 1. storage.s3_multipart_uploads_parts (anon, authenticated) - Individual upload parts tracking
DO $$
BEGIN
  BEGIN
    REVOKE ALL ON TABLE storage.s3_multipart_uploads_parts FROM anon;
    RAISE NOTICE 'Revoked ALL on storage.s3_multipart_uploads_parts from anon';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'Table storage.s3_multipart_uploads_parts does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke storage.s3_multipart_uploads_parts from anon: % - skipping', SQLERRM;
  END;
END;
$$;

DO $$
BEGIN
  BEGIN
    REVOKE ALL ON TABLE storage.s3_multipart_uploads_parts FROM authenticated;
    RAISE NOTICE 'Revoked ALL on storage.s3_multipart_uploads_parts from authenticated';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'Table storage.s3_multipart_uploads_parts does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke storage.s3_multipart_uploads_parts from authenticated: % - skipping', SQLERRM;
  END;
END;
$$;

-- 2. public.create_content_version() (authenticated) - Content versioning function
DO $$
BEGIN
  BEGIN
    REVOKE EXECUTE ON FUNCTION public.create_content_version(p_table_name text, p_record_id bigint, p_data jsonb, p_change_summary text, p_changed_by text) FROM authenticated;
    RAISE NOTICE 'Revoked EXECUTE on public.create_content_version from authenticated';
  EXCEPTION
    WHEN undefined_function THEN
      RAISE NOTICE 'Function public.create_content_version does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.create_content_version: % - skipping', SQLERRM;
  END;
END;
$$;

-- 3. public.evenements_versioning_trigger() (authenticated) - Events versioning trigger
DO $$
BEGIN
  BEGIN
    REVOKE EXECUTE ON FUNCTION public.evenements_versioning_trigger() FROM authenticated;
    RAISE NOTICE 'Revoked EXECUTE on public.evenements_versioning_trigger from authenticated';
  EXCEPTION
    WHEN undefined_function THEN
      RAISE NOTICE 'Function public.evenements_versioning_trigger does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.evenements_versioning_trigger: % - skipping', SQLERRM;
  END;
END;
$$;

-- 4. public.generate_slug() (authenticated) - Slug generation utility
DO $$
BEGIN
  BEGIN
    REVOKE EXECUTE ON FUNCTION public.generate_slug(input_text text) FROM authenticated;
    RAISE NOTICE 'Revoked EXECUTE on public.generate_slug from authenticated';
  EXCEPTION
    WHEN undefined_function THEN
      RAISE NOTICE 'Function public.generate_slug does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.generate_slug: % - skipping', SQLERRM;
  END;
END;
$$;

-- 5. public.get_current_timestamp() (authenticated) - Timestamp utility
DO $$
BEGIN
  BEGIN
    REVOKE EXECUTE ON FUNCTION public.get_current_timestamp() FROM authenticated;
    RAISE NOTICE 'Revoked EXECUTE on public.get_current_timestamp from authenticated';
  EXCEPTION
    WHEN undefined_function THEN
      RAISE NOTICE 'Function public.get_current_timestamp does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.get_current_timestamp: % - skipping', SQLERRM;
  END;
END;
$$;

-- Note: Round 15 addresses:
--
-- 1. storage.s3_multipart_uploads_parts:
--    - Stores individual parts of multipart S3 uploads
--    - Child table of storage.s3_multipart_uploads
--    - Managed via Supabase Storage API during large file uploads
--    - 6th storage.* system table to whitelist
--
-- 2. create_content_version():
--    - Creates version snapshots of content records
--    - Should be called via Server Actions with admin authorization
--    - Not for direct client-side execution
--    - Part of content versioning system
--
-- 3. evenements_versioning_trigger():
--    - Trigger function for events (evenements) table versioning
--    - Executes automatically on INSERT/UPDATE/DELETE
--    - Runs with SECURITY DEFINER (postgres) privileges
--    - Does NOT need EXECUTE grant to authenticated
--
-- 4. generate_slug():
--    - Utility function for generating URL-friendly slugs from text
--    - Used by set_slug_if_empty() trigger and potentially admin functions
--    - Should be called server-side only (triggers or Server Actions)
--    - Not needed for direct client access
--
-- 5. get_current_timestamp():
--    - Utility function that returns current timestamp
--    - Wrapper around NOW() or CURRENT_TIMESTAMP
--    - Used by triggers and versioning functions
--    - No need for client-side EXECUTE grant
--
-- Security Rationale:
-- - storage.s3_multipart_uploads_parts managed via Storage API (like other storage.* tables)
-- - Versioning functions should go through auth-protected Server Actions
-- - Trigger functions execute automatically with DEFINER privileges
-- - Utility functions (generate_slug, get_current_timestamp) are server-side helpers
-- - Prevents direct client manipulation of versioning and utility infrastructure
--
-- Storage tables now at 6 (complete for multipart uploads):
-- - buckets, buckets_analytics, objects, prefixes
-- - s3_multipart_uploads, s3_multipart_uploads_parts
--
-- Verify: After applying, run supabase/scripts/audit_grants_filtered.sql to confirm.
