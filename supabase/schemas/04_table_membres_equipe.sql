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
