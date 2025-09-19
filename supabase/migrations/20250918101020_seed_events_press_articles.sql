-- migration: seed initial (idempotent) pour evenements, communiques_presse et articles_presse
-- tables affectées:
--   - public.evenements (eventsdata: event[])
--   - public.communiques_presse (pressreleasesdata[] + newsdata[])
--   - public.articles_presse (mediaarticlesdata[])
-- considérations:
--   - utilise merge pour idempotence sans altérer schéma/rls
--   - références spectacles via slug -> id (lieu_id laissé null)
--   - aucun drop/truncate; safe à rejouer

set client_min_messages = warning;

-- =====================================
-- 1) eventsdata: seed public.evenements
-- clé de correspondance pour merge: (spectacle_id, date_debut, start_time)
-- note: lieu_id non renseigné, status par défaut 'scheduled'
-- =====================================
with data(slug, date_debut, date_fin, start_time, end_time, capacity, price_cents, status, ticket_url, image_url, type_array) as (
  values
    ('romeo-et-juliette', timestamptz '2025-12-01 19:30:00+00', timestamptz '2025-12-01 21:30:00+00', time '19:30', time '21:30', 350, 2800, 'scheduled', 'https://tickets.example.com/rj-2025-12-01', 'https://images.pexels.com/photos/167636/pexels-photo-167636.jpeg', array['spectacle','premiere']::text[]),
    ('romeo-et-juliette', timestamptz '2025-12-02 20:30:00+00', timestamptz '2025-12-02 22:30:00+00', time '20:30', time '22:30', 350, 2800, 'scheduled', 'https://tickets.example.com/rj-2025-12-02', 'https://images.pexels.com/photos/167636/pexels-photo-167636.jpeg', array['spectacle']::text[]),
  ('la-tempete',        timestamptz '2026-03-01 20:00:00+00', timestamptz '2026-03-01 21:50:00+00', time '20:00', time '21:50', 500, 3200, 'scheduled', 'https://tickets.example.com/tempete-2026-03-01', 'https://images.pexels.com/photos/158163/clouds-cloudporn-weather-lookup-158163.jpeg', array['spectacle']::text[]),
    ('le-misanthrope',    timestamptz '2025-10-05 19:00:00+00', timestamptz '2025-10-05 20:45:00+00', time '19:00', time '20:45', 280, 2400, 'scheduled', 'https://tickets.example.com/misanthrope-2025-10-05', 'https://images.pexels.com/photos/167092/pexels-photo-167092.jpeg', array['spectacle']::text[])
), s as (
  select sp.id as spectacle_id, d.*
  from data d
  join public.spectacles sp on sp.slug = d.slug
)
merge into public.evenements e
using (
  select spectacle_id, date_debut, date_fin, start_time, end_time, capacity, price_cents, status, ticket_url, image_url, type_array
  from s
) x
on e.spectacle_id = x.spectacle_id and e.date_debut = x.date_debut and e.start_time = x.start_time
when matched then update set
  date_fin = x.date_fin,
  end_time = x.end_time,
  capacity = x.capacity,
  price_cents = x.price_cents,
  status = x.status,
  ticket_url = x.ticket_url,
  image_url = x.image_url,
  type_array = x.type_array,
  updated_at = now()
when not matched then insert (
  spectacle_id, lieu_id, date_debut, date_fin, capacity, price_cents, status, metadata,
  recurrence_rule, recurrence_end_date, parent_event_id, ticket_url, image_url, start_time, end_time, type_array,
  created_at, updated_at
) values (
  x.spectacle_id, null, x.date_debut, x.date_fin, x.capacity, x.price_cents, x.status, '{}'::jsonb,
  null, null, null, x.ticket_url, x.image_url, x.start_time, x.end_time, x.type_array,
  now(), now()
);

-- =====================================
-- 2) pressreleasesdata[] + newsdata[]: seed public.communiques_presse
-- clé: slug (unique)
-- =====================================
merge into public.communiques_presse as t
using (
  values
    -- press releases
    ('dossier-presse-tempete-2026', 'Dossier de presse — La Tempête', 'Dossier complet pour la presse (photos HD, dossier PDF).', date '2026-02-01', 'https://images.pexels.com/photos/158163/clouds-cloudporn-weather-lookup-158163.jpeg', 5, true),
    ('communique-misanthrope-2025', 'Communiqué — Le Misanthrope', 'Annonce de reprise et calendrier des dates.', date '2025-09-10', 'https://images.pexels.com/photos/167092/pexels-photo-167092.jpeg', 15, true),
    -- news
    ('bilan-saison-2025', 'Bilan de saison 2025', 'Retour sur les temps forts et chiffres clés.', date '2025-12-31', 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg', 40, true),
    ('partenariat-nouveau-2025', 'Nouveau partenariat 2025', 'Signature d’un partenariat stratégique pour la prochaine saison.', date '2025-11-20', 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg', 35, true)
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

-- =====================================
-- clé de correspondance: slug
-- =====================================
merge into public.articles_presse as a
using (
  values
    ('critique-romeo-juliette-telerama', 'Réinvention ardente de Roméo et Juliette', 'Télérama', 'https://www.telerama.fr/sortir/critique-romeo-juliette', 'critique', 'Camille Martin', 'Un spectacle incandescent porté par une troupe vibrante.', 'Une lecture contemporaine qui assume ses audaces, sans trahir l’émotion originelle.', timestamptz '2025-12-02 08:00:00+00'),
    ('la-tempete-lemonde-chronique', 'La Tempête, entre sortilèges et douceur', 'Le Monde', 'https://www.lemonde.fr/culture/article/2026/03/02/la-tempete', 'chronique', 'Hugo Bernard', 'Une proposition visuelle puissante, servie par une direction d’acteurs précise.', 'Le plateau devient carte des vents, les corps dessinent l’orage.', timestamptz '2026-03-02 07:30:00+00'),
    ('misanthrope-liberation-entretien', 'Entretien: la franchise de Molière aujourd’hui', 'Libération', 'https://www.liberation.fr/culture/theatre/misanthrope', 'entretien', 'Julie Rey', 'Un dialogue sur la misanthropie contemporaine et ses ambiguïtés.', 'Entre satire et tendresse, la mise à nu des relations.', timestamptz '2025-10-06 10:15:00+00')
) as s(slug, title, source_publication, source_url, type, author, chapo, excerpt, published_at)
on a.slug = s.slug
when matched then update set
  title = s.title,
  author = s.author,
  type = s.type,
  chapo = s.chapo,
  excerpt = s.excerpt,
  source_publication = s.source_publication,
  source_url = s.source_url,
  published_at = s.published_at,
  updated_at = now()
when not matched then insert (
  title, author, type, slug, chapo, excerpt, source_publication, source_url, published_at, created_at, updated_at
) values (
  s.title, s.author, s.type, s.slug, s.chapo, s.excerpt, s.source_publication, s.source_url, s.published_at, now(), now()
);
