-- Verification script: Check RLS policies for all affected tables
-- Date: 2025-10-26

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN (
  'spectacles',
  'partners', 
  'home_hero_slides',
  'home_about_content',
  'compagnie_stats',
  'configurations_site',
  'communiques_presse'
)
ORDER BY tablename, cmd, policyname;
