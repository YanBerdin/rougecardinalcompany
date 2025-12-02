-- Vérifier la politique RLS INSERT actuelle sur spectacles
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'spectacles' 
  AND cmd = 'INSERT'
ORDER BY policyname;

-- Tester manuellement is_admin() pour l'utilisateur courant
SELECT 
  auth.uid() as current_user_id,
  public.is_admin() as is_admin_result;
