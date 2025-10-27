-- Script de vérification des RLS policies
-- Vérifie que toutes les tables ont RLS activé ET des policies

SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  (SELECT count(*) 
   FROM pg_policies 
   WHERE schemaname = c.schemaname 
   AND tablename = c.tablename) as policy_count
FROM pg_tables c
WHERE schemaname = 'public'
  AND tablename IN (
    'communiques_presse',
    'home_hero_slides',
    'compagnie_stats',
    'spectacles',
    'configurations_site',
    'partners',
    'home_about_content'
  )
ORDER BY tablename;
