-- Migration: Fix missing media tags/folders grants and align role helpers with JWT source of truth
-- Purpose:
--   1. Grant authenticated role access to media_tags, media_folders, media_item_tags
--      (tables were created with RLS but no table-level grants).
--   2. Rewrite public.is_admin() and public.has_min_role() to read role from
--      the signed JWT app_metadata first, falling back to public.profiles.role.
--      This fixes Storage RLS (and other RLS) denials when app_metadata.role
--      is authoritative but profiles.role is stale or missing.
-- Affected tables: public.media_tags, public.media_folders, public.media_item_tags
-- Affected functions: public.is_admin(), public.has_min_role(text)
-- RLS: No policy changes
-- Special: Hotfix-style migration; declarative schema synchronized.

-- =============================================================================
-- GRANTS: media taxonomy and folder tables
-- =============================================================================

grant select on public.media_tags to authenticated;
grant insert, update, delete on public.media_tags to authenticated;

grant select on public.media_folders to authenticated;
grant insert, update, delete on public.media_folders to authenticated;

grant select on public.media_item_tags to authenticated;
grant insert, update, delete on public.media_item_tags to authenticated;

-- =============================================================================
-- ROLE HELPERS: align with JWT app_metadata.role (source of truth)
-- =============================================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce(
    auth.jwt()->'app_metadata'->>'role',
    (select p.role from public.profiles p where p.user_id = auth.uid())
  ) = 'admin';
$$;

create or replace function public.has_min_role(required_role text)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select (
    case coalesce(
      auth.jwt()->'app_metadata'->>'role',
      (select p.role from public.profiles p where p.user_id = auth.uid())
    )
      when 'admin' then 2
      when 'editor' then 1
      else 0
    end
  ) >=
  case required_role
    when 'admin' then 2
    when 'editor' then 1
    when 'user' then 0
    else 3
  end;
$$;
