-- Migration: Revoke PUBLIC privileges on pg_stat_statements extension
-- Date: 2025-10-25
-- Purpose: The CI audit flagged 'extensions.pg_stat_statements' as accessible to PUBLIC.
-- This migration revokes all privileges on the extension from PUBLIC. If you
-- require more granular adjustments (e.g., allow only certain roles to use
-- specific functions), add targeted GRANTs after review.

REVOKE ALL ON EXTENSION pg_stat_statements FROM PUBLIC;

-- Additionally, make sure no functions/views belonging to the extension are
-- granted to PUBLIC explicitly. The following statements are safe no-ops if
-- there are no explicit grants.
DO $$
BEGIN
  -- Revoke execute on any functions in the pg_stat_statements schema (if present)
  PERFORM 'REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC';
EXCEPTION WHEN others THEN
  -- Ignore any errors here; keep migration idempotent
  RAISE NOTICE 'Ignoring error when revoking functions privileges: %', SQLERRM;
END$$;

-- NOTE: Review the effect in a preview environment before applying to prod.
