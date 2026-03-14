-- Row Level Security Policies - Nouvelles tables
-- Ordre: 62 - RLS pour analytics, categories, tags, content_versions, etc.

-- ---- ANALYTICS EVENTS ----
alter table public.analytics_events enable row level security;

-- Les administrateurs peuvent voir les événements analytiques
drop policy if exists "Admins can view analytics events" on public.analytics_events;
create policy "Admins can view analytics events"
on public.analytics_events
for select
to authenticated
using ( (select public.is_admin()) );

-- NOTE: Analytics INSERT policies managed by hotfix migrations (not in declarative schema)
-- Latest migration: 20260227210418_fix_analytics_events_insert_policy.sql
-- Policies: "Anon can insert validated analytics events" (to anon)
--           "Authenticated users can insert validated analytics events" (to authenticated)
-- Reason: INSERT policy requires NULL entity_type guard + 'page_view' event type
--         which is a known caveat for migra diff tool (data validation logic).

-- Seuls les admins peuvent modifier/supprimer
drop policy if exists "Admins can update analytics events" on public.analytics_events;
create policy "Admins can update analytics events"
on public.analytics_events
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

drop policy if exists "Admins can delete analytics events" on public.analytics_events;
create policy "Admins can delete analytics events"
on public.analytics_events
for delete
to authenticated
using ( (select public.is_admin()) );

-- ---- CATEGORIES ----
alter table public.categories enable row level security;

-- Vue séparée: catégories actives publiques OU editor+ voit tout
drop policy if exists "Active categories are viewable by everyone" on public.categories;
drop policy if exists "Admins can view all categories" on public.categories;
drop policy if exists "View categories (active OR admin)" on public.categories;
drop policy if exists "View categories (active OR editor+)" on public.categories;
drop policy if exists "Anon can view active categories" on public.categories;
drop policy if exists "Authenticated can view categories" on public.categories;

-- anon: seulement catégories actives (has_min_role non évalué pour anon)
create policy "Anon can view active categories"
on public.categories
for select
to anon
using ( is_active = true );

-- authenticated: catégories actives OU editors+ voient tout
create policy "Authenticated can view categories"
on public.categories
for select
to authenticated
using ( is_active = true or (select public.has_min_role('editor')) );

-- Seuls les editors+ peuvent gérer les catégories
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

-- ---- TAGS ----
alter table public.tags enable row level security;

-- Tout le monde peut voir les tags
drop policy if exists "Tags are viewable by everyone" on public.tags;
drop policy if exists "Anon can view tags" on public.tags;
create policy "Anon can view tags"
on public.tags
for select
to anon
using ( true );

drop policy if exists "Authenticated can view tags" on public.tags;
create policy "Authenticated can view tags"
on public.tags
for select
to authenticated
using ( true );

-- Seuls les editors+ peuvent gérer les tags
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

-- ---- TABLES DE RELATIONS (TAGS/CATEGORIES) ----
-- spectacles_categories
alter table public.spectacles_categories enable row level security;
drop policy if exists "Spectacle category relations are viewable by everyone" on public.spectacles_categories;
drop policy if exists "Anon can view spectacle category relations" on public.spectacles_categories;
create policy "Anon can view spectacle category relations"
on public.spectacles_categories
for select
to anon
using ( true );

drop policy if exists "Authenticated can view spectacle category relations" on public.spectacles_categories;
create policy "Authenticated can view spectacle category relations"
on public.spectacles_categories
for select
to authenticated
using ( true );

-- Gestion editor+ (politiques granulaires)
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

-- spectacles_tags
alter table public.spectacles_tags enable row level security;
drop policy if exists "Spectacle tag relations are viewable by everyone" on public.spectacles_tags;
drop policy if exists "Anon can view spectacle tag relations" on public.spectacles_tags;
create policy "Anon can view spectacle tag relations"
on public.spectacles_tags
for select
to anon
using ( true );

drop policy if exists "Authenticated can view spectacle tag relations" on public.spectacles_tags;
create policy "Authenticated can view spectacle tag relations"
on public.spectacles_tags
for select
to authenticated
using ( true );

-- Gestion editor+ (politiques granulaires)
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

-- articles_categories
alter table public.articles_categories enable row level security;
drop policy if exists "Article category relations are viewable by everyone" on public.articles_categories;
drop policy if exists "Anon can view article category relations" on public.articles_categories;
create policy "Anon can view article category relations"
on public.articles_categories
for select
to anon
using ( true );

drop policy if exists "Authenticated can view article category relations" on public.articles_categories;
create policy "Authenticated can view article category relations"
on public.articles_categories
for select
to authenticated
using ( true );

-- Gestion editor+ (politiques granulaires)
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

-- articles_tags
alter table public.articles_tags enable row level security;
drop policy if exists "Article tag relations are viewable by everyone" on public.articles_tags;
drop policy if exists "Anon can view article tag relations" on public.articles_tags;
create policy "Anon can view article tag relations"
on public.articles_tags
for select
to anon
using ( true );

drop policy if exists "Authenticated can view article tag relations" on public.articles_tags;
create policy "Authenticated can view article tag relations"
on public.articles_tags
for select
to authenticated
using ( true );

-- Gestion editor+ (politiques granulaires)
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

-- ---- CONTENT VERSIONS ----
alter table public.content_versions enable row level security;

-- Seuls les editors+ peuvent voir les versions de contenu
drop policy if exists "Admins can view content versions" on public.content_versions;
drop policy if exists "Editors+ can view content versions" on public.content_versions;
create policy "Editors+ can view content versions"
on public.content_versions
for select
to authenticated
using ( (select public.has_min_role('editor')) );

-- Les utilisateurs authentifiés peuvent créer des versions (via triggers)
drop policy if exists "Authenticated users can create content versions" on public.content_versions;
create policy "Authenticated users can create content versions"
on public.content_versions
for insert
to authenticated
with check ( (select auth.uid()) is not null );

-- Seuls les editors+ peuvent modifier/supprimer des versions
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

-- ---- SEO REDIRECTS ----
alter table public.seo_redirects enable row level security;

-- Seuls les admins peuvent voir/gérer les redirections
drop policy if exists "Admins can view SEO redirects" on public.seo_redirects;
create policy "Admins can view SEO redirects"
on public.seo_redirects
for select
to authenticated
using ( (select public.is_admin()) );

-- Gestion admin (politiques granulaires)
drop policy if exists "Admins can insert SEO redirects" on public.seo_redirects;
create policy "Admins can insert SEO redirects"
on public.seo_redirects
for insert
to authenticated
with check ( (select public.is_admin()) );

drop policy if exists "Admins can update SEO redirects" on public.seo_redirects;
create policy "Admins can update SEO redirects"
on public.seo_redirects
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

drop policy if exists "Admins can delete SEO redirects" on public.seo_redirects;
create policy "Admins can delete SEO redirects"
on public.seo_redirects
for delete
to authenticated
using ( (select public.is_admin()) );

-- ---- SITEMAP ENTRIES ----
alter table public.sitemap_entries enable row level security;

-- Tout le monde peut voir les entrées du sitemap
drop policy if exists "Sitemap entries are viewable by everyone" on public.sitemap_entries;
drop policy if exists "Anon can view sitemap entries" on public.sitemap_entries;
create policy "Anon can view sitemap entries"
on public.sitemap_entries
for select
to anon
using ( is_indexed = true );

drop policy if exists "Authenticated can view sitemap entries" on public.sitemap_entries;
create policy "Authenticated can view sitemap entries"
on public.sitemap_entries
for select
to authenticated
using ( is_indexed = true );

-- Seuls les admins peuvent gérer le sitemap
-- Gestion admin (politiques granulaires)
drop policy if exists "Admins can insert sitemap entries" on public.sitemap_entries;
create policy "Admins can insert sitemap entries"
on public.sitemap_entries
for insert
to authenticated
with check ( (select public.is_admin()) );

drop policy if exists "Admins can update sitemap entries" on public.sitemap_entries;
create policy "Admins can update sitemap entries"
on public.sitemap_entries
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

drop policy if exists "Admins can delete sitemap entries" on public.sitemap_entries;
create policy "Admins can delete sitemap entries"
on public.sitemap_entries
for delete
to authenticated
using ( (select public.is_admin()) );
