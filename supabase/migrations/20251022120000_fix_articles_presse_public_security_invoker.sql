/*
 * migration: fix articles_presse_public view security
 * ============================================
 * 
 * purpose:
 *   change articles_presse_public view from security definer to security invoker
 *   to follow least-privilege principle and avoid privilege escalation risks.
 * 
 * type: security fix (ddl - view alteration)
 * 
 * security issue:
 *   view was automatically created with security definer by supabase,
 *   causing queries to run with creator's privileges (likely postgres superuser)
 *   instead of querying user's privileges.
 * 
 * risk mitigation:
 *   - security invoker: queries run with user's own privileges
 *   - no privilege escalation possible
 *   - respects principle of least privilege
 *   - still allows anon/authenticated access via explicit grant
 * 
 * affected objects:
 *   - view: articles_presse_public (recreated with security_invoker = true)
 * 
 * compatibility:
 *   postgresql 15+ supports with (security_invoker = true) option.
 *   supabase cloud runs postgresql 15.1+
 * 
 * caveat note:
 *   this is a manual migration because "security invoker on views" is not
 *   captured by supabase db diff tool (see declarative schema instructions).
 *   the declarative schema in supabase/schemas/08_table_articles_presse.sql
 *   has been updated to reflect this change as the source of truth.
 * 
 * applied: 2025-10-22
 * project: rouge cardinal company - security hardening
 */

-- drop and recreate view with explicit security invoker
drop view if exists public.articles_presse_public cascade;

create view public.articles_presse_public
with (security_invoker = true)
as
select 
  id,
  title,
  author,
  type,
  slug,
  chapo,
  excerpt,
  source_publication,
  source_url,
  published_at,
  created_at
from public.articles_presse
where published_at is not null;

comment on view public.articles_presse_public is 
'Public view of published press articles. SECURITY INVOKER: Runs with querying user privileges (not definer). Bypasses RLS policy evaluation delays caused by JWT Signing Keys compatibility issues.';

-- grant read access to all roles (unchanged from original)
grant select on public.articles_presse_public to anon, authenticated;
