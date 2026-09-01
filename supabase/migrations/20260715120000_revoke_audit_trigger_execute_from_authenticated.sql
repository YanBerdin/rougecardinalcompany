-- Migration: Revoke residual EXECUTE grant on audit_trigger() from authenticated
-- Purpose: Fix Supabase security advisor alert "Signed-In Users Can Execute
--          SECURITY DEFINER Function" for public.audit_trigger()
-- Affected: public.audit_trigger() (grants only, function body unchanged)

-- =============================================================================
-- CONTEXT
-- =============================================================================
-- 20251027022500_grant_execute_all_trigger_functions.sql granted EXECUTE on
-- audit_trigger() TO authenticated, based on a mistaken assumption that
-- PostgreSQL trigger functions need an explicit EXECUTE grant for the role
-- performing the DML in order for the trigger to fire. This is incorrect:
-- trigger execution is an internal call made by the executor, not a normal
-- SQL-level function call subject to the caller's EXECUTE privilege. No grant
-- is required for `on_auth_user_created`-style triggers to run.
--
-- 20260502120000_revoke_anon_all_security_definer_functions.sql later revoked
-- EXECUTE FROM PUBLIC for audit_trigger() (correctly fixing the PUBLIC-inherited
-- default grant), but did not revoke the EXPLICIT grant to `authenticated` made
-- in the Oct 2025 migration. That explicit grant is a separate ACL entry and
-- survives a `revoke ... from public` — hence the advisor alert persists.
--
-- audit_trigger() returns the pseudo-type `trigger`, so PostgreSQL already
-- refuses direct invocation ("trigger functions can only be called as
-- triggers"). Practical exploitability is therefore nil, but the advisor
-- correctly flags the unnecessary grant as a hygiene / defense-in-depth issue:
-- nothing in this app should ever call audit_trigger() directly via
-- `/rest/v1/rpc/audit_trigger`.

-- =============================================================================
-- FIX: revoke the residual explicit grant
-- =============================================================================
revoke execute on function public.audit_trigger() from authenticated;

-- Defensive: ensure no anon grant was ever added for this function either.
revoke execute on function public.audit_trigger() from anon;
