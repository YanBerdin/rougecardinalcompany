-- Migration d'urgence: Apply missing RLS policies for home content tables
-- Contexte: Les policies existaient dans schemas/ mais n'ont jamais été appliquées
-- Tables affectées: home_hero_slides, home_about_content, compagnie_stats, configurations_site, communiques_presse
-- Date: 2025-10-26

-- ========================================
-- HOME_HERO_SLIDES - RLS Policies
-- ========================================

alter table public.home_hero_slides enable row level security;

-- SELECT: Active slides viewable by everyone (with date window check)
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

-- INSERT: Admins can insert slides
drop policy if exists "Admins can insert home hero slides" on public.home_hero_slides;
create policy "Admins can insert home hero slides"
on public.home_hero_slides
for insert
to authenticated
with check ((select public.is_admin()));

-- UPDATE: Admins can update slides
drop policy if exists "Admins can update home hero slides" on public.home_hero_slides;
create policy "Admins can update home hero slides"
on public.home_hero_slides
for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

-- DELETE: Admins can delete slides
drop policy if exists "Admins can delete home hero slides" on public.home_hero_slides;
create policy "Admins can delete home hero slides"
on public.home_hero_slides
for delete
to authenticated
using ((select public.is_admin()));

-- ========================================
-- HOME_ABOUT_CONTENT - RLS Policies
-- ========================================

alter table public.home_about_content enable row level security;

-- SELECT: Viewable by everyone
drop policy if exists "Home about content is viewable by everyone" on public.home_about_content;
create policy "Home about content is viewable by everyone"
on public.home_about_content
for select
to anon, authenticated
using ( true );

-- INSERT: Admins only
drop policy if exists "Admins can insert home about content" on public.home_about_content;
create policy "Admins can insert home about content"
on public.home_about_content
for insert
to authenticated
with check ( (select public.is_admin()) );

-- UPDATE: Admins only
drop policy if exists "Admins can update home about content" on public.home_about_content;
create policy "Admins can update home about content"
on public.home_about_content
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

-- DELETE: Admins only
drop policy if exists "Admins can delete home about content" on public.home_about_content;
create policy "Admins can delete home about content"
on public.home_about_content
for delete
to authenticated
using ( (select public.is_admin()) );

-- ========================================
-- COMPAGNIE_STATS - RLS Policies
-- ========================================

alter table public.compagnie_stats enable row level security;

-- SELECT: Stats viewable by everyone
drop policy if exists "Compagnie stats are viewable by everyone" on public.compagnie_stats;
create policy "Compagnie stats are viewable by everyone"
on public.compagnie_stats
for select
to anon, authenticated
using ( true );

-- INSERT: Admins only
drop policy if exists "Admins can insert compagnie stats" on public.compagnie_stats;
create policy "Admins can insert compagnie stats"
on public.compagnie_stats
for insert
to authenticated
with check ( (select public.is_admin()) );

-- UPDATE: Admins only
drop policy if exists "Admins can update compagnie stats" on public.compagnie_stats;
create policy "Admins can update compagnie stats"
on public.compagnie_stats
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

-- DELETE: Admins only
drop policy if exists "Admins can delete compagnie stats" on public.compagnie_stats;
create policy "Admins can delete compagnie stats"
on public.compagnie_stats
for delete
to authenticated
using ( (select public.is_admin()) );

-- ========================================
-- CONFIGURATIONS_SITE - RLS Policies
-- ========================================

alter table public.configurations_site enable row level security;

-- SELECT: Public configs (key like 'public:%') viewable by everyone, all configs for admins
drop policy if exists "Public site configurations are viewable by everyone" on public.configurations_site;
create policy "Public site configurations are viewable by everyone"
on public.configurations_site
for select
to anon, authenticated
using ( 
  -- Only configs starting with 'public:' are visible to all
  key like 'public:%'
  -- Or if user is admin, they can see all configs
  or (select public.is_admin())
);

-- INSERT: Admins only
drop policy if exists "Admins can create site configurations" on public.configurations_site;
create policy "Admins can create site configurations"
on public.configurations_site
for insert
to authenticated
with check ( (select public.is_admin()) );

-- UPDATE: Admins only
drop policy if exists "Admins can update site configurations" on public.configurations_site;
create policy "Admins can update site configurations"
on public.configurations_site
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

-- DELETE: Admins only
drop policy if exists "Admins can delete site configurations" on public.configurations_site;
create policy "Admins can delete site configurations"
on public.configurations_site
for delete
to authenticated
using ( (select public.is_admin()) );

-- ========================================
-- COMMUNIQUES_PRESSE - RLS Policies
-- ========================================

alter table public.communiques_presse enable row level security;

-- SELECT: Public press releases viewable by everyone
drop policy if exists "Public press releases are viewable by everyone" on public.communiques_presse;
create policy "Public press releases are viewable by everyone"
on public.communiques_presse
for select
to anon, authenticated
using ( public = true );

-- SELECT: Admins can view all press releases
drop policy if exists "Admins can view all press releases" on public.communiques_presse;
create policy "Admins can view all press releases"
on public.communiques_presse
for select
to authenticated
using ( (select public.is_admin()) );

-- INSERT: Admins only
drop policy if exists "Admins can create press releases" on public.communiques_presse;
create policy "Admins can create press releases"
on public.communiques_presse
for insert
to authenticated
with check ( (select public.is_admin()) );

-- UPDATE: Admins only
drop policy if exists "Admins can update press releases" on public.communiques_presse;
create policy "Admins can update press releases"
on public.communiques_presse
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

-- DELETE: Admins only
drop policy if exists "Admins can delete press releases" on public.communiques_presse;
create policy "Admins can delete press releases"
on public.communiques_presse
for delete
to authenticated
using ( (select public.is_admin()) );

-- ========================================
-- Vérification finale
-- ========================================
-- Policies should now be active for all affected tables
-- Verify with: 
-- SELECT schemaname, tablename, policyname 
-- FROM pg_policies 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('home_hero_slides', 'home_about_content', 'compagnie_stats', 'configurations_site', 'communiques_presse');
