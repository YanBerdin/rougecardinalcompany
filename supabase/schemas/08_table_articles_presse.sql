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

-- Public can read only published articles
drop policy if exists "Public press articles are viewable by everyone" on public.articles_presse;
create policy "Public press articles are viewable by everyone"
on public.articles_presse
for select
to anon, authenticated
using ( published_at is not null );

-- Admins can read all articles (including drafts)
drop policy if exists "Admins can view all press articles" on public.articles_presse;
create policy "Admins can view all press articles"
on public.articles_presse
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
