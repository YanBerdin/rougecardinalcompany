-- Table articles_presse - Articles de presse
-- Ordre: 08 - Table indépendante

drop table if exists public.articles_presse cascade;
create table public.articles_presse (
  id bigint generated always as identity primary key,
  title text not null,
  slug text,
  chapo text,
  contenu text,
  source_nom text,
  source_url text,
  published_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  search_vector tsvector
);

comment on table public.articles_presse is 'press articles referencing shows or company news';
