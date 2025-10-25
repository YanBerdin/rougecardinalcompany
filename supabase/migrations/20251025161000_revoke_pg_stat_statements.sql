-- Migration: Deprecated placeholder
-- Date: 2025-10-25
-- NOTE: The original attempt used `REVOKE ... ON EXTENSION` which is not a
-- valid SQL target and therefore raised a syntax error during `db push`.
-- The real, idempotent revocation logic for objects owned by the
-- `pg_stat_statements` extension has been implemented in:
--   20251025163000_revoke_pg_stat_statements_objects.sql
-- To avoid failing the migration pipeline we keep this file as a safe no-op
-- that simply emits a NOTICE. This preserves migration ordering/history while
-- preventing the syntax error.

DO $$
BEGIN
  RAISE NOTICE 'Skipping deprecated migration 20251025161000_revoke_pg_stat_statements.sql - see 20251025163000_revoke_pg_stat_statements_objects.sql for actual revokes.';
END
$$;
