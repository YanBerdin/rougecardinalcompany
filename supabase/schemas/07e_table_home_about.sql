-- Table de contenu "About" pour la page d'accueil
-- Ordre: 07e - après 07d (home_hero), avant 08_* (presse)
-- But: stocker un enregistrement éditorial pilotant HomeAboutContentDTO (title, intro1, intro2, image_url, mission_title, mission_text)

-- Recréation déclarative
 drop table if exists public.home_about_content cascade;
create table public.home_about_content (
  id bigint generated always as identity primary key,
  slug text not null unique, -- identifiant logique (ex: 'default') pour faciliter upsert/seed
  title text not null,
  intro1 text not null,
  intro2 text not null,
  image_url text,
  image_media_id bigint null references public.medias(id) on delete set null,
  mission_title text not null,
  mission_text text not null,
  position smallint not null default 0, -- pour préparer plusieurs variantes si besoin
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.home_about_content is 'Bloc éditorial About de la page d''accueil (HomeAboutContentDTO). Un ou plusieurs enregistrements triés par position, filtrés par active.';
comment on column public.home_about_content.slug is 'Clé stable pour upsert (ex: default).';
comment on column public.home_about_content.image_media_id is 'Référence prioritaire vers un média stocké (surpasse image_url si non null).';

-- Index
create index if not exists idx_home_about_content_active_order on public.home_about_content(active, position) where active = true;

-- RLS
alter table public.home_about_content enable row level security;

-- Lecture publique
 drop policy if exists "Home about content is viewable by everyone" on public.home_about_content;
create policy "Home about content is viewable by everyone"
  on public.home_about_content for select
  to anon, authenticated
  using ( true );

-- Écriture réservée admin (politiques granulaires)
drop policy if exists "Admins can insert home about content" on public.home_about_content;
create policy "Admins can insert home about content"
  on public.home_about_content for insert
  to authenticated
  with check ( (select public.is_admin()) );

drop policy if exists "Admins can update home about content" on public.home_about_content;
create policy "Admins can update home about content"
  on public.home_about_content for update
  to authenticated
  using ( (select public.is_admin()) )
  with check ( (select public.is_admin()) );

drop policy if exists "Admins can delete home about content" on public.home_about_content;
create policy "Admins can delete home about content"
  on public.home_about_content for delete
  to authenticated
  using ( (select public.is_admin()) );
