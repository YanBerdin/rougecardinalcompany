-- Quick manual audit test to verify grants after Round 7
-- Run this in Supabase SQL Editor to verify security status
-- Expected result: 0 rows returned (except potentially information_schema warnings)

SELECT 
  schemaname,
  tablename,
  CASE 
    WHEN has_table_privilege('anon', schemaname || '.' || tablename, 'SELECT') THEN 'anon: SELECT'
    WHEN has_table_privilege('anon', schemaname || '.' || tablename, 'INSERT') THEN 'anon: INSERT'
    WHEN has_table_privilege('anon', schemaname || '.' || tablename, 'UPDATE') THEN 'anon: UPDATE'
    WHEN has_table_privilege('anon', schemaname || '.' || tablename, 'DELETE') THEN 'anon: DELETE'
    WHEN has_table_privilege('authenticated', schemaname || '.' || tablename, 'SELECT') THEN 'authenticated: SELECT'
    WHEN has_table_privilege('authenticated', schemaname || '.' || tablename, 'INSERT') THEN 'authenticated: INSERT'
    WHEN has_table_privilege('authenticated', schemaname || '.' || tablename, 'UPDATE') THEN 'authenticated: UPDATE'
    WHEN has_table_privilege('authenticated', schemaname || '.' || tablename, 'DELETE') THEN 'authenticated: DELETE'
  END as grant_type
FROM pg_tables
WHERE schemaname IN ('public', 'realtime')
  AND (
    has_table_privilege('anon', schemaname || '.' || tablename, 'SELECT')
    OR has_table_privilege('anon', schemaname || '.' || tablename, 'INSERT')
    OR has_table_privilege('anon', schemaname || '.' || tablename, 'UPDATE')
    OR has_table_privilege('anon', schemaname || '.' || tablename, 'DELETE')
    OR has_table_privilege('authenticated', schemaname || '.' || tablename, 'SELECT')
    OR has_table_privilege('authenticated', schemaname || '.' || tablename, 'INSERT')
    OR has_table_privilege('authenticated', schemaname || '.' || tablename, 'UPDATE')
    OR has_table_privilege('authenticated', schemaname || '.' || tablename, 'DELETE')
  )
ORDER BY schemaname, tablename;

-- Also check views
SELECT 
  schemaname,
  viewname,
  CASE 
    WHEN has_table_privilege('anon', schemaname || '.' || viewname, 'SELECT') THEN 'anon: SELECT'
    WHEN has_table_privilege('authenticated', schemaname || '.' || viewname, 'SELECT') THEN 'authenticated: SELECT'
  END as grant_type
FROM pg_views
WHERE schemaname = 'public'
  AND (
    has_table_privilege('anon', schemaname || '.' || viewname, 'SELECT')
    OR has_table_privilege('authenticated', schemaname || '.' || viewname, 'SELECT')
  )
ORDER BY schemaname, viewname;
