-- Table spectacles - Spectacles/représentations
-- Ordre: 06 - Table principale pour les spectacles

drop table if exists public.spectacles cascade;
create table public.spectacles (
  id bigint generated always as identity primary key,
  title text not null,
  slug text,
  status text,
  description text,
  short_description text,
  genre text,
  duration_minutes integer,
  cast integer,
  premiere timestamptz null,
  image text,
  public boolean default true,
  status text,
  awards text,
  created_by uuid null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  search_vector tsvector
);

comment on table public.spectacles is 'shows/performances (base entity)';
