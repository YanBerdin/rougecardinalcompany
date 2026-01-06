-- Check RLS policies on the 4 tables
select 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  qual is not null as has_using,
  with_check is not null as has_with_check
from pg_policies 
where tablename in ('abonnes_newsletter', 'messages_contact', 'logs_audit', 'analytics_events')
order by tablename, policyname;
