-- Table spectacles - Spectacles/représentations
-- Ordre: 06 - Table principale pour les spectacles

drop table if exists public.spectacles cascade;
create table public.spectacles (
  id bigint generated always as identity primary key,
  titre text not null,
  slug text,
  status text,
  description text,
  duree_minutes integer,
  cast integer,
  premiere timestamptz null,
  public boolean default true,
  created_by uuid null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  search_vector tsvector
);

comment on table public.spectacles is 'shows/performances (base entity)';
