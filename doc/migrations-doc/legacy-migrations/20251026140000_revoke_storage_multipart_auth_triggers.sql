
--! ==================================================================
-- ⚠️  AVERTISSEMENT — REVUES REQUISES
-- Ce fichier touche au stockage et aux fonctions de synchronisation auth.
-- Valider l'impact sur le flux d'inscription et les uploads multipart.
-- Voir doc/INCIDENT_POSTMORTEM_RLS_GRANTS_2025-10-27.md
--! ==================================================================

-- Migration: Revoke privileges on storage.s3_multipart_uploads and auth trigger functions (Round 14)
-- Date: 2025-10-26
-- Purpose: Remove grants from storage multipart uploads table and auth sync trigger functions
-- Safe: Idempotent - uses DO blocks with exception handling

-- =====================================================================
-- ROUND 14: Storage Multipart Uploads + Auth Triggers + pg_trgm
-- =====================================================================

-- 1. storage.s3_multipart_uploads (anon, authenticated) - Storage multipart upload tracking
DO $$
BEGIN
  BEGIN
    REVOKE ALL ON TABLE storage.s3_multipart_uploads FROM anon;
    RAISE NOTICE 'Revoked ALL on storage.s3_multipart_uploads from anon';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'Table storage.s3_multipart_uploads does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke storage.s3_multipart_uploads from anon: % - skipping', SQLERRM;
  END;
END;
$$;

DO $$
BEGIN
  BEGIN
    REVOKE ALL ON TABLE storage.s3_multipart_uploads FROM authenticated;
    RAISE NOTICE 'Revoked ALL on storage.s3_multipart_uploads from authenticated';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'Table storage.s3_multipart_uploads does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke storage.s3_multipart_uploads from authenticated: % - skipping', SQLERRM;
  END;
END;
$$;

-- 2. public.gin_trgm_triconsistent (anon, PUBLIC) - pg_trgm GIN index function
-- This is a PostgreSQL extension function that should be whitelisted
DO $$
BEGIN
  BEGIN
    REVOKE ALL PRIVILEGES ON FUNCTION public.gin_trgm_triconsistent(internal, smallint, text, integer, internal, internal, internal) FROM anon;
    RAISE NOTICE 'Revoked ALL PRIVILEGES on public.gin_trgm_triconsistent from anon';
  EXCEPTION
    WHEN undefined_function THEN
      RAISE NOTICE 'Function public.gin_trgm_triconsistent does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.gin_trgm_triconsistent from anon: % - skipping', SQLERRM;
  END;
END;
$$;

DO $$
BEGIN
  BEGIN
    REVOKE ALL PRIVILEGES ON FUNCTION public.gin_trgm_triconsistent(internal, smallint, text, integer, internal, internal, internal) FROM PUBLIC;
    RAISE NOTICE 'Revoked ALL PRIVILEGES on public.gin_trgm_triconsistent from PUBLIC';
  EXCEPTION
    WHEN undefined_function THEN
      RAISE NOTICE 'Function public.gin_trgm_triconsistent does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.gin_trgm_triconsistent from PUBLIC: % - skipping', SQLERRM;
  END;
END;
$$;

-- 3. public.handle_new_user() (authenticated) - Trigger function for new user profile creation
DO $$
BEGIN
  BEGIN
    REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
    RAISE NOTICE 'Revoked EXECUTE on public.handle_new_user from authenticated';
  EXCEPTION
    WHEN undefined_function THEN
      RAISE NOTICE 'Function public.handle_new_user does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.handle_new_user: % - skipping', SQLERRM;
  END;
END;
$$;

-- 4. public.handle_user_deletion() (authenticated) - Trigger function for user cleanup
DO $$
BEGIN
  BEGIN
    REVOKE EXECUTE ON FUNCTION public.handle_user_deletion() FROM authenticated;
    RAISE NOTICE 'Revoked EXECUTE on public.handle_user_deletion from authenticated';
  EXCEPTION
    WHEN undefined_function THEN
      RAISE NOTICE 'Function public.handle_user_deletion does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.handle_user_deletion: % - skipping', SQLERRM;
  END;
END;
$$;

-- Note: Round 14 addresses:
--
-- 1. storage.s3_multipart_uploads:
--    - Supabase Storage system table for managing large file uploads (S3 multipart protocol)
--    - Tracks upload progress for files split into multiple parts
--    - Like other storage.* tables, managed via Storage API
--    - Must whitelist as system table
--
-- 2. gin_trgm_triconsistent():
--    - pg_trgm extension function for GIN index consistency checking
--    - Part of PostgreSQL trigram search infrastructure
--    - Used internally by GIN indexes for fuzzy text search
--    - Should be added to pg_trgm function whitelist pattern
--
-- 3. handle_new_user():
--    - Trigger function that creates public.profiles row when auth.users row is created
--    - Executed automatically by Supabase Auth on user signup
--    - Runs with SECURITY DEFINER (postgres) privileges
--    - Does NOT need EXECUTE grant to authenticated
--
-- 4. handle_user_deletion():
--    - Trigger function that cleans up user data when auth.users row is deleted
--    - Executed automatically by Supabase Auth on user deletion
--    - Runs with SECURITY DEFINER (postgres) privileges
--    - Does NOT need EXECUTE grant to authenticated
--
-- Security Rationale:
-- - storage.s3_multipart_uploads managed via Storage API (like other storage.* tables)
-- - Auth trigger functions execute automatically with DEFINER privileges
-- - gin_trgm_triconsistent is PostgreSQL extension infrastructure (safe to whitelist)
-- - Prevents direct client access while preserving automatic functionality
--
-- Verify: After applying, run supabase/scripts/audit_grants_filtered.sql to confirm.
