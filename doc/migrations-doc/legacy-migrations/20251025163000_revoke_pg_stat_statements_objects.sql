--! ==================================================================
-- ⚠️  DANGER — REVUES REQUISES
-- Ce fichier cible des objets d'extension système (`pg_stat_statements`).
-- Certaines opérations peuvent nécessiter des privilèges élevés et
-- provoquer des effets de bord. Vérifier auprès de l'équipe DBA/SRE avant
-- exécution et consulter doc/INCIDENT_POSTMORTEM_RLS_GRANTS_2025-10-27.md
--! ==================================================================

-- Migration: Revoke PUBLIC privileges on objects created by pg_stat_statements
-- Date: 2025-10-25
-- Purpose: CI audit reported that the pg_stat_statements extension's objects
-- were visible to PUBLIC. PostgreSQL does not support REVOKE ON EXTENSION, so
-- this migration revokes privileges on the actual objects (relations and
-- functions) owned by the extension. This is idempotent and safe to run
-- multiple times.

-- Revoke on relations (tables, views, matviews, sequences, partitions)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT n.nspname, c.relname
    FROM pg_class c
    JOIN pg_namespace n ON c.relnamespace = n.oid
    JOIN pg_depend d ON d.objid = c.oid AND d.deptype = 'e'
    JOIN pg_extension e ON e.oid = d.refobjid
    WHERE e.extname = 'pg_stat_statements'
  LOOP
    RAISE NOTICE 'Revoking ALL on relation %I.%I from PUBLIC, anon, authenticated (if present)', r.nspname, r.relname;
    BEGIN
      EXECUTE format('REVOKE ALL ON %I.%I FROM PUBLIC;', r.nspname, r.relname);
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Ignored error revoking PUBLIC on %I.%I: %', r.nspname, r.relname, SQLERRM;
    END;
    BEGIN
      EXECUTE format('REVOKE ALL ON %I.%I FROM anon, authenticated;', r.nspname, r.relname);
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Ignored error revoking anon/authenticated on %I.%I: %', r.nspname, r.relname, SQLERRM;
    END;
  END LOOP;
END$$;

-- Revoke on functions provided by the extension
DO $$
DECLARE
  f RECORD;
BEGIN
  FOR f IN
    SELECT n.nspname, p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    JOIN pg_depend d ON d.objid = p.oid AND d.deptype = 'e'
    JOIN pg_extension e ON e.oid = d.refobjid
    WHERE e.extname = 'pg_stat_statements'
  LOOP
    RAISE NOTICE 'Revoking EXECUTE on function %I.%I(%s) from PUBLIC, anon, authenticated', f.nspname, f.proname, f.args;
    BEGIN
      EXECUTE format('REVOKE ALL ON FUNCTION %I.%I(%s) FROM PUBLIC;', f.nspname, f.proname, f.args);
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Ignored error revoking PUBLIC on function %I.%I(%s): %', f.nspname, f.proname, f.args, SQLERRM;
    END;
    BEGIN
      EXECUTE format('REVOKE ALL ON FUNCTION %I.%I(%s) FROM anon, authenticated;', f.nspname, f.proname, f.args);
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Ignored error revoking anon/authenticated on function %I.%I(%s): %', f.nspname, f.proname, f.args, SQLERRM;
    END;
  END LOOP;
END$$;

-- End of migration
