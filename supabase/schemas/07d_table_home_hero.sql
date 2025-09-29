-- Table des slides Hero de la page d'accueil
-- Ordre: 07d - après 07c (sections présentation)
-- Représente les entrées HeroSlide[] (title, subtitle, description, image, cta)

drop table if exists public.home_hero_slides cascade;
create table public.home_hero_slides (
  id bigint generated always as identity primary key,
  slug text not null unique, -- identifiant stable (ex: saison-2025, creation-phare)
  title text not null,
  subtitle text,
  description text,
  image_url text, -- fallback externe
  image_media_id bigint null references public.medias(id) on delete set null, -- media prioritaire
  cta_label text, -- texte du bouton
  cta_url text,   -- lien associé (interne ou externe)
  position smallint not null default 0,
  active boolean not null default true,
  starts_at timestamptz, -- fenêtre d'activation planifiée (optionnel)
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.home_hero_slides is 'Slides hero page d accueil (carousel) avec CTA et planification optionnelle.';
comment on column public.home_hero_slides.slug is 'Identifiant stable pour ciblage et tracking.';
comment on column public.home_hero_slides.image_media_id is 'Référence media interne (prioritaire sur image_url).';
comment on column public.home_hero_slides.starts_at is 'Date/heure de début d affichage (NULL = immédiat).';
comment on column public.home_hero_slides.ends_at is 'Date/heure de fin d affichage (NULL = illimité).';

-- Index
create index if not exists idx_home_hero_slides_active_order on public.home_hero_slides(active, position) where active = true;
create index if not exists idx_home_hero_slides_schedule on public.home_hero_slides(starts_at, ends_at) where active = true;

-- RLS
alter table public.home_hero_slides enable row level security;

-- Lecture publique (slides actifs + fenêtre valide)
drop policy if exists "Home hero slides are viewable by everyone" on public.home_hero_slides;
create policy "Home hero slides are viewable by everyone"
  on public.home_hero_slides for select
  to anon, authenticated
  using (
    active = true
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at >= now())
  );

-- Gestion admin
-- Gestion admin (politiques granulaires)
drop policy if exists "Admins can insert home hero slides" on public.home_hero_slides;
create policy "Admins can insert home hero slides"
  on public.home_hero_slides for insert
  to authenticated
  with check ((select public.is_admin()));

drop policy if exists "Admins can update home hero slides" on public.home_hero_slides;
create policy "Admins can update home hero slides"
  on public.home_hero_slides for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admins can delete home hero slides" on public.home_hero_slides;
create policy "Admins can delete home hero slides"
  on public.home_hero_slides for delete
  to authenticated
  using ((select public.is_admin()));
