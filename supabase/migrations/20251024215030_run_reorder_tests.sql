-- 20251024215030_run_reorder_tests.sql
-- Migration that runs test DO blocks to validate view access and RPC behavior.
-- WARNING: This migration executes DO blocks that run SELECTs and call the RPC.
-- Run only in a non-production environment, or review carefully before applying.

begin;

-- The DO blocks below will raise NOTICE messages with test results.
DO $$
BEGIN
  RAISE NOTICE '--- Test: SELECT from public.membres_equipe_admin as anon';
  BEGIN
    PERFORM set_config('role', 'anon', true);
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  BEGIN
    PERFORM (SELECT count(*) FROM public.membres_equipe_admin);
    RAISE NOTICE 'anon SELECT succeeded (unexpected unless anon granted)';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'anon SELECT failed as expected or due to insufficient grants: %', SQLERRM;
  END;
END
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  RAISE NOTICE '--- Test: SELECT from public.membres_equipe_admin as authenticated';
  BEGIN
    PERFORM set_config('role', 'authenticated', true);
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  BEGIN
    PERFORM (SELECT count(*) FROM public.membres_equipe_admin);
    RAISE NOTICE 'authenticated SELECT succeeded (expected if GRANT SELECT applied)';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'authenticated SELECT failed: %', SQLERRM;
  END;
END
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  RAISE NOTICE '--- Test: Call reorder_team_members as anon (expect permission denied)';
  BEGIN
    PERFORM set_config('role', 'anon', true);
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  BEGIN
    PERFORM public.reorder_team_members('[{"id": 1, "ordre": 10}]'::jsonb);
    RAISE NOTICE 'anon could call reorder_team_members (unexpected)';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'anon call failed as expected: %', SQLERRM;
  END;
END
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  RAISE NOTICE '--- Test: Call reorder_team_members as authenticated (likely permission denied unless admin)';
  BEGIN
    PERFORM set_config('role', 'authenticated', true);
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  BEGIN
    PERFORM public.reorder_team_members('[{"id": 1, "ordre": 10}]'::jsonb);
    RAISE NOTICE 'authenticated call succeeded (only if authenticated session is admin)';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'authenticated call failed (expected for non-admin): %', SQLERRM;
  END;
END
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  RAISE NOTICE '--- Test: Call reorder_team_members as postgres (superuser) - should succeed if ids valid';
  BEGIN
    PERFORM set_config('role', 'postgres', true);
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  BEGIN
    PERFORM public.reorder_team_members('[{"id": 1, "ordre": 10}]'::jsonb);
    RAISE NOTICE 'postgres call succeeded (expected)';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'postgres call failed: %', SQLERRM;
  END;
END
$$ LANGUAGE plpgsql;

commit;
