-- Table des slides Hero de la page d'accueil
-- Ordre: 07d - après 07c (sections présentation)
-- Représente les entrées HeroSlide[] (title, subtitle, description, image, cta primaire + secondaire)

drop table if exists public.home_hero_slides cascade;
create table public.home_hero_slides (
  id bigint generated always as identity primary key,
  slug text not null unique, -- identifiant stable (ex: saison-2025, creation-phare)
  title text not null,
  subtitle text,
  description text,
  image_url text, -- fallback externe
  image_media_id bigint null references public.medias(id) on delete set null, -- media prioritaire
  alt_text text not null default '', -- texte alternatif pour l'accessibilité (max 125 caractères)
  
  -- CTA Primaire (bouton principal - style plein)
  cta_primary_enabled boolean not null default false,
  cta_primary_label text,
  cta_primary_url text,
  
  -- CTA Secondaire (bouton secondaire - style outline)
  cta_secondary_enabled boolean not null default false,
  cta_secondary_label text,
  cta_secondary_url text,
  
  position smallint not null default 0,
  active boolean not null default true,
  starts_at timestamptz, -- fenêtre d'activation planifiée (optionnel)
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.home_hero_slides is 'Slides hero page d''accueil (carousel) avec CTA primaire/secondaire et planification optionnelle.';
comment on column public.home_hero_slides.slug is 'Identifiant stable pour ciblage et tracking.';
comment on column public.home_hero_slides.image_media_id is 'Référence media interne (prioritaire sur image_url).';
comment on column public.home_hero_slides.alt_text is 'Texte alternatif pour l''image (accessibilité, max 125 caractères).';
comment on column public.home_hero_slides.cta_primary_enabled is 'Activer/désactiver le CTA primaire (bouton plein).';
comment on column public.home_hero_slides.cta_primary_label is 'Label du bouton CTA primaire (max 50 caractères).';
comment on column public.home_hero_slides.cta_primary_url is 'URL du bouton CTA primaire (relative ou absolue).';
comment on column public.home_hero_slides.cta_secondary_enabled is 'Activer/désactiver le CTA secondaire (bouton outline).';
comment on column public.home_hero_slides.cta_secondary_label is 'Label du bouton CTA secondaire (max 50 caractères).';
comment on column public.home_hero_slides.cta_secondary_url is 'URL du bouton CTA secondaire (relative ou absolue).';
comment on column public.home_hero_slides.starts_at is 'Date/heure de début d''affichage (NULL = immédiat).';
comment on column public.home_hero_slides.ends_at is 'Date/heure de fin d''affichage (NULL = illimité).';

-- Contraintes de validation
alter table public.home_hero_slides
  add constraint home_hero_slides_alt_text_length 
    check (char_length(alt_text) <= 125),
  
  add constraint home_hero_slides_cta_primary_label_length 
    check (cta_primary_label is null or char_length(cta_primary_label) <= 50),
  
  add constraint home_hero_slides_cta_secondary_label_length 
    check (cta_secondary_label is null or char_length(cta_secondary_label) <= 50),
  
  -- CTA Primaire : si activé, label ET url requis
  add constraint home_hero_slides_cta_primary_consistency 
    check (
      (cta_primary_enabled = false) 
      or 
      (cta_primary_enabled = true and cta_primary_label is not null and cta_primary_url is not null)
    ),
  
  -- CTA Secondaire : si activé, label ET url requis
  add constraint home_hero_slides_cta_secondary_consistency 
    check (
      (cta_secondary_enabled = false) 
      or 
      (cta_secondary_enabled = true and cta_secondary_label is not null and cta_secondary_url is not null)
    );

create index if not exists idx_home_hero_slides_active_order on public.home_hero_slides(active, position) where active = true;
create index if not exists idx_home_hero_slides_schedule on public.home_hero_slides(starts_at, ends_at) where active = true;
-- policies: public active slides OR admins can view all
drop policy if exists "Home hero slides are viewable by everyone" on public.home_hero_slides;
drop policy if exists "Admins can view all home hero slides" on public.home_hero_slides;

create policy "View home hero slides (public active OR admin all)"
  on public.home_hero_slides for select
  to anon, authenticated
  using (
    (
      active = true
      and (starts_at is null or starts_at <= now())
      and (ends_at is null or ends_at >= now())
    )
    or (select public.is_admin())
  );
create policy "Admins can view all home hero slides"
  on public.home_hero_slides for select
  to authenticated
  using ((select public.is_admin()));

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
