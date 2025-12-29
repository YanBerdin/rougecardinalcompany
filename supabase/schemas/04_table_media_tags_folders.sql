-- Table media_tags - Tags pour catégoriser les médias
-- Table media_folders - Dossiers hiérarchiques pour organiser les médias
-- Table media_item_tags - Liaison many-to-many entre médias et tags
-- Ordre: 04 - Après table medias

-- =============================================================================
-- MEDIA TAGS
-- =============================================================================

drop table if exists public.media_tags cascade;
create table public.media_tags (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) >= 1 and char_length(name) <= 50),
  slug text not null check (char_length(slug) >= 1 and char_length(slug) <= 60),
  description text check (description is null or char_length(description) <= 200),
  color text check (color is null or color ~ '^#[0-9A-Fa-f]{6}$'),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

comment on table public.media_tags is 'Tags pour catégoriser les médias (spectacles, presse, équipe, etc.)';
comment on column public.media_tags.name is 'Nom du tag (ex: "Spectacles", "Presse")';
comment on column public.media_tags.slug is 'Slug unique généré automatiquement';
comment on column public.media_tags.description is 'Description optionnelle du tag';
comment on column public.media_tags.color is 'Couleur hexadécimale pour affichage (#RRGGBB)';

-- Unique slug index
create unique index media_tags_slug_unique_idx on public.media_tags(slug);

-- Performance index
create index media_tags_name_idx on public.media_tags(name);

-- =============================================================================
-- MEDIA FOLDERS
-- =============================================================================

drop table if exists public.media_folders cascade;
create table public.media_folders (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) >= 1 and char_length(name) <= 100),
  slug text not null check (char_length(slug) >= 1 and char_length(slug) <= 110),
  description text check (description is null or char_length(description) <= 300),
  parent_id bigint references public.media_folders(id) on delete set null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

comment on table public.media_folders is 'Dossiers hiérarchiques pour organiser les médias';
comment on column public.media_folders.name is 'Nom du dossier';
comment on column public.media_folders.slug is 'Slug unique généré automatiquement';
comment on column public.media_folders.description is 'Description optionnelle du dossier';
comment on column public.media_folders.parent_id is 'Référence au dossier parent (hiérarchie)';

-- Unique slug index
create unique index media_folders_slug_unique_idx on public.media_folders(slug);

-- Performance indexes
create index media_folders_name_idx on public.media_folders(name);
create index media_folders_parent_id_idx on public.media_folders(parent_id);

-- =============================================================================
-- MEDIA ITEM TAGS (Junction Table)
-- =============================================================================

drop table if exists public.media_item_tags cascade;
create table public.media_item_tags (
  media_id bigint not null references public.medias(id) on delete cascade,
  tag_id bigint not null references public.media_tags(id) on delete cascade,
  created_at timestamptz default now() not null,
  primary key (media_id, tag_id)
);

comment on table public.media_item_tags is 'Table de liaison many-to-many entre médias et tags';
comment on column public.media_item_tags.media_id is 'Référence au média';
comment on column public.media_item_tags.tag_id is 'Référence au tag';

-- Performance index
create index media_item_tags_tag_id_idx on public.media_item_tags(tag_id);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Auto-update updated_at timestamp for media_tags
create or replace function public.update_media_tags_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger media_tags_updated_at_trigger
before update on public.media_tags
for each row
execute function public.update_media_tags_updated_at();

-- Auto-update updated_at timestamp for media_folders
create or replace function public.update_media_folders_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger media_folders_updated_at_trigger
before update on public.media_folders
for each row
execute function public.update_media_folders_updated_at();
