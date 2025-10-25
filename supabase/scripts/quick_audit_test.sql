-- Quick Audit Test Script - Copy/paste into Supabase SQL Editor
-- This is a simplified version of audit_grants.sql for manual verification
-- Expected: 0 rows (all exposed objects should be revoked)

-- Check for relations exposed to PUBLIC/anon/authenticated
WITH relation_acls AS (
  SELECT 
    n.nspname,
    c.relname,
    unnest(coalesce(c.relacl, '{}'::aclitem[])) AS acl_item,
    c.relkind
  FROM pg_class c
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE c.relkind IN ('r','v','m','f','p')
    AND n.nspname IN ('public', 'information_schema')
)
SELECT
  'relation' AS object_type,
  nspname AS schema,
  relname AS object_name,
  CASE 
    WHEN split_part(acl_item::text, '=', 1) = '' THEN 'PUBLIC' 
    ELSE split_part(acl_item::text, '=', 1) 
  END AS grantee,
  split_part(split_part(acl_item::text, '=', 2), '/', 1) AS privileges
FROM relation_acls
WHERE (
  CASE 
    WHEN split_part(acl_item::text, '=', 1) = '' THEN 'PUBLIC' 
    ELSE split_part(acl_item::text, '=', 1) 
  END
) IN ('PUBLIC', 'anon', 'authenticated')
ORDER BY schema, object_name;

-- Expected result: 0 rows
-- If you see rows, those objects still have exposed grants
