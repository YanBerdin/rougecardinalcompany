-- =============================================================================
-- Migration: restore baseline GRANTs for service_role on schema public
-- =============================================================================
-- Purpose
--   Production (hjmwctzqljfszuwkaadd) lost the DML privileges of the
--   `service_role` on schema public: every relation held `Dxtm` (TRUNCATE,
--   REFERENCES, TRIGGER, MAINTAIN) but not `arwd` (INSERT, SELECT, UPDATE,
--   DELETE), and 0 of the 28 sequences were usable. Staging
--   (yvtrlvmbofklefxcxrzv) was unaffected (53/53 relations correct).
--
-- Symptoms
--   - /admin/media/library returned HTTP 500.
--   - Postgres logs: `permission denied for table profiles`, `... for table
--     partners`, `... for view membres_equipe_admin`, `... for table
--     analytics_events`, etc.
--   - `pnpm run diagnose:admin-views` failed with SQLSTATE 42501.
--   Every server-side path built on `createAdminClient()` (SUPABASE_SECRET_KEY)
--   was broken.
--
-- Root cause
--   `service_role` bypasses RLS but is still subject to table GRANTs. The
--   Supabase bootstrap default privileges were not in effect for the objects
--   created on that project, and GRANT changes are invisible to
--   `supabase db diff`, so the drift went unnoticed.
--
-- Affected objects
--   - All tables and views in schema public (53).
--   - All sequences in schema public (28).
--   - public.user_invitations: `authenticated` had no DML grant either, which
--     made its admin RLS policies unreachable.
--
-- Security considerations
--   No privilege is added for `anon` or `authenticated` beyond the single
--   `user_invitations` grant, whose access is already gated by RLS policies
--   restricted to admins. `service_role` is never exposed to the browser: the
--   secret key is server-only and every DAL entry point calls
--   `requireAdminOnly()` / `requireBackofficeAccess()` first.
--
-- Declarative counterpart: supabase/schemas/70_grants_baseline.sql
-- =============================================================================

grant usage on schema public to service_role;

grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;

-- Ensure relations created later inherit the same baseline.
alter default privileges in schema public
  grant all privileges on tables to service_role;
alter default privileges in schema public
  grant all privileges on sequences to service_role;

grant select, insert, update, delete on public.user_invitations to authenticated;
