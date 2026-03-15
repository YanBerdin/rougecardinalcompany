-- Migration: TASK079 — Separate anon/authenticated RLS policies (batch 2)
-- Purpose: Split remaining 21 combined "to anon, authenticated" policies into individual per-role policies
-- Affected: 17 tables across 10 schema files
-- Also cleans up TASK076 duplicate policies (communiques_presse, compagnie_presentation_sections)
-- Standard: MIG-005 — one policy per operation per supabase role

-- =============================================================================
-- TASK076 DUPLICATE CLEANUP — Old admin-named policies still in DB
-- =============================================================================

-- communiques_presse: old "admin" policy replaced by "editor+" in TASK076
drop policy if exists "View press releases (public OR admin all)" on public.communiques_presse;

-- compagnie_presentation_sections: old "admin" policy replaced by "editor+" in TASK076
drop policy if exists "View presentation sections (public active OR admin all)" on public.compagnie_presentation_sections;

-- =============================================================================
-- TABLE: abonnes_newsletter (3 policies to split)
-- =============================================================================

-- SELECT: split into anon + authenticated
drop policy if exists "Anyone can check email existence for duplicates" on public.abonnes_newsletter;
drop policy if exists "Anon can check newsletter email existence" on public.abonnes_newsletter;
drop policy if exists "Authenticated can check newsletter email existence" on public.abonnes_newsletter;

create policy "Anon can check newsletter email existence"
on public.abonnes_newsletter
for select
to anon
using (true);

create policy "Authenticated can check newsletter email existence"
on public.abonnes_newsletter
for select
to authenticated
using (true);

-- INSERT: split into anon + authenticated
drop policy if exists "Validated newsletter subscription" on public.abonnes_newsletter;
drop policy if exists "Anon can subscribe to newsletter" on public.abonnes_newsletter;
drop policy if exists "Authenticated can subscribe to newsletter" on public.abonnes_newsletter;

create policy "Anon can subscribe to newsletter"
on public.abonnes_newsletter
for insert
to anon
with check (
  email ~* '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$'
);

create policy "Authenticated can subscribe to newsletter"
on public.abonnes_newsletter
for insert
to authenticated
with check (
  email ~* '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$'
);

-- DELETE: split into anon + authenticated
drop policy if exists "Subscribers can unsubscribe or admins can delete" on public.abonnes_newsletter;
drop policy if exists "Anon can unsubscribe from newsletter" on public.abonnes_newsletter;
drop policy if exists "Admins can delete newsletter subscriptions" on public.abonnes_newsletter;

create policy "Anon can unsubscribe from newsletter"
on public.abonnes_newsletter
for delete
to anon
using ( 
  (select public.is_admin()) 
);

create policy "Admins can delete newsletter subscriptions"
on public.abonnes_newsletter
for delete
to authenticated
using ( 
  (select public.is_admin()) 
);

-- =============================================================================
-- TABLE: messages_contact (1 policy to split)
-- =============================================================================

-- INSERT: split into anon + authenticated
drop policy if exists "Validated contact submission" on public.messages_contact;
drop policy if exists "Anon can submit contact form" on public.messages_contact;
drop policy if exists "Authenticated can submit contact form" on public.messages_contact;

create policy "Anon can submit contact form"
on public.messages_contact
for insert
to anon
with check (
  firstname is not null and firstname <> ''
  and lastname is not null and lastname <> ''
  and email is not null and email <> ''
  and reason is not null
  and message is not null and message <> ''
  and consent = true
  and email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  and (phone is null or phone ~* '^\+?[0-9\s\-\(\)]{10,}$')
  and length(message) between 10 and 5000
);

create policy "Authenticated can submit contact form"
on public.messages_contact
for insert
to authenticated
with check (
  firstname is not null and firstname <> ''
  and lastname is not null and lastname <> ''
  and email is not null and email <> ''
  and reason is not null
  and message is not null and message <> ''
  and consent = true
  and email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  and (phone is null or phone ~* '^\+?[0-9\s\-\(\)]{10,}$')
  and length(message) between 10 and 5000
);

-- =============================================================================
-- TABLE: configurations_site (1 policy to split)
-- =============================================================================

-- SELECT: anon sees public keys only, authenticated sees public + admin override
drop policy if exists "Public site configurations are viewable by everyone" on public.configurations_site;
drop policy if exists "Anon can view public site configurations" on public.configurations_site;
drop policy if exists "Authenticated can view site configurations" on public.configurations_site;

create policy "Anon can view public site configurations"
on public.configurations_site
for select
to anon
using ( 
  key like 'public:%'
  or key like 'display_toggle_%'
);

create policy "Authenticated can view site configurations"
on public.configurations_site
for select
to authenticated
using ( 
  key like 'public:%'
  or key like 'display_toggle_%'
  or (select public.is_admin())
);

-- =============================================================================
-- TABLE: spectacles_membres_equipe (1 policy to split)
-- =============================================================================

drop policy if exists "Spectacle member relations are viewable by everyone" on public.spectacles_membres_equipe;
drop policy if exists "Anon can view spectacle member relations" on public.spectacles_membres_equipe;
drop policy if exists "Authenticated can view spectacle member relations" on public.spectacles_membres_equipe;

create policy "Anon can view spectacle member relations"
on public.spectacles_membres_equipe
for select
to anon
using ( true );

create policy "Authenticated can view spectacle member relations"
on public.spectacles_membres_equipe
for select
to authenticated
using ( true );

-- =============================================================================
-- TABLE: spectacles_medias (1 policy to split)
-- =============================================================================

drop policy if exists "Spectacle media relations are viewable by everyone" on public.spectacles_medias;
drop policy if exists "Anon can view spectacle media relations" on public.spectacles_medias;
drop policy if exists "Authenticated can view spectacle media relations" on public.spectacles_medias;

create policy "Anon can view spectacle media relations"
on public.spectacles_medias
for select
to anon
using ( true );

create policy "Authenticated can view spectacle media relations"
on public.spectacles_medias
for select
to authenticated
using ( true );

-- =============================================================================
-- TABLE: articles_medias (1 policy to split)
-- =============================================================================

drop policy if exists "Article media relations are viewable by everyone" on public.articles_medias;
drop policy if exists "Anon can view article media relations" on public.articles_medias;
drop policy if exists "Authenticated can view article media relations" on public.articles_medias;

create policy "Anon can view article media relations"
on public.articles_medias
for select
to anon
using ( true );

create policy "Authenticated can view article media relations"
on public.articles_medias
for select
to authenticated
using ( true );

-- =============================================================================
-- TABLE: communiques_medias (1 policy to split)
-- =============================================================================

-- Anon: sees only medias linked to public communiqués
-- Authenticated: sees medias linked to public communiqués + editor+ sees all
drop policy if exists "Press release media relations follow parent visibility" on public.communiques_medias;
drop policy if exists "Anon can view press release media relations" on public.communiques_medias;
drop policy if exists "Authenticated can view press release media relations" on public.communiques_medias;

create policy "Anon can view press release media relations"
on public.communiques_medias
for select
to anon
using ( 
  exists (
    select 1 
    from public.communiques_presse as cp 
    where cp.id = communique_id 
      and cp.public = true
  )
);

create policy "Authenticated can view press release media relations"
on public.communiques_medias
for select
to authenticated
using ( 
  exists (
    select 1 
    from public.communiques_presse as cp 
    where cp.id = communique_id 
      and (cp.public = true or (select public.has_min_role('editor')))
  )
);

-- =============================================================================
-- TABLE: communiques_categories (1 policy to split)
-- =============================================================================

drop policy if exists "Press release categories follow parent visibility" on public.communiques_categories;
drop policy if exists "Anon can view press release categories" on public.communiques_categories;
drop policy if exists "Authenticated can view press release categories" on public.communiques_categories;

create policy "Anon can view press release categories"
on public.communiques_categories
for select
to anon
using (
  exists (
    select 1 from public.communiques_presse cp
    where cp.id = communique_id
    and cp.public = true
  )
);

create policy "Authenticated can view press release categories"
on public.communiques_categories
for select
to authenticated
using (
  exists (
    select 1 from public.communiques_presse cp
    where cp.id = communique_id
    and (cp.public = true or (select public.has_min_role('editor')))
  )
);

-- =============================================================================
-- TABLE: communiques_tags (1 policy to split)
-- =============================================================================

drop policy if exists "Press release tags follow parent visibility" on public.communiques_tags;
drop policy if exists "Anon can view press release tags" on public.communiques_tags;
drop policy if exists "Authenticated can view press release tags" on public.communiques_tags;

create policy "Anon can view press release tags"
on public.communiques_tags
for select
to anon
using (
  exists (
    select 1 from public.communiques_presse cp
    where cp.id = communique_id
    and cp.public = true
  )
);

create policy "Authenticated can view press release tags"
on public.communiques_tags
for select
to authenticated
using (
  exists (
    select 1 from public.communiques_presse cp
    where cp.id = communique_id
    and (cp.public = true or (select public.has_min_role('editor')))
  )
);

-- =============================================================================
-- TABLE: compagnie_values (1 policy to split)
-- =============================================================================

drop policy if exists "Compagnie values are viewable by everyone" on public.compagnie_values;
drop policy if exists "Anon can view compagnie values" on public.compagnie_values;
drop policy if exists "Authenticated can view compagnie values" on public.compagnie_values;

create policy "Anon can view compagnie values"
on public.compagnie_values
for select
to anon
using ( true );

create policy "Authenticated can view compagnie values"
on public.compagnie_values
for select
to authenticated
using ( true );

-- =============================================================================
-- TABLE: compagnie_stats (1 policy to split)
-- =============================================================================

drop policy if exists "Compagnie stats are viewable by everyone" on public.compagnie_stats;
drop policy if exists "Anon can view compagnie stats" on public.compagnie_stats;
drop policy if exists "Authenticated can view compagnie stats" on public.compagnie_stats;

create policy "Anon can view compagnie stats"
on public.compagnie_stats
for select
to anon
using ( true );

create policy "Authenticated can view compagnie stats"
on public.compagnie_stats
for select
to authenticated
using ( true );

-- =============================================================================
-- TABLE: compagnie_presentation_sections (1 policy to split)
-- =============================================================================

-- Anon: sees only active sections
-- Authenticated: sees active sections + editor+ sees all
drop policy if exists "View presentation sections (public active OR editor+ all)" on public.compagnie_presentation_sections;
drop policy if exists "Anon can view active presentation sections" on public.compagnie_presentation_sections;
drop policy if exists "Authenticated can view presentation sections" on public.compagnie_presentation_sections;

create policy "Anon can view active presentation sections"
on public.compagnie_presentation_sections
for select
to anon
using ( active = true );

create policy "Authenticated can view presentation sections"
on public.compagnie_presentation_sections
for select
to authenticated
using (
  active = true
  or (select public.has_min_role('editor'))
);

-- =============================================================================
-- TABLE: home_hero_slides (1 policy to split)
-- =============================================================================

-- Anon: sees only active + scheduled slides
-- Authenticated: sees active + scheduled slides + admin sees all
drop policy if exists "View home hero slides (public active OR admin all)" on public.home_hero_slides;
drop policy if exists "Anon can view active home hero slides" on public.home_hero_slides;
drop policy if exists "Authenticated can view home hero slides" on public.home_hero_slides;

create policy "Anon can view active home hero slides"
on public.home_hero_slides
for select
to anon
using (
  active = true
  and (starts_at is null or starts_at <= now())
  and (ends_at is null or ends_at >= now())
);

create policy "Authenticated can view home hero slides"
on public.home_hero_slides
for select
to authenticated
using (
  (
    active = true
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at >= now())
  )
  or (select public.is_admin())
);

-- =============================================================================
-- TABLE: home_about_content (1 policy to split)
-- =============================================================================

drop policy if exists "Home about content is viewable by everyone" on public.home_about_content;
drop policy if exists "Anon can view home about content" on public.home_about_content;
drop policy if exists "Authenticated can view home about content" on public.home_about_content;

create policy "Anon can view home about content"
on public.home_about_content
for select
to anon
using ( true );

create policy "Authenticated can view home about content"
on public.home_about_content
for select
to authenticated
using ( true );

-- =============================================================================
-- TABLE: communiques_presse (1 policy to split)
-- =============================================================================

-- Anon: sees only public press releases
-- Authenticated: sees public + editor+ sees all
drop policy if exists "View press releases (public OR editor+ all)" on public.communiques_presse;
drop policy if exists "Anon can view public press releases" on public.communiques_presse;
drop policy if exists "Authenticated can view press releases" on public.communiques_presse;

create policy "Anon can view public press releases"
on public.communiques_presse
for select
to anon
using ( public = true );

create policy "Authenticated can view press releases"
on public.communiques_presse
for select
to authenticated
using (
  public = true
  or (select public.has_min_role('editor'))
);

-- =============================================================================
-- TABLE: membres_equipe (1 policy to split)
-- =============================================================================

-- Anon: sees only active members
-- Authenticated: sees active members + admin sees all
drop policy if exists "View team members (public active OR admin all)" on public.membres_equipe;
drop policy if exists "Anon can view active team members" on public.membres_equipe;
drop policy if exists "Authenticated can view team members" on public.membres_equipe;

create policy "Anon can view active team members"
on public.membres_equipe
for select
to anon
using ( active = true );

create policy "Authenticated can view team members"
on public.membres_equipe
for select
to authenticated
using (
  active = true
  or (select public.is_admin())
);

-- =============================================================================
-- TABLE: lieux (1 policy to split)
-- =============================================================================

drop policy if exists "Lieux are viewable by everyone" on public.lieux;
drop policy if exists "Anon can view lieux" on public.lieux;
drop policy if exists "Authenticated can view lieux" on public.lieux;

create policy "Anon can view lieux"
on public.lieux
for select
to anon
using ( true );

create policy "Authenticated can view lieux"
on public.lieux
for select
to authenticated
using ( true );

-- =============================================================================
-- TABLE: events_recurrence (conditional — inside DO $$ block)
-- =============================================================================

do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'events_recurrence') then
    execute 'drop policy if exists "Event recurrences are viewable by everyone" on public.events_recurrence';
    execute 'drop policy if exists "Anon can view event recurrences" on public.events_recurrence';
    execute 'drop policy if exists "Authenticated can view event recurrences" on public.events_recurrence';

    execute 'create policy "Anon can view event recurrences"
    on public.events_recurrence
    for select
    to anon
    using ( true )';

    execute 'create policy "Authenticated can view event recurrences"
    on public.events_recurrence
    for select
    to authenticated
    using ( true )';
  end if;
end $$;
