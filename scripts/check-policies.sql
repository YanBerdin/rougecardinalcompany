-- Check RLS policies on critical tables
SELECT 
  tablename,
  policyname,
  cmd,
  substring(qual::text from 1 for 80) as using_clause,
  substring(with_check::text from 1 for 80) as with_check_clause
FROM pg_policies 
WHERE tablename IN ('messages_contact', 'analytics_events', 'abonnes_newsletter', 'logs_audit')
ORDER BY tablename, policyname;
