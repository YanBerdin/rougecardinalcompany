-- Table des sections de présentation de la compagnie
-- Ordre: 07c - après 07b (valeurs & stats), avant articles
-- Représente les entrées du tableau PresentationSection[] côté frontend (Page 'La Compagnie' /compagnie)
-- Objectif: rendre administrable la structure et le contenu éditorial modulable (hero, history, quote, values, team, mission, custom)

-- Suppression recréation déclarative
 drop table if exists public.compagnie_presentation_sections cascade;
create table public.compagnie_presentation_sections (
  id bigint generated always as identity primary key,
  slug text not null unique, -- correspond à PresentationSection.id (ex: hero, history, mission, quote-history)
  kind text not null check (kind in ('hero','history','quote','values','team','mission','custom')),
  title text,          -- facultatif selon le type
  subtitle text,       -- facultatif
  content text[],      -- liste de paragraphes (history, mission, custom)
  quote_text text,     -- utilisé si kind = quote
  quote_author text,   -- auteur citation
  image_url text,      -- image illustrative optionnelle (fallback)
  image_media_id bigint null references public.medias(id) on delete set null, -- media stocké prioritaire
  position smallint not null default 0, -- ordre général sur la page
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.compagnie_presentation_sections is 'Sections dynamiques de la page présentation compagnie (hero, history, mission, values placeholder, team placeholder, quotes, custom).';
comment on column public.compagnie_presentation_sections.slug is 'Identifiant stable référencé par le frontend.';
comment on column public.compagnie_presentation_sections.kind is 'Type de section (enum contrôlé côté DB).';
comment on column public.compagnie_presentation_sections.content is 'Liste ordonnée de paragraphes (NULL si non pertinent).';
comment on column public.compagnie_presentation_sections.quote_text is 'Texte de la citation si kind = quote.';
comment on column public.compagnie_presentation_sections.position is 'Ordre global croissant d affichage.';
comment on column public.compagnie_presentation_sections.image_media_id is 'Référence vers un media (prioritaire sur image_url).';

-- Index
create index if not exists idx_compagnie_presentation_sections_active_order on public.compagnie_presentation_sections(active, position) where active = true;
create index if not exists idx_compagnie_presentation_sections_kind on public.compagnie_presentation_sections(kind);

-- RLS
alter table public.compagnie_presentation_sections enable row level security;

-- Public users see only active sections
drop policy if exists "Active presentation sections are viewable by everyone" on public.compagnie_presentation_sections;
create policy "Active presentation sections are viewable by everyone"
  on public.compagnie_presentation_sections for select
  to anon, authenticated
  using ( active = true );

-- Admins see ALL sections (including inactive)
drop policy if exists "Admins can view all presentation sections" on public.compagnie_presentation_sections;
create policy "Admins can view all presentation sections"
  on public.compagnie_presentation_sections for select
  to authenticated
  using ( (select public.is_admin()) );

-- Écriture réservée admin
-- Gestion admin (politiques granulaires)
drop policy if exists "Admins can insert compagnie presentation sections" on public.compagnie_presentation_sections;
create policy "Admins can insert compagnie presentation sections"
  on public.compagnie_presentation_sections for insert
  to authenticated
  with check ( (select public.is_admin()) );

drop policy if exists "Admins can update compagnie presentation sections" on public.compagnie_presentation_sections;
create policy "Admins can update compagnie presentation sections"
  on public.compagnie_presentation_sections for update
  to authenticated
  using ( (select public.is_admin()) )
  with check ( (select public.is_admin()) );

drop policy if exists "Admins can delete compagnie presentation sections" on public.compagnie_presentation_sections;
create policy "Admins can delete compagnie presentation sections"
  on public.compagnie_presentation_sections for delete
  to authenticated
  using ( (select public.is_admin()) );

-- Vue admin déplacée dans 41_views_admin_content_versions.sql (dépend de content_versions)

