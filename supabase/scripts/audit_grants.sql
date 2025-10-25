-- audit_grants.sql
-- Lists ACL entries on relations (tables/views) and functions that grant privileges to
-- PUBLIC, anon or authenticated roles. Run as a superuser or in the SQL Editor.

-- Relations (tables, views, materialized views)
WITH relation_acls AS (
  SELECT n.nspname,
    c.relname,
    unnest(coalesce(c.relacl, '{}'::aclitem[])) AS acl_item,
    c.relkind
  FROM pg_class c
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE c.relkind IN ('r','v','m','f','p') -- table, view, materialized view, foreign table, partitioned table
)
  SELECT
  'relation' AS object_type,
  nspname AS schema,
  relname AS object_name,
  CASE WHEN split_part(acl_item::text, '=', 1) = '' THEN 'PUBLIC' ELSE split_part(acl_item::text, '=', 1) END AS grantee,
  split_part(split_part(acl_item::text, '=', 2), '/', 1) AS privileges,
  relkind
FROM relation_acls
WHERE (CASE WHEN split_part(acl_item::text, '=', 1) = '' THEN 'PUBLIC' ELSE split_part(acl_item::text, '=', 1) END) IN ('PUBLIC', 'anon', 'authenticated')
ORDER BY schema, object_name;

-- Functions (procedures)
WITH function_acls AS (
  SELECT n.nspname,
    p.oid,
    p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')' AS func_sig,
    unnest(coalesce(p.proacl, '{}'::aclitem[])) AS acl_item
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
)
SELECT
  'function' AS object_type,
  nspname AS schema,
  func_sig AS object_name,
  CASE WHEN split_part(acl_item::text, '=', 1) = '' THEN 'PUBLIC' ELSE split_part(acl_item::text, '=', 1) END AS grantee,
  split_part(split_part(acl_item::text, '=', 2), '/', 1) AS privileges
FROM function_acls
WHERE (CASE WHEN split_part(acl_item::text, '=', 1) = '' THEN 'PUBLIC' ELSE split_part(acl_item::text, '=', 1) END) IN ('PUBLIC', 'anon', 'authenticated')
ORDER BY schema, object_name;

-- Additional: list role memberships to see if anon/authenticated are members of unusual roles
SELECT 'role_membership' AS object_type, r.rolname AS role, m.roleid::regrole::text AS member_of
FROM pg_auth_members m
JOIN pg_roles r ON m.member = r.oid
WHERE r.rolname IN ('anon','authenticated') OR m.roleid::regrole::text IN ('anon','authenticated')
;
