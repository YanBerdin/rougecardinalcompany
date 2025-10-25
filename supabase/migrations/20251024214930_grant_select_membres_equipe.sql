-- 20251024214930_grant_select_membres_equipe.sql
-- Migration: grant SELECT on membres_equipe and admin view to authenticated role
-- Rationale: views defined WITH (security_invoker = true) execute with caller privileges.
-- To allow authenticated users (admin UI) to query the admin view, grant SELECT on
-- the base table and the view to the `authenticated` role. Do NOT grant to `anon`.

begin;

-- Grant select on base table so SECURITY INVOKER views can run for authenticated users
GRANT SELECT ON public.membres_equipe TO authenticated;

-- Grant select on the admin view explicitly
GRANT SELECT ON public.membres_equipe_admin TO authenticated;

commit;
