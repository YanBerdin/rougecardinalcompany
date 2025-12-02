-- Vérifier si les RLS policies ont vraiment été créées sur Cloud
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  substring(qual::text, 1, 100) as using_clause,
  substring(with_check::text, 1, 100) as with_check_clause
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN (
  'home_hero_slides',
  'compagnie_stats',
  'communiques_presse',
  'configurations_site',
  'spectacles',
  'partners',
  'home_about_content'
)
ORDER BY tablename, cmd, policyname;
