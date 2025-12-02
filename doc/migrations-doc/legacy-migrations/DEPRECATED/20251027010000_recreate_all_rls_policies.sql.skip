-- Hotfix: Re-create RLS policies now that is_admin() function exists
-- Contexte: Les policies ont été créées AVANT la fonction is_admin()
-- Résultat: Policies invalides/non-fonctionnelles
-- Date: 2025-10-27

-- ========================================
-- SPECTACLES - Re-create RLS Policies
-- ========================================

alter table public.spectacles enable row level security;

drop policy if exists "Public spectacles are viewable by everyone" on public.spectacles;
create policy "Public spectacles are viewable by everyone"
on public.spectacles
for select
to anon, authenticated
using ( public = true );

drop policy if exists "Authenticated users can create spectacles" on public.spectacles;
create policy "Authenticated users can create spectacles"
on public.spectacles
for insert
to authenticated
with check ( (select auth.uid()) is not null );

drop policy if exists "Owners or admins can update spectacles" on public.spectacles;
create policy "Owners or admins can update spectacles"
on public.spectacles
for update
to authenticated
using ( (created_by = (select auth.uid())) or (select public.is_admin()) )
with check ( (created_by = (select auth.uid())) or (select public.is_admin()) );

drop policy if exists "Owners or admins can delete spectacles" on public.spectacles;
create policy "Owners or admins can delete spectacles"
on public.spectacles
for delete
to authenticated
using ( (created_by = (select auth.uid())) or (select public.is_admin()) );

-- ========================================
-- PARTNERS - Re-create RLS Policies
-- ========================================

alter table public.partners enable row level security;

drop policy if exists "Public partners are viewable by anyone" on public.partners;
create policy "Public partners are viewable by anyone"
on public.partners
for select
to authenticated, anon
using ( is_active = true );

drop policy if exists "Admins can view all partners" on public.partners;
create policy "Admins can view all partners"
on public.partners
for select
to authenticated
using ( (select public.is_admin()) );

drop policy if exists "Admins can create partners" on public.partners;
create policy "Admins can create partners"
on public.partners
for insert
to authenticated
with check ( (select public.is_admin()) );

drop policy if exists "Admins can update partners" on public.partners;
create policy "Admins can update partners"
on public.partners
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

drop policy if exists "Admins can delete partners" on public.partners;
create policy "Admins can delete partners"
on public.partners
for delete
to authenticated
using ( (select public.is_admin()) );

-- ========================================
-- HOME_HERO_SLIDES - Re-create RLS Policies
-- ========================================

alter table public.home_hero_slides enable row level security;

drop policy if exists "Home hero slides are viewable by everyone" on public.home_hero_slides;
create policy "Home hero slides are viewable by everyone"
on public.home_hero_slides
for select
to anon, authenticated
using (
  active = true
  and (starts_at is null or starts_at <= now())
  and (ends_at is null or ends_at >= now())
);

drop policy if exists "Admins can insert home hero slides" on public.home_hero_slides;
create policy "Admins can insert home hero slides"
on public.home_hero_slides
for insert
to authenticated
with check ((select public.is_admin()));

drop policy if exists "Admins can update home hero slides" on public.home_hero_slides;
create policy "Admins can update home hero slides"
on public.home_hero_slides
for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists "Admins can delete home hero slides" on public.home_hero_slides;
create policy "Admins can delete home hero slides"
on public.home_hero_slides
for delete
to authenticated
using ((select public.is_admin()));

-- ========================================
-- HOME_ABOUT_CONTENT - Re-create RLS Policies
-- ========================================

alter table public.home_about_content enable row level security;

drop policy if exists "Home about content is viewable by everyone" on public.home_about_content;
create policy "Home about content is viewable by everyone"
on public.home_about_content
for select
to anon, authenticated
using ( true );

drop policy if exists "Admins can insert home about content" on public.home_about_content;
create policy "Admins can insert home about content"
on public.home_about_content
for insert
to authenticated
with check ( (select public.is_admin()) );

drop policy if exists "Admins can update home about content" on public.home_about_content;
create policy "Admins can update home about content"
on public.home_about_content
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

drop policy if exists "Admins can delete home about content" on public.home_about_content;
create policy "Admins can delete home about content"
on public.home_about_content
for delete
to authenticated
using ( (select public.is_admin()) );

-- ========================================
-- COMPAGNIE_STATS - Re-create RLS Policies
-- ========================================

alter table public.compagnie_stats enable row level security;

drop policy if exists "Compagnie stats are viewable by everyone" on public.compagnie_stats;
create policy "Compagnie stats are viewable by everyone"
on public.compagnie_stats
for select
to anon, authenticated
using ( true );

drop policy if exists "Admins can insert compagnie stats" on public.compagnie_stats;
create policy "Admins can insert compagnie stats"
on public.compagnie_stats
for insert
to authenticated
with check ( (select public.is_admin()) );

drop policy if exists "Admins can update compagnie stats" on public.compagnie_stats;
create policy "Admins can update compagnie stats"
on public.compagnie_stats
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

drop policy if exists "Admins can delete compagnie stats" on public.compagnie_stats;
create policy "Admins can delete compagnie stats"
on public.compagnie_stats
for delete
to authenticated
using ( (select public.is_admin()) );

-- ========================================
-- CONFIGURATIONS_SITE - Re-create RLS Policies
-- ========================================

alter table public.configurations_site enable row level security;

drop policy if exists "Public site configurations are viewable by everyone" on public.configurations_site;
create policy "Public site configurations are viewable by everyone"
on public.configurations_site
for select
to anon, authenticated
using ( 
  key like 'public:%'
  or (select public.is_admin())
);

drop policy if exists "Admins can create site configurations" on public.configurations_site;
create policy "Admins can create site configurations"
on public.configurations_site
for insert
to authenticated
with check ( (select public.is_admin()) );

drop policy if exists "Admins can update site configurations" on public.configurations_site;
create policy "Admins can update site configurations"
on public.configurations_site
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

drop policy if exists "Admins can delete site configurations" on public.configurations_site;
create policy "Admins can delete site configurations"
on public.configurations_site
for delete
to authenticated
using ( (select public.is_admin()) );

-- ========================================
-- COMMUNIQUES_PRESSE - Re-create RLS Policies
-- ========================================

alter table public.communiques_presse enable row level security;

drop policy if exists "Public press releases are viewable by everyone" on public.communiques_presse;
create policy "Public press releases are viewable by everyone"
on public.communiques_presse
for select
to anon, authenticated
using ( public = true );

drop policy if exists "Admins can view all press releases" on public.communiques_presse;
create policy "Admins can view all press releases"
on public.communiques_presse
for select
to authenticated
using ( (select public.is_admin()) );

drop policy if exists "Admins can create press releases" on public.communiques_presse;
create policy "Admins can create press releases"
on public.communiques_presse
for insert
to authenticated
with check ( (select public.is_admin()) );

drop policy if exists "Admins can update press releases" on public.communiques_presse;
create policy "Admins can update press releases"
on public.communiques_presse
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

drop policy if exists "Admins can delete press releases" on public.communiques_presse;
create policy "Admins can delete press releases"
on public.communiques_presse
for delete
to authenticated
using ( (select public.is_admin()) );
