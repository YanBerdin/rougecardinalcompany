-- 20251025170000_apply_revoke_public_anon.sql
-- APPLY migration: revoke broad privileges granted to PUBLIC/anon and grant to authenticated
-- WARNING: This migration will execute REVOKE/GRANT commands. Review carefully in a test environment
-- before applying to production. This file is idempotent: REVOKE on a missing grant is no-op.

DO $$
DECLARE
  rec RECORD;
  cmd TEXT;
BEGIN
  RAISE NOTICE '--- Applying relation privilege fixes: REVOKE PUBLIC/anon, GRANT authenticated when appropriate';
  FOR rec IN
    SELECT n.nspname, c.relname
    FROM pg_class c
    JOIN pg_namespace n ON c.relnamespace = n.oid,
         unnest(coalesce(c.relacl, '{}'::aclitem[])) AS acl_item
    WHERE (CASE WHEN split_part(acl_item::text, '=', 1) = '' THEN 'PUBLIC' ELSE split_part(acl_item::text, '=', 1) END) IN ('PUBLIC','anon')
  LOOP
    cmd := format('REVOKE ALL PRIVILEGES ON %I.%I FROM PUBLIC', rec.nspname, rec.relname);
    RAISE NOTICE '%', cmd; EXECUTE cmd;
    cmd := format('REVOKE ALL PRIVILEGES ON %I.%I FROM anon', rec.nspname, rec.relname);
    RAISE NOTICE '%', cmd; EXECUTE cmd;
    -- Ensure authenticated has at least SELECT (idempotent)
    cmd := format('GRANT SELECT ON %I.%I TO authenticated', rec.nspname, rec.relname);
    RAISE NOTICE '%', cmd; EXECUTE cmd;
  END LOOP;

  RAISE NOTICE '--- Applying function privilege fixes: REVOKE EXECUTE PUBLIC/anon, GRANT authenticated';
  FOR rec IN
    SELECT n.nspname, p.oid, p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid,
         unnest(coalesce(p.proacl, '{}'::aclitem[])) AS acl_item
    WHERE (CASE WHEN split_part(acl_item::text, '=', 1) = '' THEN 'PUBLIC' ELSE split_part(acl_item::text, '=', 1) END) IN ('PUBLIC','anon')
  LOOP
    cmd := format('REVOKE EXECUTE ON FUNCTION %I.%I(%s) FROM PUBLIC', rec.nspname, rec.proname, rec.args);
    RAISE NOTICE '%', cmd; EXECUTE cmd;
    cmd := format('REVOKE EXECUTE ON FUNCTION %I.%I(%s) FROM anon', rec.nspname, rec.proname, rec.args);
    RAISE NOTICE '%', cmd; EXECUTE cmd;
    cmd := format('GRANT EXECUTE ON FUNCTION %I.%I(%s) TO authenticated', rec.nspname, rec.proname, rec.args);
    RAISE NOTICE '%', cmd; EXECUTE cmd;
  END LOOP;

  RAISE NOTICE '--- Removing unexpected role memberships involving anon/authenticated';
  FOR rec IN
    SELECT r.rolname AS member_role, (m.roleid::regrole)::text AS granted_role
    FROM pg_auth_members m
    JOIN pg_roles r ON m.member = r.oid
    WHERE r.rolname NOT IN ('anon','authenticated') AND (m.roleid::regrole::text IN ('anon','authenticated') OR r.rolname IN ('anon','authenticated'))
  LOOP
    -- Only revoke if present; idempotent
    cmd := format('REVOKE %I FROM %I', rec.granted_role, rec.member_role);
    RAISE NOTICE '%', cmd; EXECUTE cmd;
  END LOOP;

  RAISE NOTICE '--- APPLY migration completed. Review logs for executed commands.';
END$$;
