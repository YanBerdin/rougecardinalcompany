-- Seed initial pour categories et tags
-- Migration idempotente (MERGE sur slug)

set client_min_messages = warning;

-- ============================
-- 1) Categories de base
-- ============================
merge into public.categories as c
using (
  values
    ('theatral', 'Théâtral', 'Productions théâtrales classiques et contemporaines', null::bigint, '#e74c3c', 'theater', 10, true),
    ('musical', 'Musical', 'Spectacles mêlant théâtre et musique', null::bigint, '#9b59b6', 'music', 20, true),
    ('jeune-public', 'Jeune Public', 'Spectacles adaptés aux enfants et adolescents', null::bigint, '#f39c12', 'users', 30, true),
    ('creation', 'Création', 'Créations originales de la compagnie', null::bigint, '#27ae60', 'lightbulb', 40, true),
    ('reprise', 'Reprise', 'Reprises et adaptations d''œuvres existantes', null::bigint, '#3498db', 'refresh-cw', 50, true)
) as s(slug, name, description, parent_id, color, icon, display_order, is_active)
on c.slug = s.slug
when matched then update set
  name = s.name,
  description = s.description,
  parent_id = s.parent_id,
  color = s.color,
  icon = s.icon,
  display_order = s.display_order,
  is_active = s.is_active,
  updated_at = now()
when not matched then insert (
  name, slug, description, parent_id, color, icon, display_order, is_active, created_by, created_at, updated_at
) values (
  s.name, s.slug, s.description, s.parent_id, s.color, s.icon, s.display_order, s.is_active, null, now(), now()
);

-- ============================
-- 2) Tags de base
-- ============================
merge into public.tags as t
using (
  values
    ('shakespeare', 'Shakespeare', 'Œuvres de William Shakespeare', 0, true),
    ('moliere', 'Molière', 'Œuvres de Molière', 0, true),
    ('contemporain', 'Contemporain', 'Théâtre contemporain', 0, true),
    ('classique', 'Classique', 'Théâtre classique', 0, true),
    ('musical', 'Musical', 'Spectacles musicaux', 0, false),
    ('famille', 'Famille', 'Spectacles familiaux', 0, false),
    ('solo', 'Solo', 'Spectacles en solo', 0, false),
    ('duo', 'Duo', 'Spectacles à deux interprètes', 0, false),
    ('troupe', 'Troupe', 'Spectacles avec la troupe complète', 0, false),
    ('improvisation', 'Improvisation', 'Spectacles d''improvisation', 0, false),
    ('comedie', 'Comédie', 'Spectacles comiques', 0, true),
    ('drame', 'Drame', 'Spectacles dramatiques', 0, true),
    ('poesie', 'Poésie', 'Spectacles poétiques', 0, false),
    ('danse', 'Danse', 'Spectacles intégrant la danse', 0, false),
    ('interactive', 'Interactive', 'Spectacles interactifs avec le public', 0, false)
) as s(slug, name, description, usage_count, is_featured)
on t.slug = s.slug
when matched then update set
  name = s.name,
  description = s.description,
  usage_count = s.usage_count,
  is_featured = s.is_featured,
  updated_at = now()
when not matched then insert (
  name, slug, description, usage_count, is_featured, created_by, created_at, updated_at
) values (
  s.name, s.slug, s.description, s.usage_count, s.is_featured, null, now(), now()
);