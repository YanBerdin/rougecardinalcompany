-- =============================================================================
-- Baseline privileges on schema public
-- =============================================================================
-- These grants are NOT captured by `supabase db diff` (migra ignores ACLs), so
-- they are declared here for documentation and must be replayed manually via a
-- migration whenever they drift.
--
-- `service_role` is the trusted server-side role used by `createAdminClient()`
-- in the DAL. It bypasses RLS by design and therefore needs the full DML set on
-- every relation in `public`. Losing these grants makes every admin route fail
-- with `permission denied for table ...` (observed on production 2026-08-01,
-- where service_role held only `Dxtm` — no INSERT/SELECT/UPDATE/DELETE).
--
-- Access control for service_role is enforced at the application layer
-- (`requireAdminOnly()` / `requireBackofficeAccess()`), never by GRANTs.
-- =============================================================================

grant usage on schema public to service_role;

grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;

alter default privileges in schema public
  grant all privileges on tables to service_role;
alter default privileges in schema public
  grant all privileges on sequences to service_role;

-- `user_invitations` is admin-only, but the gating is done by RLS policies
-- ("Authenticated admins can ..."), which require the underlying table grants.
grant select, insert, update, delete on public.user_invitations to authenticated;
