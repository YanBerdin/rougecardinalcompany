-- Table membres_equipe - Membres de l'équipe
-- Ordre: 04 - Dépend de medias pour photo_media_id

drop table if exists public.membres_equipe cascade;
create table public.membres_equipe (
  id bigint generated always as identity primary key,
  nom text not null,
  role text,
  description text,
  photo_media_id bigint null references public.medias(id) on delete set null,
  ordre smallint default 0,
  active boolean default true,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

comment on table public.membres_equipe is 'members of the team (artists, staff)';
