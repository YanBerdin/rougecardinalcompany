-- Table lieux - Lieux de représentation
-- Ordre: 05 - Table indépendante

drop table if exists public.lieux cascade;
create table public.lieux (
  id bigint generated always as identity primary key,
  nom text not null,
  adresse text,
  ville text,
  code_postal text,
  pays text default 'France',
  latitude double precision,
  longitude double precision,
  capacite integer,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

comment on table public.lieux is 'physical venues where events can be scheduled';
