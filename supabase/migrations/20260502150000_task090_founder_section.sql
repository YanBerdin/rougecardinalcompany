-- migration: task090 — section "founder" éditable
-- objectif:
--   1. étendre l'enum check de compagnie_presentation_sections.kind avec la valeur 'founder'
--   2. ajouter la colonne milestones (jsonb) pour stocker les jalons biographiques du fondateur
--   3. seed idempotent de la ligne founder (slug='founder') avec contenu issu du composant statique précédent
--
-- entités impactées:
--   - public.compagnie_presentation_sections (check + colonne + insert)
--
-- considérations:
--   - migration aussi représentée dans le schéma déclaratif supabase/schemas/07c_table_compagnie_presentation.sql
--   - l'insert utilise on conflict (slug) do nothing pour rester idempotent

-- 1. étendre la contrainte check (drop + create pour ajouter 'founder')
alter table public.compagnie_presentation_sections
  drop constraint if exists compagnie_presentation_sections_kind_check;

alter table public.compagnie_presentation_sections
  add constraint compagnie_presentation_sections_kind_check
  check (kind in ('hero','history','quote','values','team','mission','custom','founder'));

-- 2. ajouter la colonne milestones si absente
alter table public.compagnie_presentation_sections
  add column if not exists milestones jsonb;

comment on column public.compagnie_presentation_sections.milestones is
  'Liste ordonnée de jalons biographiques (year, label) si kind = founder.';

-- 3. seed de la section founder (idempotent)
insert into public.compagnie_presentation_sections (
  slug,
  kind,
  title,
  subtitle,
  content,
  image_url,
  alt_text,
  milestones,
  position,
  active
)
values (
  'founder',
  'founder',
  'Florian Chaillot',
  'Metteur en scène & Fondateur',
  array[
    'Titulaire d''un double master de littérature et de philosophie à la Sorbonne et à la Sorbonne-nouvelle, Florian se destine à la création théâtrale. En tant que metteur en scène, il adapte d''abord le drame indien Sacountala qui connaît une reconnaissance universitaire puis La Farce de Maître Pathelin.',
    'Comme dramaturge, il travaille notamment en 2022 auprès de Lilo Baur pour sa mise en scène de L''Avare à la Comédie-Française et avec Emmanuel Besnault en 2024 pour l''adaptation du Grand Meaulnes à la scène. En 2023 il assiste Sophie Bricaire pour sa mise en scène du gala de l''Opéra de Lorraine à Nancy.',
    'Il est également guide conférencier et régisseur spécialisé dans le surtitrage à la Comédie-Française, afin de permettre à un public malvoyant et malentendant d''assister à des représentations.',
    'Il est également photographe et, en 2025, il expose pour la première fois ses photos à Paris.'
  ],
  'https://yvtrlvmbofklefxcxrzv.supabase.co/storage/v1/object/public/medias/team/1776350784063-IMG_3043---retouch-.jpg',
  'Portrait de Florian Chaillot, fondateur de la Compagnie Rouge Cardinal',
  '[
    {"year":"2022","label":"L''Avare - Comédie-Française"},
    {"year":"2023","label":"Gala de l''Opéra de Lorraine"},
    {"year":"2024","label":"Le Grand Meaulnes - scène"},
    {"year":"2025","label":"Exposition photo - Paris"}
  ]'::jsonb,
  (select coalesce(max(position), 0) + 1 from public.compagnie_presentation_sections),
  true
)
on conflict (slug) do nothing;
