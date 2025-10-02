-- Seed: Communiqués de presse et Kit Média
-- Date: 2025-10-02
-- Description: Peuple les tables communiques_presse et medias pour le kit média professionnel

-- ============================================
-- 1. MÉDIAS POUR KIT MÉDIA
-- ============================================

-- Logos (différents formats) - avec URLs externes pour téléchargement
insert into public.medias (storage_path, filename, mime, size_bytes, alt_text, metadata)
select 
  'press-kit/logos/rouge-cardinal-logo-horizontal.svg',
  'rouge-cardinal-logo-horizontal.svg',
  'image/svg+xml',
  15360,
  'Logo Rouge Cardinal Company - Format horizontal',
  '{"type": "logo", "title": "Logo Horizontal SVG", "external_url": "https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/theater.svg"}'::jsonb
where not exists (select 1 from public.medias where storage_path = 'press-kit/logos/rouge-cardinal-logo-horizontal.svg');

insert into public.medias (storage_path, filename, mime, size_bytes, alt_text, metadata)
select 
  'press-kit/logos/rouge-cardinal-logo-vertical.png',
  'rouge-cardinal-logo-vertical.png',
  'image/png',
  245760,
  'Logo Rouge Cardinal Company - Format vertical',
  '{"type": "logo", "title": "Logo Vertical PNG", "external_url": "https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=400&h=600&fit=crop"}'::jsonb
where not exists (select 1 from public.medias where storage_path = 'press-kit/logos/rouge-cardinal-logo-vertical.png');

insert into public.medias (storage_path, filename, mime, size_bytes, alt_text, metadata)
select 
  'press-kit/logos/rouge-cardinal-icon.svg',
  'rouge-cardinal-icon.svg',
  'image/svg+xml',
  8192,
  'Icône Rouge Cardinal Company',
  '{"type": "icon", "title": "Icône SVG", "external_url": "https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/theater.svg"}'::jsonb
where not exists (select 1 from public.medias where storage_path = 'press-kit/logos/rouge-cardinal-icon.svg');

-- Photos haute définition pour la presse - avec URLs Unsplash téléchargeables
insert into public.medias (storage_path, filename, mime, size_bytes, alt_text, metadata)
select 'photos/spectacle-scene-1.jpg', 'spectacle-scene-1.jpg', 'image/jpeg', 2048000, 'Scène du spectacle - Photo 1', '{"type": "photo", "resolution": "300dpi", "usage": "press", "external_url": "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=1920&h=1280&fit=crop&fm=jpg&q=80"}'::jsonb
where not exists (select 1 from public.medias where storage_path = 'photos/spectacle-scene-1.jpg');

insert into public.medias (storage_path, filename, mime, size_bytes, alt_text, metadata)
select 'photos/spectacle-scene-2.jpg', 'spectacle-scene-2.jpg', 'image/jpeg', 2150000, 'Scène du spectacle - Photo 2', '{"type": "photo", "resolution": "300dpi", "usage": "press", "external_url": "https://images.unsplash.com/photo-1503095396549-807759245b35?w=1920&h=1280&fit=crop&fm=jpg&q=80"}'::jsonb
where not exists (select 1 from public.medias where storage_path = 'photos/spectacle-scene-2.jpg');

insert into public.medias (storage_path, filename, mime, size_bytes, alt_text, metadata)
select 'photos/equipe-artistique.jpg', 'equipe-artistique.jpg', 'image/jpeg', 1890000, 'Équipe artistique Rouge Cardinal', '{"type": "photo", "resolution": "300dpi", "usage": "press", "external_url": "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1920&h=1280&fit=crop&fm=jpg&q=80"}'::jsonb
where not exists (select 1 from public.medias where storage_path = 'photos/equipe-artistique.jpg');

-- Dossiers de presse PDF - avec URLs externes vers PDFs de démo
insert into public.medias (storage_path, filename, mime, size_bytes, alt_text, metadata)
select 'dossiers/dossier-presse-2025.pdf', 'dossier-presse-2025.pdf', 'application/pdf', 3145728, 'Dossier de presse 2025', '{"type": "press_kit", "year": 2025, "pages": 24, "external_url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"}'::jsonb
where not exists (select 1 from public.medias where storage_path = 'dossiers/dossier-presse-2025.pdf');

insert into public.medias (storage_path, filename, mime, size_bytes, alt_text, metadata)
select 'dossiers/fiche-technique-spectacle.pdf', 'fiche-technique-spectacle.pdf', 'application/pdf', 512000, 'Fiche technique spectacle', '{"type": "technical_sheet", "category": "spectacle", "external_url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"}'::jsonb
where not exists (select 1 from public.medias where storage_path = 'dossiers/fiche-technique-spectacle.pdf');

-- ============================================
-- 2. COMMUNIQUÉS DE PRESSE
-- ============================================

insert into public.communiques_presse (title, slug, description, date_publication, image_url, file_size_bytes, public, ordre_affichage)
select 
  'Nouvelle création : La Tempête de Shakespeare',
  'nouvelle-creation-la-tempete-2025',
  'La compagnie Rouge Cardinal présente sa nouvelle création : La Tempête de Shakespeare dans une mise en scène contemporaine audacieuse.',
  now() - interval '15 days',
  'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800',
  250880,
  true,
  1
where not exists (select 1 from public.communiques_presse where slug = 'nouvelle-creation-la-tempete-2025');

insert into public.communiques_presse (title, slug, description, date_publication, image_url, file_size_bytes, public, ordre_affichage)
select 
  'Tournée nationale 2025-2026 : 25 dates confirmées',
  'tournee-nationale-2025-2026',
  'La compagnie Rouge Cardinal annonce 25 dates de tournée nationale pour la saison 2025-2026.',
  now() - interval '30 days',
  'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800',
  184320,
  true,
  2
where not exists (select 1 from public.communiques_presse where slug = 'tournee-nationale-2025-2026');

insert into public.communiques_presse (title, slug, description, date_publication, image_url, file_size_bytes, public, ordre_affichage)
select 
  'Prix du Théâtre Contemporain 2024',
  'prix-theatre-contemporain-2024',
  'Rouge Cardinal Company remporte le Prix du Théâtre Contemporain 2024 pour "Fragments d''Éternité".',
  now() - interval '60 days',
  'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800',
  327680,
  true,
  3
where not exists (select 1 from public.communiques_presse where slug = 'prix-theatre-contemporain-2024');

insert into public.communiques_presse (title, slug, description, date_publication, image_url, file_size_bytes, public, ordre_affichage)
select 
  'Nouveau partenariat avec la Région Auvergne-Rhône-Alpes',
  'partenariat-region-auvergne-rhone-alpes',
  'Nouveau partenariat stratégique entre Rouge Cardinal Company et la Région Auvergne-Rhône-Alpes.',
  now() - interval '90 days',
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
  199680,
  true,
  4
where not exists (select 1 from public.communiques_presse where slug = 'partenariat-region-auvergne-rhone-alpes');

-- ============================================
-- 3. CATÉGORIES POUR COMMUNIQUÉS
-- ============================================

-- Insérer des catégories si elles n'existent pas
insert into public.categories (name, slug, description, is_active, display_order)
select 'Nouvelles Créations', 'nouvelles-creations', 'Annonces de nouvelles créations théâtrales', true, 1
where not exists (select 1 from public.categories where slug = 'nouvelles-creations');

insert into public.categories (name, slug, description, is_active, display_order)
select 'Tournées', 'tournees', 'Dates de tournée et représentations', true, 2
where not exists (select 1 from public.categories where slug = 'tournees');

insert into public.categories (name, slug, description, is_active, display_order)
select 'Prix et Distinctions', 'prix-distinctions', 'Récompenses et reconnaissances', true, 3
where not exists (select 1 from public.categories where slug = 'prix-distinctions');

insert into public.categories (name, slug, description, is_active, display_order)
select 'Partenariats', 'partenariats', 'Collaborations et partenariats institutionnels', true, 4
where not exists (select 1 from public.categories where slug = 'partenariats');

-- Associer les communiqués aux catégories
insert into public.communiques_categories (communique_id, category_id)
select cp.id, c.id
from public.communiques_presse as cp
cross join public.categories as c
where cp.slug = 'nouvelle-creation-la-tempete-2025' and c.slug = 'nouvelles-creations'
  and not exists (
    select 1 from public.communiques_categories cc
    where cc.communique_id = cp.id and cc.category_id = c.id
  );

insert into public.communiques_categories (communique_id, category_id)
select cp.id, c.id
from public.communiques_presse as cp
cross join public.categories as c
where cp.slug = 'tournee-nationale-2025-2026' and c.slug = 'tournees'
  and not exists (
    select 1 from public.communiques_categories cc
    where cc.communique_id = cp.id and cc.category_id = c.id
  );

insert into public.communiques_categories (communique_id, category_id)
select cp.id, c.id
from public.communiques_presse as cp
cross join public.categories as c
where cp.slug = 'prix-theatre-contemporain-2024' and c.slug = 'prix-distinctions'
  and not exists (
    select 1 from public.communiques_categories cc
    where cc.communique_id = cp.id and cc.category_id = c.id
  );

insert into public.communiques_categories (communique_id, category_id)
select cp.id, c.id
from public.communiques_presse as cp
cross join public.categories as c
where cp.slug = 'partenariat-region-auvergne-rhone-alpes' and c.slug = 'partenariats'
  and not exists (
    select 1 from public.communiques_categories cc
    where cc.communique_id = cp.id and cc.category_id = c.id
  );

-- ============================================
-- NOTES D'EXÉCUTION
-- ============================================

-- Ce seed est idempotent (WHERE NOT EXISTS sur chaque insert)
-- Pour l'exécuter en local :
-- psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres?sslmode=disable" \
--   -f supabase/migrations/20251002120000_seed_communiques_presse_et_media_kit.sql

-- Pour vérifier les données :
-- select * from public.communiques_presse;
-- select * from public.medias where storage_path like 'press-kit/%';
-- select cp.title, c.name as category
-- from public.communiques_presse cp
-- join public.communiques_categories cc on cc.communique_id = cp.id
-- join public.categories c on c.id = cc.category_id;
