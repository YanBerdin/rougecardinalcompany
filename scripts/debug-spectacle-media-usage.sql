-- Script de debug pour vérifier le tracking d'usage des photos de spectacles
-- Date: 5 février 2026

-- 1. Lister toutes les photos dans spectacles_medias
SELECT 
  sm.spectacle_id,
  sm.media_id,
  sm.type,
  sm.ordre,
  s.titre as spectacle_titre,
  s.active as spectacle_active,
  m.filename,
  m.storage_path
FROM spectacles_medias sm
INNER JOIN spectacles s ON sm.spectacle_id = s.id
INNER JOIN medias m ON sm.media_id = m.id
ORDER BY sm.spectacle_id, sm.ordre;

-- 2. Compter les photos par spectacle et par type
SELECT 
  s.id as spectacle_id,
  s.titre,
  s.active,
  COUNT(*) FILTER (WHERE sm.type = 'landscape') as nb_landscape_photos,
  COUNT(*) FILTER (WHERE sm.type = 'gallery') as nb_gallery_photos,
  COUNT(*) as total_photos
FROM spectacles s
LEFT JOIN spectacles_medias sm ON s.id = sm.spectacle_id
GROUP BY s.id, s.titre, s.active
HAVING COUNT(*) > 0
ORDER BY s.active DESC, s.titre;

-- 3. Tester la requête exacte utilisée dans media-usage.ts (remplacer :media_id par un ID réel)
-- Exemple avec media_id = 123 (ADAPTER À VOTRE CAS)
SELECT 
  sm.id,
  sm.spectacle_id,
  sm.media_id,
  s.id as spectacle_id_inner,
  s.active
FROM spectacles_medias sm
INNER JOIN spectacles s ON sm.spectacle_id = s.id
WHERE sm.media_id = 123  -- ❗ REMPLACER PAR VOTRE MEDIA_ID
  AND s.active = true;

-- 4. Vérifier les spectacles actifs avec photos
SELECT 
  s.id,
  s.titre,
  s.slug,
  s.active,
  COUNT(sm.media_id) as nb_photos
FROM spectacles s
LEFT JOIN spectacles_medias sm ON s.id = sm.spectacle_id
WHERE s.active = true
GROUP BY s.id, s.titre, s.slug, s.active
HAVING COUNT(sm.media_id) > 0;

-- 5. Trouver les médias qui DEVRAIENT avoir le badge mais ne l'ont peut-être pas
SELECT DISTINCT
  m.id as media_id,
  m.filename,
  m.storage_path,
  'spectacle_photos' as expected_location,
  s.titre as used_in_spectacle,
  s.active as spectacle_is_active
FROM medias m
INNER JOIN spectacles_medias sm ON m.id = sm.media_id
INNER JOIN spectacles s ON sm.spectacle_id = s.id
WHERE s.active = true
ORDER BY m.id;
