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

-- Row Level Security
alter table public.lieux enable row level security;

-- Tout le monde peut voir les lieux
drop policy if exists "Lieux are viewable by everyone" on public.lieux;
create policy "Lieux are viewable by everyone"
on public.lieux
for select
to anon, authenticated
using ( true );

-- Seuls les admins peuvent gérer les lieux
drop policy if exists "Admins can create lieux" on public.lieux;
create policy "Admins can create lieux"
on public.lieux
for insert
to authenticated
with check ( (select public.is_admin()) );

drop policy if exists "Admins can update lieux" on public.lieux;
create policy "Admins can update lieux"
on public.lieux
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

drop policy if exists "Admins can delete lieux" on public.lieux;
create policy "Admins can delete lieux"
on public.lieux
for delete
to authenticated
using ( (select public.is_admin()) );
