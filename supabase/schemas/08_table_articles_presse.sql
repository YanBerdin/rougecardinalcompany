-- Table articles_presse - Articles de presse
-- Ordre: 08 - Table indépendante

drop table if exists public.articles_presse cascade;
create table public.articles_presse (
  id bigint generated always as identity primary key,
  title text not null,
  author text,
  type text,
  slug text,
  chapo text,
  excerpt text,
  source_publication text,
  source_url text,
  published_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  search_vector tsvector
);

comment on table public.articles_presse is 'press articles referencing shows or company news';

-- Enable Row Level Security and define policies (co-located with table)
alter table public.articles_presse enable row level security;

-- Grant base permissions on table for anon/authenticated (required for SECURITY INVOKER view)
grant select on public.articles_presse to anon, authenticated;

-- Public view for published articles (bypasses RLS issues with JWT Signing Keys)
-- SECURITY: Explicitly set SECURITY INVOKER to run with querying user's privileges
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
'Public view of published press articles - bypasses RLS issues with JWT signing keys. SECURITY INVOKER: Runs with querying user privileges (not definer). Used by anon/authenticated users to access published articles without triggering RLS policy evaluation delays.';

-- Grant read access to all roles
grant select on public.articles_presse_public to anon, authenticated;

-- Public can read only published articles
drop policy if exists "Public press articles are viewable by everyone" on public.articles_presse;
create policy "Public press articles are viewable by everyone"
on public.articles_presse
for select
to anon, authenticated
using ( published_at is not null );

-- Admins can read all articles (including drafts)
-- RESTRICTIVE policy: acts as OR gate for admin users
-- Performance: Avoids evaluating both permissive policies for authenticated users
drop policy if exists "Admins can view all press articles" on public.articles_presse;
create policy "Admins can view all press articles"
on public.articles_presse
as restrictive  -- RESTRICTIVE: admin users bypass public filter
for select
to authenticated
using ( (select public.is_admin()) );

-- Only admins can create articles
drop policy if exists "Admins can create press articles" on public.articles_presse;
create policy "Admins can create press articles"
on public.articles_presse
for insert
to authenticated
with check ( (select public.is_admin()) );

-- Only admins can update articles
drop policy if exists "Admins can update press articles" on public.articles_presse;
create policy "Admins can update press articles"
on public.articles_presse
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

-- Only admins can delete articles
drop policy if exists "Admins can delete press articles" on public.articles_presse;
create policy "Admins can delete press articles"
on public.articles_presse
for delete
to authenticated
using ( (select public.is_admin()) );
