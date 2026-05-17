-- Migration: Grant EXECUTE on get_audit_logs_with_email to service_role
-- Purpose: Fix ERR_AUDIT_001 ("permission denied for function") in /admin/audit-logs
-- Affected: public.get_audit_logs_with_email (function grant)
-- Context:
--   The previous migration 20260502140000_revoke_get_audit_logs_from_authenticated
--   assumed that "service_role bypasses all PostgreSQL grants". This assumption
--   is incorrect: service_role is not a PostgreSQL superuser in Supabase. After
--   `REVOKE EXECUTE ... FROM PUBLIC` (implicit via REVOKE from authenticated/anon
--   on a SECURITY DEFINER function), even service_role needs an explicit
--   GRANT EXECUTE to call the function via PostgREST RPC.
--
--   Additionally, createAdminClient() was previously built on @supabase/ssr and
--   forwarded the user's Bearer JWT, so PostgREST resolved the role as
--   `authenticated` rather than `service_role` — making this grant essential to
--   restore audit log access while the SSR client is also being fixed.

grant execute on function public.get_audit_logs_with_email(
  text,
  text,
  uuid,
  timestamp with time zone,
  timestamp with time zone,
  text,
  integer,
  integer
) to service_role;
