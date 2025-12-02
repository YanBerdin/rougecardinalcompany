-- migration: seed initial (idempotent) pour contenus de base
-- tables affectées: public.compagnie_stats, public.communiques_presse, public.partners, public.spectacles
-- considerations: 
--   - utilise on conflict/merge pour assurer l'idempotence
--   - n'altère pas les policies rls existantes
--   - ne force pas les relations optionnelles (spectacle_id/evenement_id)
--   - champs updated_at rafraîchis lors des updates
-- usage: appliquée via supabase migrations (local ou cloud)

set client_min_messages = warning;

-----------------------------
-- 1) compagnie_stats (StatItem[])
-----------------------------
insert into public.compagnie_stats (key, label, value, position, active, created_at, updated_at)
values
  ('spectacles_crees', 'Spectacles créés', '50+', 1, true, now(), now()),
  ('spectateurs', 'Spectateurs', '25 000+', 2, true, now(), now()),
  ('annees_experience', 'Années d``expérience', '15+', 3, true, now(), now()),
  ('prix', 'Prix & distinctions', '7', 4, true, now(), now())
on conflict (key) do update
set
  label = excluded.label,
  value = excluded.value,
  position = excluded.position,
  active = excluded.active,
  updated_at = now();

-----------------------------
-- 2) communiques_presse (NewsItem[])
--    NB: relations éventuelles spectacle_id/evenement_id laissées null
-----------------------------
merge into public.communiques_presse as t
using (
  values
    ('nouvelle-creation-2025', 'Nouvelle création 2025', 'Annonce officielle de la nouvelle création de la Compagnie Rouge‑Cardinal.', date '2025-03-05', 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1200', 10, true),
    ('tournee-printemps-2026', 'Tournée printemps 2026', 'Lancement de la tournée de printemps en France et à l''international.', date '2026-03-15', 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=1200', 20, true),
    ('atelier-jeunesse-2025', 'Atelier jeunesse 2025', 'Programme d''ateliers pour le jeune public en partenariat avec des établissements scolaires.', date '2025-10-01', 'https://images.pexels.com/photos/3184421/pexels-photo-3184421.jpeg?auto=compress&cs=tinysrgb&w=1200', 30, true)
) as s(slug, title, description, date_publication, image_url, ordre_affichage, public)
on t.slug = s.slug
when matched then update set
  title = s.title,
  description = s.description,
  date_publication = s.date_publication,
  image_url = s.image_url,
  ordre_affichage = s.ordre_affichage,
  public = s.public,
  updated_at = now()
when not matched then insert (
  title, slug, description, date_publication, image_url,
  spectacle_id, evenement_id, ordre_affichage, public,
  created_by, created_at, updated_at
) values (
  s.title, s.slug, s.description, s.date_publication, s.image_url,
  null, null, s.ordre_affichage, s.public,
  null, now(), now()
);

-----------------------------
-- 3) partners (partnersData[])
--    clé naturelle = name (si un slug est ajouté plus tard, préférez slug unique)
-----------------------------
merge into public.partners as p
using (
  values
    ('Ville de Paris', 'Soutien institutionnel à la création et à la diffusion.', 'https://www.paris.fr', 'https://dummyimage.com/300x150/000/fff&text=Ville+de+Paris', true, 10),
    ('Ministère de la Culture', 'Partenaire culturel national.', 'https://www.culture.gouv.fr', 'https://dummyimage.com/300x150/000/fff&text=Ministere', true, 20),
    ('Théâtre des Champs-Élysées', 'Partenaire scène.', 'https://www.theatrechampselysees.fr', 'https://dummyimage.com/300x150/000/fff&text=Theatre+CE', true, 30)
) as s(name, description, website_url, logo_url, is_active, display_order)
on p.name = s.name
when matched then update set
  description = s.description,
  website_url = s.website_url,
  logo_url = s.logo_url,
  is_active = s.is_active,
  display_order = s.display_order,
  updated_at = now()
when not matched then insert (
  name, description, website_url, logo_url, logo_media_id,
  is_active, display_order, created_by, created_at, updated_at
) values (
  s.name, s.description, s.website_url, s.logo_url, null,
  s.is_active, s.display_order, null, now(), now()
);

-----------------------------
-- 4) spectacles (Show[])
--    clé naturelle = slug
-----------------------------
merge into public.spectacles as sp
using (
  values
    ('romeo-et-juliette', 'Roméo et Juliette', 'Drame', 120, 8, 'Réinterprétation contemporaine du classique de Shakespeare.', 'Une fresque amoureuse et tragique revisitée.', timestamp with time zone '2025-11-15 20:00:00+00', 'https://images.pexels.com/photos/167636/pexels-photo-167636.jpeg'),
    ('la-tempete', 'La Tempête', 'Drame', 110, 7, 'Magie, pouvoir et rédemption sur une île mystérieuse.', 'Un conte envoûtant entre illusion et réalité.', timestamp with time zone '2026-02-20 20:00:00+00', 'https://images.pexels.com/photos/158163/clouds-cloudporn-weather-lookup-158163.jpeg'),
    ('le-misanthrope', 'Le Misanthrope', 'comedie', 105, 6, 'Satire mordante des mœurs et des hypocrisies sociales.', 'Molière en version incisive et moderne.', timestamp with time zone '2025-09-30 20:00:00+00', 'https://images.pexels.com/photos/167092/pexels-photo-167092.jpeg')
) as s(slug, title, genre, duration_minutes, casting, description, short_description, premiere, image_url)
on sp.slug = s.slug
when matched then update set
  title = s.title,
  genre = s.genre,
  duration_minutes = s.duration_minutes,
  casting = s.casting,
  description = s.description,
  short_description = s.short_description,
  premiere = s.premiere,
  image_url = s.image_url,
  updated_at = now()
when not matched then insert (
  title, slug, status, description, short_description, genre,
  duration_minutes, casting, premiere, image_url, public,
  awards, created_by, created_at, updated_at
) values (
  s.title, s.slug, 'actuellement', s.description, s.short_description, s.genre,
  s.duration_minutes, s.casting, s.premiere, s.image_url, true,
  null, null, now(), now()
);
