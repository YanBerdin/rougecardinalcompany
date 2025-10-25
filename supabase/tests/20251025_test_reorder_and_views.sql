-- 20251025_test_reorder_and_views.sql
-- Small test script to validate:
-- 1) SECURITY INVOKER admin view access for anon / authenticated
-- 2) EXECUTE permission & behavior of public.reorder_team_members(jsonb)
--
-- Usage:
--   psql "postgresql://<service_role_or_admin_conn>" -f 20251025_test_reorder_and_views.sql
-- Notes:
--  - Run this from a superuser / admin connection (service_role) so SET ROLE works
--  - Adapt the sample id values used for the RPC call to existing member ids in your DB

do $$ begin raise notice '--- Test: SELECT from public.membres_equipe_admin as anon'; end $$ language plpgsql;
DO $$
BEGIN
  BEGIN
    PERFORM set_config('role', 'anon', true);
  EXCEPTION WHEN OTHERS THEN
    -- fallback to SET ROLE if set_config unavailable in this session
    -- (some environments require SET ROLE instead)
    NULL;
  END;

  BEGIN
    -- Attempt to select count from admin view as anon
    PERFORM (SELECT count(*) FROM public.membres_equipe_admin);
    RAISE NOTICE 'anon SELECT succeeded (unexpected unless anon granted)';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'anon SELECT failed as expected or due to insufficient grants: %', SQLERRM;
  END;
END
$$ LANGUAGE plpgsql;

do $$ begin raise notice '--- Test: SELECT from public.membres_equipe_admin as authenticated'; end $$ language plpgsql;
DO $$
BEGIN
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

do $$ begin raise notice '--- Test: Call reorder_team_members as anon (expect permission denied)'; end $$ language plpgsql;
DO $$
BEGIN
  BEGIN
    PERFORM set_config('role', 'anon', true);
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  BEGIN
    -- Replace the id values with real ids present in your membres_equipe table
    PERFORM public.reorder_team_members('[{"id": 1, "ordre": 10}]'::jsonb);
    RAISE NOTICE 'anon could call reorder_team_members (unexpected)';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'anon call failed as expected: %', SQLERRM;
  END;
END
$$ LANGUAGE plpgsql;

do $$ begin raise notice '--- Test: Call reorder_team_members as authenticated (likely permission denied unless admin)'; end $$ language plpgsql;
DO $$
BEGIN
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

do $$ begin raise notice '--- Test: Call reorder_team_members as postgres (superuser) - should succeed if ids valid'; end $$ language plpgsql;
DO $$
BEGIN
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

do $$ begin raise notice '--- End of tests. Replace sample ids with real ones for meaningful updates.'; end $$ language plpgsql;
