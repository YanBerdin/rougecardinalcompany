-- Check detailed RLS policies for spectacles table
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
ORDER BY cmd, policyname;

-- Also check if there are any restrictive policies
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
AND permissive = 'RESTRICTIVE';
