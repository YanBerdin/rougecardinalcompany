--! ==================================================================
-- ⚠️  AVERTISSEMENT — ACTIONS SUR OBJETS SYSTÈME ET ROLES
-- Ce script tente des opérations sur information_schema et les
-- memberships de rôles. Ces opérations peuvent nécessiter des privilèges
-- élevés (superuser) et avoir des effets de bord sur la plateforme.
-- Ne pas exécuter sans validation DBA/SRE. Voir
-- doc/INCIDENT_POSTMORTEM_RLS_GRANTS_2025-10-27.md
--! ==================================================================

-- 20251025174500_revoke_information_schema_and_role_memberships.sql
-- Attempt to remove PUBLIC grant on information_schema.administrable_role_authorizations
-- and revoke unexpected role memberships (postgres/authenticator -> anon|authenticated)
-- Idempotent and tolerant: errors are caught and emitted as NOTICE.

DO $$
DECLARE
  rec RECORD;
BEGIN
  -- Try to revoke PUBLIC on the information_schema view/table. This may fail
  -- if the object is not addressable for REVOKE in the target environment.
  BEGIN
    EXECUTE 'REVOKE ALL ON TABLE information_schema.administrable_role_authorizations FROM PUBLIC';
    RAISE NOTICE 'Revoked PUBLIC on information_schema.administrable_role_authorizations';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not revoke on information_schema.administrable_role_authorizations: %', SQLERRM;
  END;

  -- Revoke unexpected role memberships where privileged roles are members of anon/authenticated
  FOR rec IN
    SELECT r.rolname AS member_role, (m.roleid::regrole)::text AS granted_role
    FROM pg_auth_members m
    JOIN pg_roles r ON m.member = r.oid
    WHERE (m.roleid::regrole::text IN ('anon','authenticated'))
      AND r.rolname IN ('postgres','authenticator')
  LOOP
    BEGIN
      EXECUTE format('REVOKE %I FROM %I', rec.granted_role, rec.member_role);
      RAISE NOTICE 'Revoked membership: % from %', rec.granted_role, rec.member_role;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Failed to revoke membership % from %: %', rec.granted_role, rec.member_role, SQLERRM;
    END;
  END LOOP;

  RAISE NOTICE 'Migration 20251025174500 completed (idempotent)';
END$$;
