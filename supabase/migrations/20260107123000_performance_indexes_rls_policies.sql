-- Migration: performance_indexes_rls_policies
-- Purpose: ajouter index couvrants pour FK, optimiser policies RLS (initplan), fusionner policies permissives
-- Affected files: supabase/schemas/40_indexes.sql, 61_rls_main_tables.sql, 07d_table_home_hero.sql, 07c_table_compagnie_presentation.sql, 04_table_membres_equipe.sql, 08b_communiques_presse.sql
-- Notes: cette migration est idempotente; utilise create index concurrently if not exists et drop/create policy.

-- ============================================
-- PART 1: ADD FK COVERING INDEXES
-- Impact: amélioration immédiate des performances de JOINs
-- ============================================

-- relations vers medias.id (haute fréquence d'accès)
create index if not exists idx_articles_presse_og_image_media_id on public.articles_presse (og_image_media_id);
create index if not exists idx_compagnie_presentation_sections_image_media_id on public.compagnie_presentation_sections (image_media_id);
create index if not exists idx_home_about_content_image_media_id on public.home_about_content (image_media_id);
create index if not exists idx_home_hero_slides_image_media_id on public.home_hero_slides (image_media_id);
create index if not exists idx_membres_equipe_photo_media_id on public.membres_equipe (photo_media_id);
create index if not exists idx_partners_logo_media_id on public.partners (logo_media_id);
create index if not exists idx_spectacles_og_image_media_id on public.spectacles (og_image_media_id);

-- tables de jonction media
create index if not exists idx_articles_medias_media_id on public.articles_medias (media_id);
create index if not exists idx_communiques_medias_media_id on public.communiques_medias (media_id);
create index if not exists idx_spectacles_medias_media_id on public.spectacles_medias (media_id);

-- relations category (categories.id)
create index if not exists idx_articles_categories_category_id on public.articles_categories (category_id);
create index if not exists idx_communiques_categories_category_id on public.communiques_categories (category_id);
create index if not exists idx_spectacles_categories_category_id on public.spectacles_categories (category_id);

-- relations tags (tags.id)
create index if not exists idx_articles_tags_tag_id on public.articles_tags (tag_id);
create index if not exists idx_communiques_tags_tag_id on public.communiques_tags (tag_id);
create index if not exists idx_spectacles_tags_tag_id on public.spectacles_tags (tag_id);

-- relations user/admin (created_by/updated_by audit)
create index if not exists idx_categories_created_by on public.categories (created_by);
create index if not exists idx_configurations_site_updated_by on public.configurations_site (updated_by);
create index if not exists idx_contacts_presse_created_by on public.contacts_presse (created_by);
create index if not exists idx_seo_redirects_created_by on public.seo_redirects (created_by);
create index if not exists idx_tags_created_by on public.tags (created_by);

-- relations event/team
create index if not exists idx_communiques_presse_evenement_id on public.communiques_presse (evenement_id);
create index if not exists idx_evenements_lieu_id on public.evenements (lieu_id);
create index if not exists idx_spectacles_membres_equipe_membre_id on public.spectacles_membres_equipe (membre_id);


-- ============================================
-- PART 2: OPTIMIZE RLS POLICIES (initPlan)
-- Impact: evaluation une fois par requête au lieu de par ligne
-- ============================================

-- spectacles: remplacer policies séparées par policy fusionnée utilisant (select auth.uid())
drop policy if exists "Public spectacles are viewable by everyone" on public.spectacles;
drop policy if exists "Admins can view all spectacles" on public.spectacles;
create policy "View spectacles (public published OR admin all)"
  on public.spectacles for select
  to anon, authenticated
  using (
    (status = 'published' and public = true)
    or exists (
      select 1 from public.profiles where user_id = (select auth.uid()) and role = 'admin'
    )
  );

-- spectacles: insert (admins only)
drop policy if exists "Authenticated users can create spectacles" on public.spectacles;
drop policy if exists "Admins can create spectacles" on public.spectacles;
create policy "Admins can create spectacles"
  on public.spectacles for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles where user_id = (select auth.uid()) and role = 'admin'
    )
  );

-- spectacles: update/delete (owners or admins)
drop policy if exists "Owners or admins can update spectacles" on public.spectacles;
drop policy if exists "Owners or admins can delete spectacles" on public.spectacles;
create policy "Owners or admins can update spectacles"
  on public.spectacles for update
  to authenticated
  using (
    (created_by = (select auth.uid()))
    or exists (
      select 1 from public.profiles where user_id = (select auth.uid()) and role = 'admin'
    )
  )
  with check (
    (created_by = (select auth.uid()))
    or exists (
      select 1 from public.profiles where user_id = (select auth.uid()) and role = 'admin'
    )
  );

create policy "Owners or admins can delete spectacles"
  on public.spectacles for delete
  to authenticated
  using (
    (created_by = (select auth.uid()))
    or exists (
      select 1 from public.profiles where user_id = (select auth.uid()) and role = 'admin'
    )
  );

-- home_hero_slides: combined select policy
drop policy if exists "Home hero slides are viewable by everyone" on public.home_hero_slides;
drop policy if exists "Admins can view all home hero slides" on public.home_hero_slides;
create policy "View home hero slides (public active OR admin all)"
  on public.home_hero_slides for select
  to anon, authenticated
  using (
    (
      active = true and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at >= now())
    )
    or (select public.is_admin())
  );

-- compagnie_presentation_sections: combined select policy
drop policy if exists "Active presentation sections are viewable by everyone" on public.compagnie_presentation_sections;
drop policy if exists "Admins can view all presentation sections" on public.compagnie_presentation_sections;
create policy "View presentation sections (public active OR admin all)"
  on public.compagnie_presentation_sections for select
  to anon, authenticated
  using ( active = true or (select public.is_admin()) );

-- membres_equipe: combined select policy
drop policy if exists "Active team members are viewable by everyone" on public.membres_equipe;
drop policy if exists "Admins can view all team members" on public.membres_equipe;
create policy "View team members (public active OR admin all)"
  on public.membres_equipe for select
  to anon, authenticated
  using ( active = true or (select public.is_admin()) );

-- communiques_presse: combined select policy
drop policy if exists "Public press releases are viewable by everyone" on public.communiques_presse;
drop policy if exists "Admins can view all press releases" on public.communiques_presse;
create policy "View press releases (public OR admin all)"
  on public.communiques_presse for select
  to anon, authenticated
  using ( public = true or (select public.is_admin()) );

-- partners: combined select policy
drop policy if exists "Public partners are viewable by anyone" on public.partners;
drop policy if exists "Admins can view all partners" on public.partners;
create policy "View partners (active public OR admin all)"
  on public.partners for select
  to anon, authenticated
  using ( is_active = true or (select public.is_admin()) );

-- ============================================
-- PART 3: DROP UNUSED INDEXES (manual validation required)
-- WARNING: only drop indexes after confirming idx_scan = 0 via pg_stat_user_indexes
-- ============================================

-- Candidates (review required before applying in production):
-- drop index concurrently if exists idx_evenements_recurrence_id;
-- drop index concurrently if exists idx_evenements_is_recurrent;
-- drop index concurrently if exists idx_analytics_events_created_at;
-- drop index concurrently if exists idx_seo_redirects_old_path;
-- drop index concurrently if exists idx_seo_redirects_active;

-- ============================================
-- PART 4: NOTES & VALIDATION
-- ============================================
-- 1) run scripts/check_unused_indexes.sql on target DB to list idx_scan=0
-- 2) review each candidate index before enabling DROP commands above
-- 3) run security checks: pnpm exec tsx scripts/check-views-security.ts
-- 4) run benchmarks (explain analyze) as documented in doc/PERFORMANCE_OPTIMIZATION_2026-01-07.md

-- fin de la migration
