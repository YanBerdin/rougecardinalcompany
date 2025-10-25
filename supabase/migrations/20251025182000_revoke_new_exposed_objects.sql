-- Migration: Revoke new exposed objects detected by CI audit (round 2)
-- Date: 2025-10-25
-- Purpose: Remove grants to authenticated on newly discovered exposed tables
-- Safe: Idempotent - uses DO blocks with exception handling

-- 1. Revoke authenticated grants on public.home_hero_slides
DO $$
BEGIN
  BEGIN
    REVOKE ALL ON TABLE public.home_hero_slides FROM authenticated;
    RAISE NOTICE 'Revoked ALL on public.home_hero_slides from authenticated';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'Table public.home_hero_slides does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.home_hero_slides: % - skipping', SQLERRM;
  END;
END;
$$;

-- 2. Revoke authenticated grants on public.lieux
DO $$
BEGIN
  BEGIN
    REVOKE ALL ON TABLE public.lieux FROM authenticated;
    RAISE NOTICE 'Revoked ALL on public.lieux from authenticated';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'Table public.lieux does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.lieux: % - skipping', SQLERRM;
  END;
END;
$$;

-- 3. Revoke authenticated grants on public.logs_audit
DO $$
BEGIN
  BEGIN
    REVOKE ALL ON TABLE public.logs_audit FROM authenticated;
    RAISE NOTICE 'Revoked ALL on public.logs_audit from authenticated';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'Table public.logs_audit does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.logs_audit: % - skipping', SQLERRM;
  END;
END;
$$;

-- 4. Revoke authenticated grants on public.medias
DO $$
BEGIN
  BEGIN
    REVOKE ALL ON TABLE public.medias FROM authenticated;
    RAISE NOTICE 'Revoked ALL on public.medias from authenticated';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'Table public.medias does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.medias: % - skipping', SQLERRM;
  END;
END;
$$;

-- Note: After this migration, if the application requires SELECT access for authenticated users,
-- you should explicitly re-grant SELECT:
-- 
-- GRANT SELECT ON TABLE public.home_hero_slides TO authenticated;
-- GRANT SELECT ON TABLE public.lieux TO authenticated;
-- GRANT SELECT ON TABLE public.medias TO authenticated;
-- 
-- logs_audit should remain admin-only (no re-grant needed)

-- Verify: After applying, run supabase/scripts/audit_grants.sql to confirm no exposed objects remain.
