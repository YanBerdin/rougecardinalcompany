-- Script pour inspecter les tables profiles et user_invitations
-- Vérifier la structure de la table profiles
SELECT '=== TABLE: profiles ===' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Vérifier les données dans profiles
SELECT '=== DATA: profiles ===' as info;
SELECT user_id, role, display_name, created_at, updated_at
FROM profiles
ORDER BY created_at DESC
LIMIT 10;

-- Vérifier la structure de la table user_invitations
SELECT '=== TABLE: user_invitations ===' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'user_invitations'
ORDER BY ordinal_position;

-- Vérifier les données dans user_invitations
SELECT '=== DATA: user_invitations ===' as info;
SELECT user_id, email, role, invited_by, created_at
FROM user_invitations
ORDER BY created_at DESC
LIMIT 10;

-- Compter les enregistrements dans chaque table
SELECT '=== COUNTS ===' as info;
SELECT
  'profiles' as table_name,
  COUNT(*) as count
FROM profiles
UNION ALL
SELECT
  'user_invitations' as table_name,
  COUNT(*) as count
FROM user_invitations;