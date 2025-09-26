-- Seed initial pour la table public.spectacles
-- NOTE: Ce seed utilise des champs alignés avec le schéma actuel (voir knowledge-base §6.1)

insert into public.spectacles (title, slug, status, description, short_description, genre, duration_minutes, casting, premiere, image_url, public, awards)
values
  (
    'Les Murmures du Temps',
    'les-murmures-du-temps',
    'en_tournee',
    'Un voyage poétique à travers les âges, où passé et présent se rencontrent dans un dialogue bouleversant. Cette création originale explore les liens invisibles qui nous unissent à travers le temps.',
    'Voyage poétique entre passé et présent.',
    'Drame contemporain',
    90,
    4,
    '2023-10-15T20:30:00+02:00',
    'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1200',
    true,
    ARRAY['Nominé aux Molières 2024']
  ),
  (
    'Fragments d''Éternité',
    'fragments-d-eternite',
    'nouvelle_creation',
    'Une création originale qui explore les liens invisibles qui nous unissent, entre rire et larmes. Un spectacle touchant sur la condition humaine et nos quêtes de sens.',
    'Création originale sur les liens invisibles.',
    'Création originale',
    105,
    6,
    '2024-01-12T20:30:00+01:00',
    'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=1200',
    true,
    null
  ),
  (
    'La Danse des Ombres',
    'la-danse-des-ombres',
    'archive',
    'Adaptation moderne d''un classique, revisité avec audace et sensibilité par notre équipe artistique.',
    'Classique revisité avec audace.',
    'Classique revisité',
    95,
    5,
    '2023-05-10T20:30:00+02:00',
    'https://images.pexels.com/photos/3184340/pexels-photo-3184340.jpeg?auto=compress&cs=tinysrgb&w=1200',
    false,
    ARRAY['Prix du Public - Festival d''Avignon']
  ),
  (
    'Échos de Liberté',
    'echos-de-liberte',
    'archive',
    'Un spectacle engagé sur les droits humains et la liberté d''expression dans le monde contemporain.',
    'Spectacle engagé sur les droits humains.',
    'Théâtre documentaire',
    100,
    4,
    '2022-03-18T20:30:00+01:00',
    'https://images.pexels.com/photos/3184421/pexels-photo-3184421.jpeg?auto=compress&cs=tinysrgb&w=1200',
    false,
    ARRAY['Mention spéciale - Théâtre et Société']
  ),
  (
    'Rêves d''Enfance',
    'reves-d-enfance',
    'archive',
    'Un spectacle familial poétique qui ravive la magie de l''enfance chez petits et grands.',
    'Spectacle familial poétique.',
    'Tout public',
    80,
    3,
    '2021-11-02T19:00:00+01:00',
    'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1200',
    false,
    null
  ),
  (
    'Solitudes Partagées',
    'solitudes-partagees',
    'archive',
    'Une réflexion intimiste sur la solitude moderne et les moyens de créer du lien dans notre société.',
    'Réflexion intimiste sur la solitude.',
    'Drame psychologique',
    110,
    2,
    '2020-09-25T20:00:00+02:00',
    'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=1200',
    false,
    ARRAY['Prix de la Critique']
  );

-- Optionnel: actualiser la colonne search_vector si un trigger n'est pas encore en place
-- update public.spectacles set search_vector = public.to_tsvector_french(title || ' ' || coalesce(description,''));
