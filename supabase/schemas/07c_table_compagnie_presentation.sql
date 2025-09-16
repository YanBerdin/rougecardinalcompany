-- Table des sections de présentation de la compagnie
-- Ordre: 07c - après 07b (valeurs & stats), avant articles
-- Représente les entrées du tableau PresentationSection[] côté frontend
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
  image_url text,      -- image illustrative optionnelle
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
comment on column public.compagnie_presentation_sections.position is 'Ordre global croissant d\'affichage.';

-- Index
create index if not exists idx_compagnie_presentation_sections_active_order on public.compagnie_presentation_sections(active, position) where active = true;
create index if not exists idx_compagnie_presentation_sections_kind on public.compagnie_presentation_sections(kind);

-- RLS
alter table public.compagnie_presentation_sections enable row level security;

-- Lecture publique
 drop policy if exists "Compagnie presentation sections are viewable by everyone" on public.compagnie_presentation_sections;
create policy "Compagnie presentation sections are viewable by everyone"
  on public.compagnie_presentation_sections for select
  to anon, authenticated
  using ( true );

-- Écriture réservée admin
 drop policy if exists "Admins can manage compagnie presentation sections" on public.compagnie_presentation_sections;
create policy "Admins can manage compagnie presentation sections"
  on public.compagnie_presentation_sections for all
  to authenticated
  using ( (select public.is_admin()) )
  with check ( (select public.is_admin()) );

-- Vue admin pour exposer métadonnées versioning (ajoutée quand triggers actifs)
create or replace view public.compagnie_presentation_sections_admin as
select
  s.id,
  s.slug,
  s.kind,
  s.title,
  s.subtitle,
  s.content,
  s.quote_text,
  s.quote_author,
  s.image_url,
  s.position,
  s.active,
  s.created_at,
  s.updated_at,
  cv.version_number as last_version_number,
  cv.change_type as last_change_type,
  cv.created_at as last_version_created_at,
  vcount.total_versions
from public.compagnie_presentation_sections s
left join lateral (
  select version_number, change_type, created_at
  from public.content_versions
  where entity_type = 'compagnie_presentation_section' and entity_id = s.id
  order by version_number desc
  limit 1
) cv on true
left join lateral (
  select count(*)::integer as total_versions
  from public.content_versions
  where entity_type = 'compagnie_presentation_section' and entity_id = s.id
) vcount on true;

comment on view public.compagnie_presentation_sections_admin is 'Vue administration sections présentation avec métadonnées de versioning.';

