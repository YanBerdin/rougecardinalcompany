-- Table membres_equipe - Membres de l'équipe
-- Ordre: 04 - Dépend de medias pour photo_media_id

drop table if exists public.membres_equipe cascade;
create table public.membres_equipe (
  id bigint generated always as identity primary key,
  nom text not null,
  role text,
  description text,
  image_url text, -- URL d'image externe optionnelle (complément à photo_media_id)
  photo_media_id bigint null references public.medias(id) on delete set null,
  ordre smallint default 0,
  active boolean default true,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

comment on table public.membres_equipe is 'Members of the team (artists, staff). image_url permet d\'utiliser une image externe sans media uploadé.';
comment on column public.membres_equipe.image_url is 'URL externe de l\'image du membre (fallback si aucun media stocké)';

-- Row Level Security
alter table public.membres_equipe enable row level security;

-- Tout le monde peut voir les membres d'équipe
drop policy if exists "Membres equipe are viewable by everyone" on public.membres_equipe;
create policy "Membres equipe are viewable by everyone"
on public.membres_equipe
for select
to anon, authenticated
using ( true );

-- Seuls les admins peuvent gérer les membres d'équipe
drop policy if exists "Admins can create membres equipe" on public.membres_equipe;
create policy "Admins can create membres equipe"
on public.membres_equipe
for insert
to authenticated
with check ( (select public.is_admin()) );

drop policy if exists "Admins can update membres equipe" on public.membres_equipe;
create policy "Admins can update membres equipe"
on public.membres_equipe
for update
to authenticated
using ( (select public.is_admin()) )
with check ( (select public.is_admin()) );

drop policy if exists "Admins can delete membres equipe" on public.membres_equipe;
create policy "Admins can delete membres equipe"
on public.membres_equipe
for delete
to authenticated
using ( (select public.is_admin()) );

-- Vue admin enrichie avec info versioning (dernière version + compte)
create or replace view public.membres_equipe_admin as
select 
  m.id,
  m.nom,
  m.role,
  m.description,
  m.image_url,
  m.photo_media_id,
  m.ordre,
  m.active,
  m.created_at,
  m.updated_at,
  cv.version_number as last_version_number,
  cv.change_type as last_change_type,
  cv.created_at as last_version_created_at,
  vcount.total_versions
from public.membres_equipe m
left join lateral (
  select version_number, change_type, created_at
  from public.content_versions
  where entity_type = 'membre_equipe' and entity_id = m.id
  order by version_number desc
  limit 1
) cv on true
left join lateral (
  select count(*)::integer as total_versions
  from public.content_versions
  where entity_type = 'membre_equipe' and entity_id = m.id
) vcount on true;

comment on view public.membres_equipe_admin is 'Vue d\'administration des membres avec métadonnées de versioning (dernière version et total).';
