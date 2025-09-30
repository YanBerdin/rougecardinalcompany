-- Seed initial pour la table public.lieux
-- Migration idempotente (MERGE sur nom + ville)

set client_min_messages = warning;

merge into public.lieux as l
using (
  values
    ('Théâtre Municipal de Lyon', '2 Rue de la République', 'Lyon', '69001', 'France', 45.764043, 4.835659, 800),
    ('Salle des Fêtes de Montreuil', '88 Avenue Parmentier', 'Montreuil', '93100', 'France', 48.8592, 2.4417, 300),
    ('Centre Culturel Jacques Brel', '1 Place Salvador Allende', 'Thonon-les-Bains', '74200', 'France', 46.3719, 6.4813, 450),
    ('Théâtre de la Cité', '15 Rue de la République', 'Toulouse', '31000', 'France', 43.6047, 1.4442, 600),
    ('Maison de la Culture de Grenoble', '4 Rue du Vieux Temple', 'Grenoble', '38000', 'France', 45.1885, 5.7245, 500)
) as s(nom, adresse, ville, code_postal, pays, latitude, longitude, capacite)
on l.nom = s.nom and l.ville = s.ville
when matched then update set
  adresse = s.adresse,
  code_postal = s.code_postal,
  pays = s.pays,
  latitude = s.latitude,
  longitude = s.longitude,
  capacite = s.capacite,
  updated_at = now()
when not matched then insert (
  nom, adresse, ville, code_postal, pays, latitude, longitude, capacite, metadata, created_at, updated_at
) values (
  s.nom, s.adresse, s.ville, s.code_postal, s.pays, s.latitude, s.longitude, s.capacite, '{}'::jsonb, now(), now()
);