-- migration: seed initial (idempotent) pour membres_equipe et compagnie_presentation_sections
-- tables: public.membres_equipe, public.compagnie_presentation_sections
-- approche: MERGE/ON CONFLICT sur clé naturelle (name pour team, slug pour sections)

set client_min_messages = warning;

-- =====================================
-- 1) TeamMember[] -> public.membres_equipe
-- clé naturelle utilisée: name (si besoin, on pourra ajouter une colonne slug unique plus tard)
-- =====================================
merge into public.membres_equipe as t
using (
  values
    ('Anne Dupont', 'Directrice artistique', 'Fondatrice de la compagnie, elle dirige la vision artistique et la dramaturgie des créations.', 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg', 10, true),
    ('Marc Leroy', 'Metteur en scène', 'Explore des formes scéniques contemporaines, au croisement du texte et du mouvement.', 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg', 20, true),
    ('Sara Benali', 'Comédienne', 'Interprète principale sur plusieurs productions, portée par un jeu sensible et physique.', 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg', 30, true),
    ('Hugo Martin', 'Chargé de production', 'Coordonne la production, les tournées et les partenariats institutionnels.', 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg', 40, true),
    ('Léa Robert', 'Scénographe', 'Conçoit des espaces évocateurs pour une immersion poétique du public.', 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg', 50, true)
) as s(name, role, description, image_url, ordre, active)
on t.name = s.name
when matched then update set
  role = s.role,
  description = s.description,
  image_url = s.image_url,
  ordre = s.ordre,
  active = s.active,
  updated_at = now()
when not matched then insert (
  name, role, description, image_url, photo_media_id, ordre, active, created_at, updated_at
) values (
  s.name, s.role, s.description, s.image_url, null, s.ordre, s.active, now(), now()
);

-- =====================================
-- 2) PresentationSection[] -> public.compagnie_presentation_sections
-- clé naturelle: slug (unique)
-- champs array: content est text[]
-- =====================================
merge into public.compagnie_presentation_sections as ps
using (
  values
    -- Hero
    ('hero', 'hero', 'Rouge Cardinal', 'Théâtre contemporain, sensible et exigeant', null::text[], null::text, null::text, 'https://images.pexels.com/photos/713149/pexels-photo-713149.jpeg', 5, true),
    -- History
    ('history', 'history', 'Histoire', null,
      array[
        'Née d''un désir de troupe, la Compagnie Rouge Cardinal mêle textes classiques et écritures contemporaines.',
        'De la scène à l''espace public, elle cultive un rapport direct et poétique avec les spectateurs.'
      ]::text[],
      null::text, null::text, null::text, 20, true),
    -- Quote (historique)
    ('quote-history', 'quote', null, null, null::text[],
      'Le théâtre est l''endroit de la présence partagée.', 'A. Dupont', null::text, 25, true),
    -- Values (placeholder, contenu détaillé via table compagnie_values)
    ('values', 'values', 'Nos valeurs', 'Exigence, collectif, innovation', null::text[], null::text, null::text, null::text, 40, true),
    -- Team (placeholder, liste alimentée via membres_equipe)
    ('team', 'team', 'L''équipe', 'Artistes et collaborateurs', null::text[], null::text, null::text, null::text, 50, true),
    -- Mission
    ('mission', 'mission', 'Notre mission', null,
      array[
        'Créer des formes théâtrales vivantes qui interrogent le monde.',
        'Partager des expériences sensibles avec des publics divers, en France et à l''international.'
      ]::text[],
      null::text, null::text, null::text, 30, true)
) as s(slug, kind, title, subtitle, content, quote_text, quote_author, image_url, position, active)
on ps.slug = s.slug
when matched then update set
  kind = s.kind,
  title = s.title,
  subtitle = s.subtitle,
  content = s.content,
  quote_text = s.quote_text,
  quote_author = s.quote_author,
  image_url = s.image_url,
  position = s.position,
  active = s.active,
  updated_at = now()
when not matched then insert (
  slug, kind, title, subtitle, content, quote_text, quote_author, image_url, image_media_id, position, active, created_at, updated_at
) values (
  s.slug, s.kind, s.title, s.subtitle, s.content, s.quote_text, s.quote_author, s.image_url, null, s.position, s.active, now(), now()
);
