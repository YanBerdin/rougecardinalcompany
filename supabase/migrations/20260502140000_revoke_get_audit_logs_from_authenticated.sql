-- Migration: Revoke authenticated execute on get_audit_logs_with_email
-- Purpose: Fix lint-0029 (authenticated_security_definer_function_executable)
-- Affected: public.get_audit_logs_with_email (function grant)
-- Context:
--   The function joins auth.users (system table) and therefore must stay
--   SECURITY DEFINER.  Previously, EXECUTE was granted to authenticated so
--   the admin UI could call it via PostgREST RPC.
--   New approach: REVOKE from authenticated/anon, call the function from the
--   server-side DAL exclusively via the service_role (admin) client.
--   The service_role bypasses all PostgreSQL grants, so no explicit GRANT is
--   needed.  The is_admin() guard inside the function has been removed because
--   auth.uid() returns NULL when called through the service_role client,
--   making the check always fail; authorization is now enforced by the
--   Server Action layer (requireAdminPageAccess / requireAdmin).

-- =============================================================================
-- REVOKE EXECUTE from every non-service role
-- =============================================================================

-- Remove the TIER-3 grant applied in the previous migration
revoke execute on function public.get_audit_logs_with_email(
  text,
  text,
  uuid,
  timestamp with time zone,
  timestamp with time zone,
  text,
  integer,
  integer
) from authenticated;

-- Belt-and-suspenders: ensure anon cannot call it either
revoke execute on function public.get_audit_logs_with_email(
  text,
  text,
  uuid,
  timestamp with time zone,
  timestamp with time zone,
  text,
  integer,
  integer
) from anon;
