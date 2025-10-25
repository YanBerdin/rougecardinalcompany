-- audit_grants_filtered.sql
-- Version filtrée de l'audit qui exclut les objets système légitimes
-- Lists ACL entries that are REAL security issues (excludes known system objects)

-- Relations (tables, views, materialized views)
WITH relation_acls AS (
  SELECT n.nspname,
    c.relname,
    unnest(coalesce(c.relacl, '{}'::aclitem[])) AS acl_item,
    c.relkind
  FROM pg_class c
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE c.relkind IN ('r','v','m','f','p')
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
  -- EXCLUDE known system objects that are safe/expected
  AND NOT (
    -- PostgreSQL system catalog (information_schema)
    nspname = 'information_schema'
    OR
    -- Supabase Realtime system tables (internal use only)
    (nspname = 'realtime' AND relname IN ('messages', 'schema_migrations', 'subscription'))
    OR
    -- PostgreSQL system catalogs
    nspname IN ('pg_catalog', 'pg_toast')
  )
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
  -- EXCLUDE system functions
  AND nspname NOT IN ('information_schema', 'pg_catalog', 'realtime')
ORDER BY schema, object_name;

-- Note: This filtered version excludes:
-- 1. information_schema.* (PostgreSQL system catalog - safe default grants)
-- 2. realtime.* (Supabase Realtime system tables - managed by Supabase)
-- 3. pg_catalog.*, pg_toast.* (PostgreSQL internal schemas)
--
-- If this query returns 0 rows, your security audit PASSES ✅
