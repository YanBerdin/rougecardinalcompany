-- 20251025_proposed_revoke_public_anon.sql
-- DRY RUN migration: propose REVOKE / GRANT statements to remove broad
-- privileges granted to PUBLIC / anon / authenticated and to revoke
-- unexpected role memberships. This file only emits RAISE NOTICE lines
-- describing the actions; it does NOT execute them. Review before applying.

DO $$
DECLARE
  rec RECORD;
  cmd TEXT;
BEGIN
  RAISE NOTICE '--- Relation grants to PUBLIC/anon/authenticated (proposed REVOKE ALL PRIVILEGES)';
  FOR rec IN
    SELECT n.nspname, c.relname
    FROM pg_class c
    JOIN pg_namespace n ON c.relnamespace = n.oid,
         unnest(coalesce(c.relacl, '{}'::aclitem[])) AS acl_item
    WHERE (CASE WHEN split_part(acl_item::text, '=', 1) = '' THEN 'PUBLIC' ELSE split_part(acl_item::text, '=', 1) END) IN ('PUBLIC','anon','authenticated')
  LOOP
    cmd := format('REVOKE ALL PRIVILEGES ON %I.%I FROM PUBLIC; -- proposed', rec.nspname, rec.relname);
    RAISE NOTICE '%', cmd;
    cmd := format('REVOKE ALL PRIVILEGES ON %I.%I FROM anon; -- proposed', rec.nspname, rec.relname);
    RAISE NOTICE '%', cmd;
    cmd := format('GRANT SELECT ON %I.%I TO authenticated; -- optional', rec.nspname, rec.relname);
    RAISE NOTICE '%', cmd;
  END LOOP;

  RAISE NOTICE '--- Function grants to PUBLIC/anon/authenticated (proposed REVOKE EXECUTE)';
  FOR rec IN
    SELECT n.nspname, p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid,
         unnest(coalesce(p.proacl, '{}'::aclitem[])) AS acl_item
    WHERE (CASE WHEN split_part(acl_item::text, '=', 1) = '' THEN 'PUBLIC' ELSE split_part(acl_item::text, '=', 1) END) IN ('PUBLIC','anon','authenticated')
  LOOP
    cmd := format('REVOKE EXECUTE ON FUNCTION %I.%I(%s) FROM PUBLIC; -- proposed', rec.nspname, rec.proname, rec.args);
    RAISE NOTICE '%', cmd;
    cmd := format('REVOKE EXECUTE ON FUNCTION %I.%I(%s) FROM anon; -- proposed', rec.nspname, rec.proname, rec.args);
    RAISE NOTICE '%', cmd;
    cmd := format('GRANT EXECUTE ON FUNCTION %I.%I(%s) TO authenticated; -- optional', rec.nspname, rec.proname, rec.args);
    RAISE NOTICE '%', cmd;
  END LOOP;

  RAISE NOTICE '--- Role memberships involving anon/authenticated (proposed REVOKE)';
  FOR rec IN
    SELECT r.rolname AS member_role, m.roleid::regrole::text AS granted_role
    FROM pg_auth_members m
    JOIN pg_roles r ON m.member = r.oid
    WHERE r.rolname IN ('anon','authenticated') OR m.roleid::regrole::text IN ('anon','authenticated')
  LOOP
    -- rec.member_role is the member, rec.granted_role is the role it is a member of
    cmd := format('-- Proposed: REVOKE %s FROM %s;', rec.granted_role, rec.member_role);
    RAISE NOTICE '%', cmd;
  END LOOP;

  RAISE NOTICE '--- End of dry-run proposals. Review notices above and generate an applying migration only after manual review.';
END$$;

-- NOTE: If you are ready to apply the commands, replace the RAISE NOTICE lines with EXECUTE of the same commands
--       or create a careful, reviewed migration that runs the exact REVOKE/GRANT statements.
