-- Migration: Fix RLS policies for base tables and revoke admin views from anon
-- Created: 2025-12-31
-- Purpose: Restrict public access to active rows only and protect admin views
--
-- Context:
--   membres_equipe and compagnie_presentation_sections currently expose ALL rows
--   to anon users (using true), but should only expose active rows.
--   Admin views (*_admin) should not be accessible to anon role.
--
-- Changes:
--   1. membres_equipe: Add active=true filter for public, separate admin policy
--   2. compagnie_presentation_sections: Add active=true filter for public, separate admin policy
--   3. Revoke SELECT on all *_admin views from anon role
--   4. Verification checks included

BEGIN;

-- ============================================================================
-- 1. FIX membres_equipe RLS POLICIES
-- ============================================================================

-- Drop existing overly-permissive policy
DROP POLICY IF EXISTS "Membres equipe are viewable by everyone" ON public.membres_equipe;

-- New policy: Public users see only active members
CREATE POLICY "Active team members are viewable by everyone"
ON public.membres_equipe
FOR SELECT
TO anon, authenticated
USING ( active = true );

-- New policy: Admins see ALL members (including inactive)
DROP POLICY IF EXISTS "Admins can view all team members" ON public.membres_equipe;
CREATE POLICY "Admins can view all team members"
ON public.membres_equipe
FOR SELECT
TO authenticated
USING ( (SELECT public.is_admin()) );

COMMENT ON POLICY "Active team members are viewable by everyone" ON public.membres_equipe IS
'Public access restricted to active team members only (active = true)';

COMMENT ON POLICY "Admins can view all team members" ON public.membres_equipe IS
'Admins can view all team members including inactive ones';

-- ============================================================================
-- 2. FIX compagnie_presentation_sections RLS POLICIES
-- ============================================================================

-- Drop existing overly-permissive policy
DROP POLICY IF EXISTS "Compagnie presentation sections are viewable by everyone" ON public.compagnie_presentation_sections;

-- New policy: Public users see only active sections
CREATE POLICY "Active presentation sections are viewable by everyone"
ON public.compagnie_presentation_sections
FOR SELECT
TO anon, authenticated
USING ( active = true );

-- New policy: Admins see ALL sections (including inactive)
DROP POLICY IF EXISTS "Admins can view all presentation sections" ON public.compagnie_presentation_sections;
CREATE POLICY "Admins can view all presentation sections"
ON public.compagnie_presentation_sections
FOR SELECT
TO authenticated
USING ( (SELECT public.is_admin()) );

COMMENT ON POLICY "Active presentation sections are viewable by everyone" ON public.compagnie_presentation_sections IS
'Public access restricted to active presentation sections only (active = true)';

COMMENT ON POLICY "Admins can view all presentation sections" ON public.compagnie_presentation_sections IS
'Admins can view all presentation sections including inactive ones';

-- ============================================================================
-- 3. VERIFY partners TABLE (should already be correct)
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'partners'
      AND policyname = 'Public partners are viewable by anyone'
  ) THEN
    RAISE WARNING '⚠️ Expected policy "Public partners are viewable by anyone" not found on partners table';
  ELSE
    RAISE NOTICE '✅ partners table policy is correct (is_active = true)';
  END IF;
END $$;

-- ============================================================================
-- 4. REVOKE ADMIN VIEWS FROM anon ROLE
-- ============================================================================

REVOKE SELECT ON public.membres_equipe_admin FROM anon;
REVOKE SELECT ON public.compagnie_presentation_sections_admin FROM anon;
REVOKE SELECT ON public.partners_admin FROM anon;
REVOKE SELECT ON public.communiques_presse_dashboard FROM anon;
REVOKE SELECT ON public.content_versions_detailed FROM anon;
REVOKE SELECT ON public.messages_contact_admin FROM anon;
REVOKE SELECT ON public.analytics_summary FROM anon;

-- Update comments on admin views
COMMENT ON VIEW public.membres_equipe_admin IS
'Vue d''administration des membres avec métadonnées de versioning. SECURITY INVOKER + Admin access only.';

COMMENT ON VIEW public.compagnie_presentation_sections_admin IS
'Vue administration sections présentation avec métadonnées de versioning. SECURITY INVOKER + Admin access only.';

COMMENT ON VIEW public.partners_admin IS
'Vue administration partenaires incluant métadonnées versioning. SECURITY INVOKER + Admin access only.';

-- ============================================================================
-- 5. VERIFICATION CHECKS
-- ============================================================================

DO $$
DECLARE
  anon_admin_view_count int;
BEGIN
  -- Test: Verify anon CANNOT access admin views
  SELECT COUNT(*)
  INTO anon_admin_view_count
  FROM information_schema.table_privileges
  WHERE table_schema = 'public'
    AND table_name LIKE '%_admin'
    AND grantee = 'anon'
    AND privilege_type = 'SELECT';

  IF anon_admin_view_count > 0 THEN
    RAISE EXCEPTION '❌ anon role still has SELECT on % admin views', anon_admin_view_count;
  ELSE
    RAISE NOTICE '✅ Admin views are protected from anon role';
  END IF;

  RAISE NOTICE '✅ All RLS policies updated correctly';
END $$;

COMMIT;
