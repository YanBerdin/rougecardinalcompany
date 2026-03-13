-- Migration: Editor Role RLS Policies
-- Purpose: Migrate editorial table RLS policies from is_admin() to has_min_role('editor')
-- Affected tables: 27 editorial tables (spectacles, events, media, press, compagnie, etc.)
-- NOT affected: admin-only tables (partners, contacts_presse, membres_equipe, hero_slides,
--   configurations_site, analytics_events, seo_redirects, sitemap_entries, newsletter, audit)
-- Prerequisite: has_min_role() function must exist (created in prior migration)

begin;

-- ============================================================
-- 1. LIEUX
-- ============================================================

-- Note: lieux schema used self-referencing drop names (no "Admins can..." predecessor on prod)
drop policy if exists "Admins can create lieux" on public.lieux;
drop policy if exists "Editors+ can create lieux" on public.lieux;
create policy "Editors+ can create lieux"
on public.lieux
for insert
to authenticated
with check ( (select public.has_min_role('editor')) );

drop policy if exists "Admins can update lieux" on public.lieux;
drop policy if exists "Editors+ can update lieux" on public.lieux;
create policy "Editors+ can update lieux"
on public.lieux
for update
to authenticated
using ( (select public.has_min_role('editor')) )
with check ( (select public.has_min_role('editor')) );

drop policy if exists "Admins can delete lieux" on public.lieux;
drop policy if exists "Editors+ can delete lieux" on public.lieux;
create policy "Editors+ can delete lieux"
on public.lieux
for delete
to authenticated
using ( (select public.has_min_role('editor')) );

-- ============================================================
-- 2. COMPAGNIE VALUES
-- ============================================================

drop policy if exists "Admins can insert compagnie values" on public.compagnie_values;
drop policy if exists "Editors+ can insert compagnie values" on public.compagnie_values;
create policy "Editors+ can insert compagnie values"
on public.compagnie_values
for insert
to authenticated
with check ( (select public.has_min_role('editor')) );

drop policy if exists "Admins can update compagnie values" on public.compagnie_values;
drop policy if exists "Editors+ can update compagnie values" on public.compagnie_values;
create policy "Editors+ can update compagnie values"
on public.compagnie_values
for update
to authenticated
using ( (select public.has_min_role('editor')) )
with check ( (select public.has_min_role('editor')) );

drop policy if exists "Admins can delete compagnie values" on public.compagnie_values;
drop policy if exists "Editors+ can delete compagnie values" on public.compagnie_values;
create policy "Editors+ can delete compagnie values"
on public.compagnie_values
for delete
to authenticated
using ( (select public.has_min_role('editor')) );

-- ============================================================
-- 3. COMPAGNIE STATS
-- ============================================================

drop policy if exists "Admins can insert compagnie stats" on public.compagnie_stats;
drop policy if exists "Editors+ can insert compagnie stats" on public.compagnie_stats;
create policy "Editors+ can insert compagnie stats"
on public.compagnie_stats
for insert
to authenticated
with check ( (select public.has_min_role('editor')) );

drop policy if exists "Admins can update compagnie stats" on public.compagnie_stats;
drop policy if exists "Editors+ can update compagnie stats" on public.compagnie_stats;
create policy "Editors+ can update compagnie stats"
on public.compagnie_stats
for update
to authenticated
using ( (select public.has_min_role('editor')) )
with check ( (select public.has_min_role('editor')) );

drop policy if exists "Admins can delete compagnie stats" on public.compagnie_stats;
drop policy if exists "Editors+ can delete compagnie stats" on public.compagnie_stats;
create policy "Editors+ can delete compagnie stats"
on public.compagnie_stats
for delete
to authenticated
using ( (select public.has_min_role('editor')) );

-- ============================================================
-- 4. COMPAGNIE PRESENTATION SECTIONS
-- ============================================================

-- SELECT: merge two old policies into one combined policy
drop policy if exists "Active presentation sections are viewable by everyone" on public.compagnie_presentation_sections;
drop policy if exists "Admins can view all presentation sections" on public.compagnie_presentation_sections;
drop policy if exists "View presentation sections (public active OR editor+ all)" on public.compagnie_presentation_sections;
create policy "View presentation sections (public active OR editor+ all)"
on public.compagnie_presentation_sections
for select
to anon, authenticated
using (
  active = true
  or (select public.has_min_role('editor'))
);

drop policy if exists "Admins can insert compagnie presentation sections" on public.compagnie_presentation_sections;
drop policy if exists "Editors+ can insert compagnie presentation sections" on public.compagnie_presentation_sections;
create policy "Editors+ can insert compagnie presentation sections"
on public.compagnie_presentation_sections
for insert
to authenticated
with check ( (select public.has_min_role('editor')) );

drop policy if exists "Admins can update compagnie presentation sections" on public.compagnie_presentation_sections;
drop policy if exists "Editors+ can update compagnie presentation sections" on public.compagnie_presentation_sections;
create policy "Editors+ can update compagnie presentation sections"
on public.compagnie_presentation_sections
for update
to authenticated
using ( (select public.has_min_role('editor')) )
with check ( (select public.has_min_role('editor')) );

drop policy if exists "Admins can delete compagnie presentation sections" on public.compagnie_presentation_sections;
drop policy if exists "Editors+ can delete compagnie presentation sections" on public.compagnie_presentation_sections;
create policy "Editors+ can delete compagnie presentation sections"
on public.compagnie_presentation_sections
for delete
to authenticated
using ( (select public.has_min_role('editor')) );

-- ============================================================
-- 5. ARTICLES PRESSE
-- ============================================================

drop policy if exists "Admins can view all press articles" on public.articles_presse;
drop policy if exists "Editors+ can view all press articles" on public.articles_presse;
create policy "Editors+ can view all press articles"
on public.articles_presse
for select
to authenticated
using ( (select public.has_min_role('editor')) );

drop policy if exists "Admins can create press articles" on public.articles_presse;
drop policy if exists "Editors+ can create press articles" on public.articles_presse;
create policy "Editors+ can create press articles"
on public.articles_presse
for insert
to authenticated
with check ( (select public.has_min_role('editor')) );

drop policy if exists "Admins can update press articles" on public.articles_presse;
drop policy if exists "Editors+ can update press articles" on public.articles_presse;
create policy "Editors+ can update press articles"
on public.articles_presse
for update
to authenticated
using ( (select public.has_min_role('editor')) )
with check ( (select public.has_min_role('editor')) );

drop policy if exists "Admins can delete press articles" on public.articles_presse;
drop policy if exists "Editors+ can delete press articles" on public.articles_presse;
create policy "Editors+ can delete press articles"
on public.articles_presse
for delete
to authenticated
using ( (select public.has_min_role('editor')) );

-- ============================================================
-- 6. COMMUNIQUES PRESSE (not contacts_presse — those stay admin)
-- ============================================================

-- SELECT: merge two old policies into one combined policy
drop policy if exists "Public press releases are viewable by everyone" on public.communiques_presse;
drop policy if exists "Admins can view all press releases" on public.communiques_presse;
drop policy if exists "View press releases (public OR editor+ all)" on public.communiques_presse;
create policy "View press releases (public OR editor+ all)"
on public.communiques_presse
for select
to anon, authenticated
using (
  public = true
  or (select public.has_min_role('editor'))
);

drop policy if exists "Admins can create press releases" on public.communiques_presse;
drop policy if exists "Editors+ can create press releases" on public.communiques_presse;
create policy "Editors+ can create press releases"
on public.communiques_presse
for insert
to authenticated
with check ( (select public.has_min_role('editor')) );

drop policy if exists "Admins can update press releases" on public.communiques_presse;
drop policy if exists "Editors+ can update press releases" on public.communiques_presse;
create policy "Editors+ can update press releases"
on public.communiques_presse
for update
to authenticated
using ( (select public.has_min_role('editor')) )
with check ( (select public.has_min_role('editor')) );

drop policy if exists "Admins can delete press releases" on public.communiques_presse;
drop policy if exists "Editors+ can delete press releases" on public.communiques_presse;
create policy "Editors+ can delete press releases"
on public.communiques_presse
for delete
to authenticated
using ( (select public.has_min_role('editor')) );

-- ============================================================
-- 7. MEDIAS (update/delete only — insert stays auth.uid() check)
-- ============================================================

drop policy if exists "Uploaders or admins can update medias" on public.medias;
drop policy if exists "Uploaders or editors+ can update medias" on public.medias;
create policy "Uploaders or editors+ can update medias"
on public.medias
for update
to authenticated
using ( uploaded_by = (select auth.uid()) or (select public.has_min_role('editor')) )
with check ( uploaded_by = (select auth.uid()) or (select public.has_min_role('editor')) );

drop policy if exists "Uploaders or admins can delete medias" on public.medias;
drop policy if exists "Uploaders or editors+ can delete medias" on public.medias;
create policy "Uploaders or editors+ can delete medias"
on public.medias
for delete
to authenticated
using ( uploaded_by = (select auth.uid()) or (select public.has_min_role('editor')) );

-- ============================================================
-- 8. SPECTACLES
-- ============================================================

-- SELECT: merge old policies into combined policy
drop policy if exists "Public spectacles are viewable by everyone" on public.spectacles;
drop policy if exists "Admins can view all spectacles" on public.spectacles;
drop policy if exists "View spectacles (public published OR admin all)" on public.spectacles;
drop policy if exists "View spectacles (public published/archived OR editor+ all)" on public.spectacles;
create policy "View spectacles (public published/archived OR editor+ all)"
on public.spectacles
for select
to anon, authenticated
using (
  (
    public = true
    and status in ('published', 'archived')
  )
  or
  (select public.has_min_role('editor'))
);

drop policy if exists "Authenticated users can create spectacles" on public.spectacles;
drop policy if exists "Editors+ can create spectacles" on public.spectacles;
create policy "Editors+ can create spectacles"
on public.spectacles
for insert
to authenticated
with check ( (select public.has_min_role('editor')) );

drop policy if exists "Owners or admins can update spectacles" on public.spectacles;
drop policy if exists "Owners or editors+ can update spectacles" on public.spectacles;
create policy "Owners or editors+ can update spectacles"
on public.spectacles
for update
to authenticated
using (
  created_by = (select auth.uid())
  or (select public.has_min_role('editor'))
)
with check (
  created_by = (select auth.uid())
  or (select public.has_min_role('editor'))
);

drop policy if exists "Owners or admins can delete spectacles" on public.spectacles;
drop policy if exists "Owners or editors+ can delete spectacles" on public.spectacles;
create policy "Owners or editors+ can delete spectacles"
on public.spectacles
for delete
to authenticated
using (
  created_by = (select auth.uid())
  or (select public.has_min_role('editor'))
);

-- ============================================================
-- 9. EVENEMENTS
-- ============================================================

drop policy if exists "Admins can create events" on public.evenements;
drop policy if exists "Editors+ can create events" on public.evenements;
create policy "Editors+ can create events"
on public.evenements
for insert
to authenticated
with check ( (select public.has_min_role('editor')) );

drop policy if exists "Admins can update events" on public.evenements;
drop policy if exists "Editors+ can update events" on public.evenements;
create policy "Editors+ can update events"
on public.evenements
for update
to authenticated
using ( (select public.has_min_role('editor')) )
with check ( (select public.has_min_role('editor')) );

drop policy if exists "Admins can delete events" on public.evenements;
drop policy if exists "Editors+ can delete events" on public.evenements;
create policy "Editors+ can delete events"
on public.evenements
for delete
to authenticated
using ( (select public.has_min_role('editor')) );

-- ============================================================
-- 10. MEDIA TAGS
-- ============================================================

drop policy if exists "Admins can insert media tags" on public.media_tags;
drop policy if exists "Editors+ can insert media tags" on public.media_tags;
create policy "Editors+ can insert media tags"
on public.media_tags
for insert
to authenticated
with check ( (select public.has_min_role('editor')) );

drop policy if exists "Admins can update media tags" on public.media_tags;
drop policy if exists "Editors+ can update media tags" on public.media_tags;
create policy "Editors+ can update media tags"
on public.media_tags
for update
to authenticated
using ( (select public.has_min_role('editor')) )
with check ( (select public.has_min_role('editor')) );

drop policy if exists "Admins can delete media tags" on public.media_tags;
drop policy if exists "Editors+ can delete media tags" on public.media_tags;
create policy "Editors+ can delete media tags"
on public.media_tags
for delete
to authenticated
using ( (select public.has_min_role('editor')) );

-- ============================================================
-- 11. MEDIA FOLDERS
-- ============================================================

drop policy if exists "Admins can insert media folders" on public.media_folders;
drop policy if exists "Editors+ can insert media folders" on public.media_folders;
create policy "Editors+ can insert media folders"
on public.media_folders
for insert
to authenticated
with check ( (select public.has_min_role('editor')) );

drop policy if exists "Admins can update media folders" on public.media_folders;
drop policy if exists "Editors+ can update media folders" on public.media_folders;
create policy "Editors+ can update media folders"
on public.media_folders
for update
to authenticated
using ( (select public.has_min_role('editor')) )
with check ( (select public.has_min_role('editor')) );

drop policy if exists "Admins can delete media folders" on public.media_folders;
drop policy if exists "Editors+ can delete media folders" on public.media_folders;
create policy "Editors+ can delete media folders"
on public.media_folders
for delete
to authenticated
using ( (select public.has_min_role('editor')) );

-- ============================================================
-- 12. MEDIA ITEM TAGS
-- ============================================================

drop policy if exists "Admins can insert media item tags" on public.media_item_tags;
drop policy if exists "Editors+ can insert media item tags" on public.media_item_tags;
create policy "Editors+ can insert media item tags"
on public.media_item_tags
for insert
to authenticated
with check ( (select public.has_min_role('editor')) );

drop policy if exists "Admins can update media item tags" on public.media_item_tags;
drop policy if exists "Editors+ can update media item tags" on public.media_item_tags;
create policy "Editors+ can update media item tags"
on public.media_item_tags
for update
to authenticated
using ( (select public.has_min_role('editor')) )
with check ( (select public.has_min_role('editor')) );

drop policy if exists "Admins can delete media item tags" on public.media_item_tags;
drop policy if exists "Editors+ can delete media item tags" on public.media_item_tags;
create policy "Editors+ can delete media item tags"
on public.media_item_tags
for delete
to authenticated
using ( (select public.has_min_role('editor')) );

-- ============================================================
-- 13. SPECTACLES_MEMBRES_EQUIPE (junction)
-- ============================================================

drop policy if exists "Admins can insert spectacle member relations" on public.spectacles_membres_equipe;
drop policy if exists "Editors+ can insert spectacle member relations" on public.spectacles_membres_equipe;
create policy "Editors+ can insert spectacle member relations"
on public.spectacles_membres_equipe
for insert
to authenticated
with check ( (select public.has_min_role('editor')) );

drop policy if exists "Admins can update spectacle member relations" on public.spectacles_membres_equipe;
drop policy if exists "Editors+ can update spectacle member relations" on public.spectacles_membres_equipe;
create policy "Editors+ can update spectacle member relations"
on public.spectacles_membres_equipe
for update
to authenticated
using ( (select public.has_min_role('editor')) )
with check ( (select public.has_min_role('editor')) );

drop policy if exists "Admins can delete spectacle member relations" on public.spectacles_membres_equipe;
drop policy if exists "Editors+ can delete spectacle member relations" on public.spectacles_membres_equipe;
create policy "Editors+ can delete spectacle member relations"
on public.spectacles_membres_equipe
for delete
to authenticated
using ( (select public.has_min_role('editor')) );

-- ============================================================
-- 14. SPECTACLES_MEDIAS (junction)
-- ============================================================

drop policy if exists "Admins can insert spectacle media relations" on public.spectacles_medias;
drop policy if exists "Editors+ can insert spectacle media relations" on public.spectacles_medias;
create policy "Editors+ can insert spectacle media relations"
on public.spectacles_medias
for insert
to authenticated
with check ( (select public.has_min_role('editor')) );

drop policy if exists "Admins can update spectacle media relations" on public.spectacles_medias;
drop policy if exists "Editors+ can update spectacle media relations" on public.spectacles_medias;
create policy "Editors+ can update spectacle media relations"
on public.spectacles_medias
for update
to authenticated
using ( (select public.has_min_role('editor')) )
with check ( (select public.has_min_role('editor')) );

drop policy if exists "Admins can delete spectacle media relations" on public.spectacles_medias;
drop policy if exists "Editors+ can delete spectacle media relations" on public.spectacles_medias;
create policy "Editors+ can delete spectacle media relations"
on public.spectacles_medias
for delete
to authenticated
using ( (select public.has_min_role('editor')) );

-- ============================================================
-- 15. ARTICLES_MEDIAS (junction)
-- ============================================================

drop policy if exists "Admins can insert article media relations" on public.articles_medias;
drop policy if exists "Editors+ can insert article media relations" on public.articles_medias;
create policy "Editors+ can insert article media relations"
on public.articles_medias
for insert
to authenticated
with check ( (select public.has_min_role('editor')) );

drop policy if exists "Admins can update article media relations" on public.articles_medias;
drop policy if exists "Editors+ can update article media relations" on public.articles_medias;
create policy "Editors+ can update article media relations"
on public.articles_medias
for update
to authenticated
using ( (select public.has_min_role('editor')) )
with check ( (select public.has_min_role('editor')) );

drop policy if exists "Admins can delete article media relations" on public.articles_medias;
drop policy if exists "Editors+ can delete article media relations" on public.articles_medias;
create policy "Editors+ can delete article media relations"
on public.articles_medias
for delete
to authenticated
using ( (select public.has_min_role('editor')) );

-- ============================================================
-- 16. COMMUNIQUES_MEDIAS (junction)
-- ============================================================

-- SELECT: parent visibility with editor+ fallback
drop policy if exists "Press release media relations follow parent visibility" on public.communiques_medias;
create policy "Press release media relations follow parent visibility"
on public.communiques_medias
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.communiques_presse as cp
    where cp.id = communique_id
      and (cp.public = true or (select public.has_min_role('editor')))
  )
);

drop policy if exists "Admins can insert press release media relations" on public.communiques_medias;
drop policy if exists "Editors+ can insert press release media relations" on public.communiques_medias;
create policy "Editors+ can insert press release media relations"
on public.communiques_medias
for insert
to authenticated
with check ( (select public.has_min_role('editor')) );

drop policy if exists "Admins can update press release media relations" on public.communiques_medias;
drop policy if exists "Editors+ can update press release media relations" on public.communiques_medias;
create policy "Editors+ can update press release media relations"
on public.communiques_medias
for update
to authenticated
using ( (select public.has_min_role('editor')) )
with check ( (select public.has_min_role('editor')) );

drop policy if exists "Admins can delete press release media relations" on public.communiques_medias;
drop policy if exists "Editors+ can delete press release media relations" on public.communiques_medias;
create policy "Editors+ can delete press release media relations"
on public.communiques_medias
for delete
to authenticated
using ( (select public.has_min_role('editor')) );

-- ============================================================
-- 17. CATEGORIES
-- ============================================================

-- SELECT: combined active OR editor+ policy
drop policy if exists "Active categories are viewable by everyone" on public.categories;
drop policy if exists "Admins can view all categories" on public.categories;
drop policy if exists "View categories (active OR admin)" on public.categories;
drop policy if exists "View categories (active OR editor+)" on public.categories;
create policy "View categories (active OR editor+)"
on public.categories
for select
to anon, authenticated
using ( is_active = true or (select public.has_min_role('editor')) );

drop policy if exists "Admins can create categories" on public.categories;
drop policy if exists "Editors+ can create categories" on public.categories;
create policy "Editors+ can create categories"
on public.categories
for insert
to authenticated
with check ( (select public.has_min_role('editor')) );

drop policy if exists "Admins can update categories" on public.categories;
drop policy if exists "Editors+ can update categories" on public.categories;
create policy "Editors+ can update categories"
on public.categories
for update
to authenticated
using ( (select public.has_min_role('editor')) )
with check ( (select public.has_min_role('editor')) );

drop policy if exists "Admins can delete categories" on public.categories;
drop policy if exists "Editors+ can delete categories" on public.categories;
create policy "Editors+ can delete categories"
on public.categories
for delete
to authenticated
using ( (select public.has_min_role('editor')) );

-- ============================================================
-- 18. TAGS
-- ============================================================

drop policy if exists "Admins can create tags" on public.tags;
drop policy if exists "Editors+ can create tags" on public.tags;
create policy "Editors+ can create tags"
on public.tags
for insert
to authenticated
with check ( (select public.has_min_role('editor')) );

drop policy if exists "Admins can update tags" on public.tags;
drop policy if exists "Editors+ can update tags" on public.tags;
create policy "Editors+ can update tags"
on public.tags
for update
to authenticated
using ( (select public.has_min_role('editor')) )
with check ( (select public.has_min_role('editor')) );

drop policy if exists "Admins can delete tags" on public.tags;
drop policy if exists "Editors+ can delete tags" on public.tags;
create policy "Editors+ can delete tags"
on public.tags
for delete
to authenticated
using ( (select public.has_min_role('editor')) );

-- ============================================================
-- 19. SPECTACLES_CATEGORIES (junction)
-- ============================================================

drop policy if exists "Admins can insert spectacle categories" on public.spectacles_categories;
drop policy if exists "Editors+ can insert spectacle categories" on public.spectacles_categories;
create policy "Editors+ can insert spectacle categories"
on public.spectacles_categories
for insert
to authenticated
with check ( (select public.has_min_role('editor')) );

drop policy if exists "Admins can update spectacle categories" on public.spectacles_categories;
drop policy if exists "Editors+ can update spectacle categories" on public.spectacles_categories;
create policy "Editors+ can update spectacle categories"
on public.spectacles_categories
for update
to authenticated
using ( (select public.has_min_role('editor')) )
with check ( (select public.has_min_role('editor')) );

drop policy if exists "Admins can delete spectacle categories" on public.spectacles_categories;
drop policy if exists "Editors+ can delete spectacle categories" on public.spectacles_categories;
create policy "Editors+ can delete spectacle categories"
on public.spectacles_categories
for delete
to authenticated
using ( (select public.has_min_role('editor')) );

-- ============================================================
-- 20. SPECTACLES_TAGS (junction)
-- ============================================================

drop policy if exists "Admins can insert spectacle tags" on public.spectacles_tags;
drop policy if exists "Editors+ can insert spectacle tags" on public.spectacles_tags;
create policy "Editors+ can insert spectacle tags"
on public.spectacles_tags
for insert
to authenticated
with check ( (select public.has_min_role('editor')) );

drop policy if exists "Admins can update spectacle tags" on public.spectacles_tags;
drop policy if exists "Editors+ can update spectacle tags" on public.spectacles_tags;
create policy "Editors+ can update spectacle tags"
on public.spectacles_tags
for update
to authenticated
using ( (select public.has_min_role('editor')) )
with check ( (select public.has_min_role('editor')) );

drop policy if exists "Admins can delete spectacle tags" on public.spectacles_tags;
drop policy if exists "Editors+ can delete spectacle tags" on public.spectacles_tags;
create policy "Editors+ can delete spectacle tags"
on public.spectacles_tags
for delete
to authenticated
using ( (select public.has_min_role('editor')) );

-- ============================================================
-- 21. ARTICLES_CATEGORIES (junction)
-- ============================================================

drop policy if exists "Admins can insert article categories" on public.articles_categories;
drop policy if exists "Editors+ can insert article categories" on public.articles_categories;
create policy "Editors+ can insert article categories"
on public.articles_categories
for insert
to authenticated
with check ( (select public.has_min_role('editor')) );

drop policy if exists "Admins can update article categories" on public.articles_categories;
drop policy if exists "Editors+ can update article categories" on public.articles_categories;
create policy "Editors+ can update article categories"
on public.articles_categories
for update
to authenticated
using ( (select public.has_min_role('editor')) )
with check ( (select public.has_min_role('editor')) );

drop policy if exists "Admins can delete article categories" on public.articles_categories;
drop policy if exists "Editors+ can delete article categories" on public.articles_categories;
create policy "Editors+ can delete article categories"
on public.articles_categories
for delete
to authenticated
using ( (select public.has_min_role('editor')) );

-- ============================================================
-- 22. ARTICLES_TAGS (junction)
-- ============================================================

drop policy if exists "Admins can insert article tags" on public.articles_tags;
drop policy if exists "Editors+ can insert article tags" on public.articles_tags;
create policy "Editors+ can insert article tags"
on public.articles_tags
for insert
to authenticated
with check ( (select public.has_min_role('editor')) );

drop policy if exists "Admins can update article tags" on public.articles_tags;
drop policy if exists "Editors+ can update article tags" on public.articles_tags;
create policy "Editors+ can update article tags"
on public.articles_tags
for update
to authenticated
using ( (select public.has_min_role('editor')) )
with check ( (select public.has_min_role('editor')) );

drop policy if exists "Admins can delete article tags" on public.articles_tags;
drop policy if exists "Editors+ can delete article tags" on public.articles_tags;
create policy "Editors+ can delete article tags"
on public.articles_tags
for delete
to authenticated
using ( (select public.has_min_role('editor')) );

-- ============================================================
-- 23. COMMUNIQUES_CATEGORIES (junction)
-- ============================================================

-- SELECT: parent visibility with editor+ fallback
drop policy if exists "Press release categories follow parent visibility" on public.communiques_categories;
create policy "Press release categories follow parent visibility"
on public.communiques_categories
for select
to anon, authenticated
using (
  exists (
    select 1 from public.communiques_presse cp
    where cp.id = communique_id
    and (cp.public = true or (select public.has_min_role('editor')))
  )
);

drop policy if exists "Admins can insert press release categories" on public.communiques_categories;
drop policy if exists "Editors+ can insert press release categories" on public.communiques_categories;
create policy "Editors+ can insert press release categories"
on public.communiques_categories
for insert
to authenticated
with check ( (select public.has_min_role('editor')) );

drop policy if exists "Admins can update press release categories" on public.communiques_categories;
drop policy if exists "Editors+ can update press release categories" on public.communiques_categories;
create policy "Editors+ can update press release categories"
on public.communiques_categories
for update
to authenticated
using ( (select public.has_min_role('editor')) )
with check ( (select public.has_min_role('editor')) );

drop policy if exists "Admins can delete press release categories" on public.communiques_categories;
drop policy if exists "Editors+ can delete press release categories" on public.communiques_categories;
create policy "Editors+ can delete press release categories"
on public.communiques_categories
for delete
to authenticated
using ( (select public.has_min_role('editor')) );

-- ============================================================
-- 24. COMMUNIQUES_TAGS (junction)
-- ============================================================

-- SELECT: parent visibility with editor+ fallback
drop policy if exists "Press release tags follow parent visibility" on public.communiques_tags;
create policy "Press release tags follow parent visibility"
on public.communiques_tags
for select
to anon, authenticated
using (
  exists (
    select 1 from public.communiques_presse cp
    where cp.id = communique_id
    and (cp.public = true or (select public.has_min_role('editor')))
  )
);

drop policy if exists "Admins can insert press release tags" on public.communiques_tags;
drop policy if exists "Editors+ can insert press release tags" on public.communiques_tags;
create policy "Editors+ can insert press release tags"
on public.communiques_tags
for insert
to authenticated
with check ( (select public.has_min_role('editor')) );

drop policy if exists "Admins can update press release tags" on public.communiques_tags;
drop policy if exists "Editors+ can update press release tags" on public.communiques_tags;
create policy "Editors+ can update press release tags"
on public.communiques_tags
for update
to authenticated
using ( (select public.has_min_role('editor')) )
with check ( (select public.has_min_role('editor')) );

drop policy if exists "Admins can delete press release tags" on public.communiques_tags;
drop policy if exists "Editors+ can delete press release tags" on public.communiques_tags;
create policy "Editors+ can delete press release tags"
on public.communiques_tags
for delete
to authenticated
using ( (select public.has_min_role('editor')) );

-- ============================================================
-- 25. CONTENT VERSIONS
-- ============================================================

drop policy if exists "Admins can view content versions" on public.content_versions;
drop policy if exists "Editors+ can view content versions" on public.content_versions;
create policy "Editors+ can view content versions"
on public.content_versions
for select
to authenticated
using ( (select public.has_min_role('editor')) );

-- INSERT stays as-is (auth.uid() check for trigger-based creation)

drop policy if exists "Admins can update content versions" on public.content_versions;
drop policy if exists "Editors+ can update content versions" on public.content_versions;
create policy "Editors+ can update content versions"
on public.content_versions
for update
to authenticated
using ( (select public.has_min_role('editor')) )
with check ( (select public.has_min_role('editor')) );

drop policy if exists "Admins can delete content versions" on public.content_versions;
drop policy if exists "Editors+ can delete content versions" on public.content_versions;
create policy "Editors+ can delete content versions"
on public.content_versions
for delete
to authenticated
using ( (select public.has_min_role('editor')) );

-- ============================================================
-- 26. EVENTS_RECURRENCE (conditional — table may not exist)
-- ============================================================

do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'events_recurrence') then
    execute 'drop policy if exists "Admins can create event recurrences" on public.events_recurrence';
    execute 'drop policy if exists "Editors+ can create event recurrences" on public.events_recurrence';
    execute 'create policy "Editors+ can create event recurrences"
    on public.events_recurrence
    for insert
    to authenticated
    with check ( (select public.has_min_role(''editor'')) )';

    execute 'drop policy if exists "Admins can update event recurrences" on public.events_recurrence';
    execute 'drop policy if exists "Editors+ can update event recurrences" on public.events_recurrence';
    execute 'create policy "Editors+ can update event recurrences"
    on public.events_recurrence
    for update
    to authenticated
    using ( (select public.has_min_role(''editor'')) )
    with check ( (select public.has_min_role(''editor'')) )';

    execute 'drop policy if exists "Admins can delete event recurrences" on public.events_recurrence';
    execute 'drop policy if exists "Editors+ can delete event recurrences" on public.events_recurrence';
    execute 'create policy "Editors+ can delete event recurrences"
    on public.events_recurrence
    for delete
    to authenticated
    using ( (select public.has_min_role(''editor'')) )';
  end if;
end $$;

commit;
