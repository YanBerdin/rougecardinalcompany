-- Quick check: List ALL database objects with grants to PUBLIC/anon/authenticated
-- This will help us see what might still need to be fixed

\echo '=== TABLES WITH PUBLIC/ANON/AUTHENTICATED GRANTS ==='
\echo ''

SELECT 
  nspname AS schema,
  relname AS table_name,
  CASE WHEN split_part(unnest(coalesce(c.relacl, '{}'::aclitem[]))::text, '=', 1) = '' 
    THEN 'PUBLIC' 
    ELSE split_part(unnest(coalesce(c.relacl, '{}'::aclitem[]))::text, '=', 1) 
  END AS grantee,
  relkind AS type
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE c.relkind IN ('r','v','m')
  AND (CASE WHEN split_part(unnest(coalesce(c.relacl, '{}'::aclitem[]))::text, '=', 1) = '' 
    THEN 'PUBLIC' 
    ELSE split_part(unnest(coalesce(c.relacl, '{}'::aclitem[]))::text, '=', 1) 
  END) IN ('PUBLIC', 'anon', 'authenticated')
  AND nspname NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
ORDER BY schema, table_name, grantee;

\echo ''
\echo '=== FUNCTIONS WITH PUBLIC/ANON/AUTHENTICATED GRANTS ==='
\echo ''

SELECT 
  n.nspname AS schema,
  p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')' AS function_sig,
  CASE WHEN split_part(unnest(coalesce(p.proacl, '{}'::aclitem[]))::text, '=', 1) = '' 
    THEN 'PUBLIC' 
    ELSE split_part(unnest(coalesce(p.proacl, '{}'::aclitem[]))::text, '=', 1) 
  END AS grantee
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE (CASE WHEN split_part(unnest(coalesce(p.proacl, '{}'::aclitem[]))::text, '=', 1) = '' 
    THEN 'PUBLIC' 
    ELSE split_part(unnest(coalesce(p.proacl, '{}'::aclitem[]))::text, '=', 1) 
  END) IN ('PUBLIC', 'anon', 'authenticated')
  AND n.nspname NOT IN ('information_schema', 'pg_catalog')
ORDER BY schema, function_sig, grantee
LIMIT 50;
