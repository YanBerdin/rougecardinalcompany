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

-- Seuls les admins peuvent gérer les lieux
drop policy if exists "Editors+ can create lieux" on public.lieux;
create policy "Editors+ can create lieux"
on public.lieux
for insert
to authenticated
with check ( (select public.has_min_role('editor')) );

drop policy if exists "Editors+ can update lieux" on public.lieux;
create policy "Editors+ can update lieux"
on public.lieux
for update
to authenticated
using ( (select public.has_min_role('editor')) )
with check ( (select public.has_min_role('editor')) );

drop policy if exists "Editors+ can delete lieux" on public.lieux;
create policy "Editors+ can delete lieux"
on public.lieux
for delete
to authenticated
using ( (select public.has_min_role('editor')) );
