-- Migration: Admin Views Security Hardening
-- Purpose: Create dedicated admin_views_owner role to isolate admin views
--          and prevent automatic privilege grants from DEFAULT PRIVILEGES
-- Affected Views: 7 admin views (communiques_presse_dashboard, *_admin)
-- Security Model: Role-based isolation + explicit privilege revocation

-- ============================================================================
-- PART 1: Create dedicated role for admin views ownership
-- ============================================================================

do $$
begin
  -- Create admin_views_owner role if it doesn't exist
  if not exists (
    select 1 
    from pg_roles 
    where rolname = 'admin_views_owner'
  ) then
    create role admin_views_owner nologin;
    raise notice 'Role admin_views_owner created';
  else
    raise notice 'Role admin_views_owner already exists';
  end if;
end
$$;

comment on role admin_views_owner is 
  'Dedicated role for owning admin views to prevent automatic privilege grants';

-- Grant postgres/service_role ability to SET ROLE to admin_views_owner
grant admin_views_owner to postgres;
grant admin_views_owner to service_role;

-- Grant necessary schema permissions to admin_views_owner
grant usage on schema public to admin_views_owner;
grant create on schema public to admin_views_owner;

-- ============================================================================
-- PART 2: Transfer ownership of 7 admin views
-- ============================================================================

-- 1. communiques_presse_dashboard (from 41_views_communiques.sql)
alter view if exists public.communiques_presse_dashboard 
  owner to admin_views_owner;

-- 2-5. Admin content version views (from 41_views_admin_content_versions.sql)
alter view if exists public.membres_equipe_admin 
  owner to admin_views_owner;

alter view if exists public.compagnie_presentation_sections_admin 
  owner to admin_views_owner;

alter view if exists public.partners_admin 
  owner to admin_views_owner;

alter view if exists public.content_versions_detailed 
  owner to admin_views_owner;

-- 6. messages_contact_admin (from 10_tables_system.sql)
alter view if exists public.messages_contact_admin 
  owner to admin_views_owner;

-- 7. analytics_summary (from 13_analytics_events.sql)
alter view if exists public.analytics_summary 
  owner to admin_views_owner;

-- ============================================================================
-- PART 3: Revoke all privileges from anon and authenticated roles
-- ============================================================================

-- Revoke on all 7 admin views
revoke all on public.communiques_presse_dashboard from anon, authenticated;
revoke all on public.membres_equipe_admin from anon, authenticated;
revoke all on public.compagnie_presentation_sections_admin from anon, authenticated;
revoke all on public.partners_admin from anon, authenticated;
revoke all on public.content_versions_detailed from anon, authenticated;
revoke all on public.messages_contact_admin from anon, authenticated;
revoke all on public.analytics_summary from anon, authenticated;

-- ============================================================================
-- PART 4: Grant SELECT to service_role only (admin backend access)
-- ============================================================================

grant select on public.communiques_presse_dashboard to service_role;
grant select on public.membres_equipe_admin to service_role;
grant select on public.compagnie_presentation_sections_admin to service_role;
grant select on public.partners_admin to service_role;
grant select on public.content_versions_detailed to service_role;
grant select on public.messages_contact_admin to service_role;
grant select on public.analytics_summary to service_role;

-- ============================================================================
-- PART 5: Modify DEFAULT PRIVILEGES for admin_views_owner role
-- ============================================================================

-- Future views/tables created by admin_views_owner will NOT have automatic grants
alter default privileges 
  for role admin_views_owner 
  in schema public 
  revoke all on tables from anon, authenticated;

comment on role admin_views_owner is 
  'Dedicated role for owning admin views. All views owned by this role:
   - Do NOT receive automatic SELECT grants to anon/authenticated
   - Are isolated from Supabase DEFAULT PRIVILEGES
   - Require explicit GRANT to service_role for admin backend access
   
   Currently owns 7 admin views:
   1. communiques_presse_dashboard
   2. membres_equipe_admin
   3. compagnie_presentation_sections_admin
   4. partners_admin
   5. content_versions_detailed
   6. messages_contact_admin
   7. analytics_summary';
