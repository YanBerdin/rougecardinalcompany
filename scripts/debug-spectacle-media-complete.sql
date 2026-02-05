-- ============================================================================
-- DEBUG: Spectacle Media Usage - Complete Analysis
-- ============================================================================
-- Purpose: Investigate why new images via SpectacleFormImageSection don't show
--          "Utilisé sur le site" badge while old images do
-- Date: 2026-02-05
-- ============================================================================

-- 1. List ALL media in spectacles folder
SELECT 
    m.id,
    m.filename,
    m.created_at,
    m.thumbnail_path IS NOT NULL as has_thumbnail,
    mf.name as folder
FROM medias m
LEFT JOIN media_folders mf ON m.folder_id = mf.id
WHERE mf.name = 'spectacles'
ORDER BY m.created_at DESC
LIMIT 20;

-- 2. Check spectacles_medias junction table (ALL entries)
SELECT 
    sm.spectacle_id,
    sm.media_id,
    sm.ordre,
    sm.type,
    sm.created_at as link_created_at,
    s.titre as spectacle_name,
    s.public as spectacle_public,
    m.filename as media_filename,
    m.created_at as media_created_at
FROM spectacles_medias sm
JOIN spectacles s ON sm.spectacle_id = s.id
JOIN medias m ON sm.media_id = m.id
ORDER BY sm.created_at DESC;

-- 3. Media that SHOULD have badge (in spectacles_medias + spectacle active)
SELECT 
    m.id as media_id,
    m.filename,
    m.created_at as media_created,
    sm.created_at as linked_at,
    s.titre as spectacle_name,
    s.public as spectacle_public
FROM medias m
JOIN spectacles_medias sm ON m.id = sm.media_id
JOIN spectacles s ON sm.spectacle_id = s.id
WHERE s.public = true
ORDER BY sm.created_at DESC;

-- 4. Check for media in spectacles folder NOT in spectacles_medias
SELECT 
    m.id,
    m.filename,
    m.created_at,
    'NOT IN spectacles_medias' as status
FROM medias m
JOIN media_folders mf ON m.folder_id = mf.id
WHERE mf.name = 'spectacles'
AND NOT EXISTS (
    SELECT 1 FROM spectacles_medias sm WHERE sm.media_id = m.id
)
ORDER BY m.created_at DESC;

-- 5. Check for spectacles_medias with INACTIVE spectacles
SELECT 
    sm.media_id,
    m.filename,
    s.titre as spectacle_name,
    s.public as spectacle_public,
    'NON-PUBLIC SPECTACLE' as issue
FROM spectacles_medias sm
JOIN spectacles s ON sm.spectacle_id = s.id
JOIN medias m ON sm.media_id = m.id
WHERE s.public = false
ORDER BY sm.created_at DESC;

-- 6. Compare old vs new images (by creation date)
-- Images created BEFORE 2026-01-01 vs AFTER
SELECT 
    CASE 
        WHEN m.created_at < '2026-01-01' THEN 'OLD (before 2026-01-01)'
        ELSE 'NEW (after 2026-01-01)'
    END as image_age,
    COUNT(*) as total_count,
    COUNT(sm.media_id) as in_spectacles_medias,
    COUNT(CASE WHEN s.public = true THEN 1 END) as with_public_spectacle
FROM medias m
JOIN media_folders mf ON m.folder_id = mf.id
LEFT JOIN spectacles_medias sm ON m.id = sm.media_id
LEFT JOIN spectacles s ON sm.spectacle_id = s.id
WHERE mf.name = 'spectacles'
GROUP BY 
    CASE 
        WHEN m.created_at < '2026-01-01' THEN 'OLD (before 2026-01-01)'
        ELSE 'NEW (after 2026-01-01)'
    END
ORDER BY image_age;

-- 7. Exact test of the problematic media IDs
-- First, show the most recent 5 media in spectacles folder
\echo '--- MOST RECENT 5 MEDIA IN SPECTACLES FOLDER ---'
SELECT 
    m.id,
    m.filename,
    m.created_at,
    EXISTS(SELECT 1 FROM spectacles_medias sm WHERE sm.media_id = m.id) as is_in_spectacles_medias,
    (
        SELECT s.public 
        FROM spectacles_medias sm 
        JOIN spectacles s ON sm.spectacle_id = s.id 
        WHERE sm.media_id = m.id 
        LIMIT 1
    ) as spectacle_public
FROM medias m
JOIN media_folders mf ON m.folder_id = mf.id
WHERE mf.name = 'spectacles'
ORDER BY m.created_at DESC
LIMIT 5;
