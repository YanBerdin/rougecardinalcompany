--
-- Migration: Restore Basic GRANTS for RLS to work
-- Created: 2025-10-27 02:00 UTC
-- Purpose: Fix "permission denied" errors by restoring table-level permissions
--
-- Context: During security campaign (Rounds 1-17), all GRANTS were revoked
-- to enforce RLS-only access. However, PostgreSQL requires BOTH:
--   1. Table-level GRANT (allows access to table structure)
--   2. RLS Policy (filters which rows are visible)
--
-- Without GRANTs, even valid RLS policies result in "permission denied" errors.
--
-- This migration restores minimal GRANTs while keeping RLS as the security boundary.
--

-- ============================================================================
-- GRANT STRATEGY
-- ============================================================================
-- anon role: SELECT only (for public data)
-- authenticated role: SELECT, INSERT, UPDATE, DELETE (filtered by RLS)
-- service_role: ALL (bypasses RLS, admin use only)

BEGIN;

-- ============================================================================
-- 1. home_hero_slides
-- ============================================================================
GRANT SELECT ON home_hero_slides TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON home_hero_slides TO authenticated;
-- service_role already has ALL privileges

-- ============================================================================
-- 2. spectacles
-- ============================================================================
GRANT SELECT ON spectacles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON spectacles TO authenticated;

-- ============================================================================
-- 3. partners
-- ============================================================================
GRANT SELECT ON partners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON partners TO authenticated;

-- ============================================================================
-- 4. communiques_presse
-- ============================================================================
GRANT SELECT ON communiques_presse TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON communiques_presse TO authenticated;

-- ============================================================================
-- 5. compagnie_stats
-- ============================================================================
GRANT SELECT ON compagnie_stats TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON compagnie_stats TO authenticated;

-- ============================================================================
-- 6. configurations_site
-- ============================================================================
GRANT SELECT ON configurations_site TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON configurations_site TO authenticated;

-- ============================================================================
-- 7. home_about_content
-- ============================================================================
GRANT SELECT ON home_about_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON home_about_content TO authenticated;

-- ============================================================================
-- 8. Additional critical tables
-- ============================================================================

-- profiles: authenticated users can view/update their own profile
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
-- No anon access to profiles

-- membres_equipe: public read
GRANT SELECT ON membres_equipe TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON membres_equipe TO authenticated;

-- Note: media_library table will be added when it exists

-- ============================================================================
-- VERIFICATION
-- ============================================================================
DO $$
DECLARE
  missing_grants TEXT[];
  tbl_name TEXT;  -- Renamed to avoid conflict with column name
BEGIN
  -- Check critical tables have anon SELECT
  FOR tbl_name IN 
    SELECT unnest(ARRAY[
      'home_hero_slides',
      'spectacles', 
      'partners',
      'communiques_presse',
      'compagnie_stats',
      'configurations_site',
      'home_about_content'
    ])
  LOOP
    -- Check if anon has SELECT
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_privileges
      WHERE table_schema = 'public'
        AND table_name = tbl_name  -- Use renamed variable
        AND grantee = 'anon'
        AND privilege_type = 'SELECT'
    ) THEN
      missing_grants := array_append(missing_grants, tbl_name || ' (anon SELECT)');
    END IF;
    
    -- Check if authenticated has SELECT
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_privileges
      WHERE table_schema = 'public'
        AND table_name = tbl_name  -- Use renamed variable
        AND grantee = 'authenticated'
        AND privilege_type = 'SELECT'
    ) THEN
      missing_grants := array_append(missing_grants, tbl_name || ' (authenticated SELECT)');
    END IF;
  END LOOP;
  
  IF array_length(missing_grants, 1) > 0 THEN
    RAISE EXCEPTION 'Missing grants: %', array_to_string(missing_grants, ', ');
  END IF;
  
  RAISE NOTICE '✅ All critical tables have required GRANTs for RLS to work';
END $$;

COMMIT;

-- ============================================================================
-- POST-MIGRATION NOTES
-- ============================================================================
-- 
-- This migration restores table-level GRANTs that were revoked during the 
-- security campaign. GRANTs are necessary for RLS to function - without them,
-- PostgreSQL denies access before RLS policies are even evaluated.
--
-- Security is still enforced by RLS policies which filter rows based on:
-- - User role (admin via is_admin() function)
-- - Data visibility (active, public, dates, etc.)
-- - Ownership (created_by, user_id, etc.)
--
-- The combination of GRANTs + RLS provides:
-- 1. Table-level access control (who can query the table)
-- 2. Row-level access control (which rows they can see/modify)
--
-- Test after applying:
--   pnpm tsx scripts/diagnose-server-auth.ts
-- Expected: anon client should now succeed on public tables
--
