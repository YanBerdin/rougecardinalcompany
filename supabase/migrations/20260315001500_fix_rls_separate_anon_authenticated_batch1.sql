-- Migration: Fix RLS policies — separate combined anon+authenticated into distinct per-role policies
-- Purpose: Resolve MIG-005 violations — one policy per operation per role (TASK077 batch 1)
-- Affected tables: profiles, medias, spectacles, evenements, partners, categories, tags,
--   spectacles_categories, spectacles_tags, articles_categories, articles_tags,
--   sitemap_entries, articles_presse
-- Special: Manual migration (not auto-generated via diff) because supabase db diff picks up
--   unrelated changes from other schema files (analytics_events hotfix, view rebuilds, etc.)
--   Declarative schema files in supabase/schemas/ are the source of truth.

-- =============================================================================
-- PROFILES (60_rls_profiles.sql)
-- =============================================================================

-- Drop the combined policy
drop policy if exists "Profiles are viewable by everyone" on public.profiles;

-- Create separate per-role policies
create policy "Anon can view profiles"
on public.profiles
for select
to anon
using ( true );

create policy "Authenticated can view profiles"
on public.profiles
for select
to authenticated
using ( true );

-- =============================================================================
-- MEDIAS (61_rls_main_tables.sql)
-- =============================================================================

drop policy if exists "Medias are viewable by everyone" on public.medias;

create policy "Anon can view medias"
on public.medias
for select
to anon
using ( true );

create policy "Authenticated can view medias"
on public.medias
for select
to authenticated
using ( true );

-- =============================================================================
-- SPECTACLES (61_rls_main_tables.sql) — P1: different logic per role
-- =============================================================================

-- Drop old combined SELECT policies (pre-TASK076 and TASK076 names)
drop policy if exists "View spectacles (public published/archived OR admin all)" on public.spectacles;
drop policy if exists "View spectacles (public published/archived OR editor+ all)" on public.spectacles;

-- anon: only public + published/archived (no function evaluation)
create policy "Anon can view public spectacles"
on public.spectacles
for select
to anon
using ( public = true and status in ('published', 'archived') );

-- authenticated: public + published/archived OR editor+ sees everything
create policy "Authenticated can view spectacles"
on public.spectacles
for select
to authenticated
using (
  (public = true and status in ('published', 'archived'))
  or (select public.has_min_role('editor'))
);

-- Cleanup: rename INSERT policy from TASK076 (Admins → Editors+)
-- The schema defines "Editors+ can create spectacles" but DB may still have "Admins can create spectacles"
drop policy if exists "Admins can create spectacles" on public.spectacles;
-- Only create if not already present (TASK076 migration may have already created it)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'spectacles'
      and policyname = 'Editors+ can create spectacles'
  ) then
    execute $policy$
      create policy "Editors+ can create spectacles"
      on public.spectacles
      for insert
      to authenticated
      with check ( (select public.has_min_role('editor')) )
    $policy$;
  end if;
end
$$;

-- =============================================================================
-- EVENEMENTS (61_rls_main_tables.sql)
-- =============================================================================

drop policy if exists "Events are viewable by everyone" on public.evenements;

create policy "Anon can view events"
on public.evenements
for select
to anon
using ( true );

create policy "Authenticated can view events"
on public.evenements
for select
to authenticated
using ( true );

-- =============================================================================
-- PARTNERS (61_rls_main_tables.sql) — P1: different logic per role
-- =============================================================================

drop policy if exists "View partners (active public OR admin all)" on public.partners;

-- anon: only active partners (no is_admin() evaluation)
create policy "Anon can view active partners"
on public.partners
for select
to anon
using ( is_active = true );

-- authenticated: active OR admin sees all
create policy "Authenticated can view partners"
on public.partners
for select
to authenticated
using ( is_active = true or (select public.is_admin()) );

-- =============================================================================
-- CATEGORIES (62_rls_advanced_tables.sql) — P1: different logic per role
-- =============================================================================

drop policy if exists "View categories (active OR editor+)" on public.categories;

-- anon: only active categories (no has_min_role evaluation)
create policy "Anon can view active categories"
on public.categories
for select
to anon
using ( is_active = true );

-- authenticated: active OR editor+ sees all
create policy "Authenticated can view categories"
on public.categories
for select
to authenticated
using ( is_active = true or (select public.has_min_role('editor')) );

-- =============================================================================
-- TAGS (62_rls_advanced_tables.sql)
-- =============================================================================

drop policy if exists "Tags are viewable by everyone" on public.tags;

create policy "Anon can view tags"
on public.tags
for select
to anon
using ( true );

create policy "Authenticated can view tags"
on public.tags
for select
to authenticated
using ( true );

-- =============================================================================
-- SPECTACLES_CATEGORIES (62_rls_advanced_tables.sql)
-- =============================================================================

drop policy if exists "Spectacle category relations are viewable by everyone" on public.spectacles_categories;

create policy "Anon can view spectacle category relations"
on public.spectacles_categories
for select
to anon
using ( true );

create policy "Authenticated can view spectacle category relations"
on public.spectacles_categories
for select
to authenticated
using ( true );

-- =============================================================================
-- SPECTACLES_TAGS (62_rls_advanced_tables.sql)
-- =============================================================================

drop policy if exists "Spectacle tag relations are viewable by everyone" on public.spectacles_tags;

create policy "Anon can view spectacle tag relations"
on public.spectacles_tags
for select
to anon
using ( true );

create policy "Authenticated can view spectacle tag relations"
on public.spectacles_tags
for select
to authenticated
using ( true );

-- =============================================================================
-- ARTICLES_CATEGORIES (62_rls_advanced_tables.sql)
-- =============================================================================

drop policy if exists "Article category relations are viewable by everyone" on public.articles_categories;

create policy "Anon can view article category relations"
on public.articles_categories
for select
to anon
using ( true );

create policy "Authenticated can view article category relations"
on public.articles_categories
for select
to authenticated
using ( true );

-- =============================================================================
-- ARTICLES_TAGS (62_rls_advanced_tables.sql)
-- =============================================================================

drop policy if exists "Article tag relations are viewable by everyone" on public.articles_tags;

create policy "Anon can view article tag relations"
on public.articles_tags
for select
to anon
using ( true );

create policy "Authenticated can view article tag relations"
on public.articles_tags
for select
to authenticated
using ( true );

-- =============================================================================
-- SITEMAP_ENTRIES (62_rls_advanced_tables.sql)
-- =============================================================================

drop policy if exists "Sitemap entries are viewable by everyone" on public.sitemap_entries;

create policy "Anon can view sitemap entries"
on public.sitemap_entries
for select
to anon
using ( is_indexed = true );

create policy "Authenticated can view sitemap entries"
on public.sitemap_entries
for select
to authenticated
using ( is_indexed = true );

-- =============================================================================
-- ARTICLES_PRESSE (08_table_articles_presse.sql)
-- =============================================================================

drop policy if exists "Public press articles are viewable by everyone" on public.articles_presse;

create policy "Anon can view published press articles"
on public.articles_presse
for select
to anon
using ( published_at is not null );

create policy "Authenticated can view published press articles"
on public.articles_presse
for select
to authenticated
using ( published_at is not null );
