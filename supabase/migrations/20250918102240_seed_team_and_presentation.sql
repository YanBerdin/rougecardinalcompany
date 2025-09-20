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
--  PresentationSection[] -> public.compagnie_presentation_sections
-- supprimé ici => 20250921110000_seed_compagnie_presentation_sections.sql