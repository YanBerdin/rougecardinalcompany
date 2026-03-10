-- Migration: Fix 4 RLS policy bugs
-- Purpose: Correct critical policy errors identified in audit (2026-03-10)
-- Affected tables: articles_presse, logs_audit, spectacles
-- Special considerations:
--   P0: RESTRICTIVE policy on articles_presse was blocking all authenticated
--       non-admin users from reading published articles (AND → OR logic fix)
--   P1-a: super_admin role can never exist (profiles_role_check constraint
--         limits roles to user/editor/admin), so those policies were dead code
--   P1-b: spectacles used inline subquery instead of centralized is_admin()
--         — inconsistent with all other tables and missing initPlan caching

-- =============================================================================
-- P0 — articles_presse: remove RESTRICTIVE on admin SELECT policy
-- =============================================================================

-- The RESTRICTIVE policy was evaluated as AND with the public PERMISSIVE policy.
-- Result: authenticated non-admin users had to satisfy BOTH conditions:
--   (published_at is not null) AND (is_admin()) → always false for non-admins.
-- Fix: drop and recreate as PERMISSIVE (default). The two SELECT policies now
-- evaluate as OR: non-admins see published articles, admins see everything.

drop policy if exists "Admins can view all press articles" on public.articles_presse;

create policy "Admins can view all press articles"
on public.articles_presse
for select
to authenticated
using ( (select public.is_admin()) );

-- =============================================================================
-- P1-a — logs_audit: replace dead super_admin policies with is_admin()
-- =============================================================================

-- The super_admin role cannot exist: profiles_role_check in 50_constraints.sql
-- enforces role IN ('user', 'editor', 'admin'). Any policy requiring
-- role = 'super_admin' was permanently false — no UPDATE or DELETE was possible.
-- Fix: replace with simple is_admin() guard.
-- Note: direct INSERT remains blocked by design (SECURITY DEFINER trigger only).

drop policy if exists "Super admins can update audit logs" on public.logs_audit;
drop policy if exists "Admins can update audit logs" on public.logs_audit;

create policy "Admins can update audit logs"
on public.logs_audit
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

drop policy if exists "Super admins can delete audit logs" on public.logs_audit;
drop policy if exists "Admins can delete audit logs" on public.logs_audit;

create policy "Admins can delete audit logs"
on public.logs_audit
for delete
to authenticated
using ( (select public.is_admin()) );

-- =============================================================================
-- P1-b — spectacles: replace inline subquery with (select public.is_admin())
-- =============================================================================

-- INSERT, UPDATE and DELETE on spectacles used an inline exists() subquery
-- instead of the centralized is_admin() function used everywhere else.
-- Fix: use (select public.is_admin()) for consistency and initPlan caching.
-- The owner-or-admin pattern for UPDATE/DELETE is preserved.

drop policy if exists "Admins can create spectacles" on public.spectacles;

create policy "Admins can create spectacles"
on public.spectacles
for insert
to authenticated
with check ( (select public.is_admin()) );

drop policy if exists "Owners or admins can update spectacles" on public.spectacles;

create policy "Owners or admins can update spectacles"
on public.spectacles
for update
to authenticated
using (
  created_by = (select auth.uid())
  or (select public.is_admin())
)
with check (
  created_by = (select auth.uid())
  or (select public.is_admin())
);

drop policy if exists "Owners or admins can delete spectacles" on public.spectacles;

create policy "Owners or admins can delete spectacles"
on public.spectacles
for delete
to authenticated
using (
  created_by = (select auth.uid())
  or (select public.is_admin())
);
