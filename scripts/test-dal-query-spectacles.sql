-- ============================================================================
-- DEBUG: Test exact DAL query for spectacles_medias
-- ============================================================================
-- Purpose: Reproduce EXACTLY what bulkCheckMediaUsagePublic does
-- Date: 2026-02-05
-- ============================================================================

-- 1. Get recent media IDs from spectacles folder (simulating bulk check)
\echo '--- STEP 1: Recent media IDs in spectacles folder ---'
WITH recent_spectacle_media AS (
    SELECT m.id as media_id
    FROM medias m
    JOIN media_folders mf ON m.folder_id = mf.id
    WHERE mf.name = 'spectacles'
    ORDER BY m.created_at DESC
    LIMIT 10
)
SELECT array_agg(media_id) as media_ids FROM recent_spectacle_media;

-- 2. Test the EXACT query used in bulkCheckMediaUsagePublic
-- Replace [1,2,3,4,5] with actual IDs from step 1
\echo '--- STEP 2: Test spectacles_medias query (REPLACE IDs below) ---'
-- ⚠️ REPLACE THE IDS BELOW WITH ACTUAL IDS FROM STEP 1 OUTPUT
WITH test_ids AS (
    SELECT m.id
    FROM medias m
    JOIN media_folders mf ON m.folder_id = mf.id
    WHERE mf.name = 'spectacles'
    ORDER BY m.created_at DESC
    LIMIT 10
)
SELECT 
    sm.media_id,
    s.id as spectacle_id,
    s.titre,
    s.public as spectacle_public,
    m.filename
FROM spectacles_medias sm
INNER JOIN spectacles s ON sm.spectacle_id = s.id
INNER JOIN medias m ON sm.media_id = m.id
WHERE sm.media_id IN (SELECT id FROM test_ids)
  AND s.public = true;

-- 3. Same query but show ALL spectacles (even inactive)
\echo '--- STEP 3: Same query WITHOUT active filter ---'
WITH test_ids AS (
    SELECT m.id
    FROM medias m
    JOIN media_folders mf ON m.folder_id = mf.id
    WHERE mf.name = 'spectacles'
    ORDER BY m.created_at DESC
    LIMIT 10
)
SELECT 
    sm.media_id,
    s.id as spectacle_id,
    s.titre,
    s.public as spectacle_public,
    m.filename,
    CASE 
        WHEN s.public = true THEN '✅ SHOULD SHOW BADGE'
        ELSE '❌ NO BADGE (non-public spectacle)'
    END as badge_status
FROM spectacles_medias sm
INNER JOIN spectacles s ON sm.spectacle_id = s.id
INNER JOIN medias m ON sm.media_id = m.id
WHERE sm.media_id IN (SELECT id FROM test_ids)
ORDER BY sm.media_id;

-- 4. Check type column (should all be 'landscape')
\echo '--- STEP 4: Check type column ---'
SELECT 
    type,
    COUNT(*) as count
FROM spectacles_medias
GROUP BY type;

-- 5. Detailed view of EACH recent media
\echo '--- STEP 5: Detailed status of recent media ---'
WITH recent_media AS (
    SELECT m.id, m.filename, m.created_at
    FROM medias m
    JOIN media_folders mf ON m.folder_id = mf.id
    WHERE mf.name = 'spectacles'
    ORDER BY m.created_at DESC
    LIMIT 10
)
SELECT 
    rm.id,
    rm.filename,
    rm.created_at,
    sm.spectacle_id,
    s.titre as spectacle_name,
    s.public as spectacle_public,
    sm.type as photo_type,
    CASE 
        WHEN sm.media_id IS NULL THEN '❌ NOT in spectacles_medias'
        WHEN s.public = false THEN '❌ Spectacle NON-PUBLIC'
        WHEN s.public = true THEN '✅ SHOULD SHOW BADGE'
        ELSE '❓ Unknown state'
    END as expected_badge_status
FROM recent_media rm
LEFT JOIN spectacles_medias sm ON rm.id = sm.media_id
LEFT JOIN spectacles s ON sm.spectacle_id = s.id
ORDER BY rm.created_at DESC;
