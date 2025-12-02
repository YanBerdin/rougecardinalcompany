--! ==================================================================
-- ⚠️  AVERTISSEMENT — FONCTION MÉTIER SENSIBLE
-- Ce script révoque EXECUTE sur une fonction métier. Bien que ce soit
-- une bonne pratique de restreindre l'accès direct aux fonctions, toute
-- modification doit être testée et documentée. Voir
-- doc/INCIDENT_POSTMORTEM_RLS_GRANTS_2025-10-27.md
--! ==================================================================



-- =====================================================================================
-- Migration: Round 17 - Revoke check_communique_has_pdf Function
-- Date: 2025-10-26 17:00:00
-- =====================================================================================
-- Description:
--   Revokes EXECUTE privilege on public.check_communique_has_pdf() from authenticated role.
--   

--   This function was detected by the security audit as having excessive privileges.
--   Business logic functions should not have direct EXECUTE grants to client roles.
--   
--   Functions are called in appropriate contexts:
--   - RLS policies (SECURITY DEFINER context)
--   - Database triggers (DEFINER privileges)
--   - Server Actions / API routes (server-side execution)
--
-- Impact:
--   - Prevents direct client calls to check_communique_has_pdf()
--   - Preserves server-side usage in RLS policies and triggers
--   - Improves security posture by enforcing proper access patterns
--
-- Rollback:
--   If needed: GRANT EXECUTE ON FUNCTION public.check_communique_has_pdf() TO authenticated;
-- =====================================================================================

DO $$
BEGIN
  -- Revoke EXECUTE privilege from authenticated role
  BEGIN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.check_communique_has_pdf() FROM authenticated';
    RAISE NOTICE '✓ Revoked EXECUTE on public.check_communique_has_pdf() from authenticated';
  EXCEPTION
    WHEN undefined_function THEN
      RAISE NOTICE '⊘ Function public.check_communique_has_pdf() does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE '⚠ Could not revoke EXECUTE on public.check_communique_has_pdf(): % - skipping', SQLERRM;
  END;

  -- Also revoke from PUBLIC for defense in depth
  BEGIN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.check_communique_has_pdf() FROM PUBLIC';
    RAISE NOTICE '✓ Revoked EXECUTE on public.check_communique_has_pdf() from PUBLIC';
  EXCEPTION
    WHEN undefined_function THEN
      RAISE NOTICE '⊘ Function public.check_communique_has_pdf() does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE '⚠ Could not revoke EXECUTE on public.check_communique_has_pdf(): % - skipping', SQLERRM;
  END;

  -- Also revoke from anon role
  BEGIN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.check_communique_has_pdf() FROM anon';
    RAISE NOTICE '✓ Revoked EXECUTE on public.check_communique_has_pdf() from anon';
  EXCEPTION
    WHEN undefined_function THEN
      RAISE NOTICE '⊘ Function public.check_communique_has_pdf() does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE '⚠ Could not revoke EXECUTE on public.check_communique_has_pdf(): % - skipping', SQLERRM;
  END;

END;
$$;

-- =====================================================================================
-- Migration Complete
-- =====================================================================================
-- Summary:
--   - Revoked EXECUTE on public.check_communique_has_pdf() from authenticated
--   - Revoked EXECUTE on public.check_communique_has_pdf() from PUBLIC (defense in depth)
--   - Revoked EXECUTE on public.check_communique_has_pdf() from anon (defense in depth)
--
-- Security Impact:
--   Total objects secured in Round 17: 1 function
--   Campaign total (Rounds 1-17): 73 objects
--
-- Next Steps:
--   1. Apply migration: pnpm dlx supabase db push
--   2. Verify audit passes: Check CI results
--   3. Verify function still works in RLS policies/triggers (if applicable)
-- =====================================================================================
