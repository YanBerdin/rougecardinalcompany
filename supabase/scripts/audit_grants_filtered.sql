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
    -- Supabase Storage system tables (managed via Storage API and RLS on storage.objects)
    (nspname = 'storage' AND relname IN ('buckets', 'buckets_analytics', 'objects', 'prefixes', 's3_multipart_uploads', 's3_multipart_uploads_parts'))
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
  -- EXCLUDE system functions and extensions
  AND nspname NOT IN (
    'information_schema',  -- PostgreSQL system catalog
    'pg_catalog',          -- PostgreSQL internal functions
    'realtime',            -- Supabase Realtime internal functions
    'graphql',             -- Supabase GraphQL extension (pg_graphql)
    'graphql_public',      -- Supabase GraphQL public API
    'extensions',          -- Supabase extensions (pgjwt, pg_net, etc.)
    'auth'                 -- Supabase Auth functions (safe - used by SDK)
  )
  -- EXCLUDE pg_trgm extension functions (fuzzy search - safe system extension)
  AND func_sig NOT LIKE '%gtrgm%'
  AND func_sig NOT LIKE '%gin_extract%trgm%'
  AND func_sig NOT LIKE '%gin_trgm_%'
  AND func_sig NOT LIKE '%set_limit%'
  AND func_sig NOT LIKE '%show_limit%'
  AND func_sig NOT LIKE '%show_trgm%'
  AND func_sig NOT LIKE '%similarity%'
  -- EXCLUDE citext extension functions (case-insensitive text - safe system extension)
  AND func_sig NOT LIKE '%citext%'
  -- EXCLUDE unaccent extension functions (text normalization - safe system extension)  
  AND func_sig NOT LIKE '%unaccent%'
ORDER BY schema, object_name;

-- Note: This filtered version excludes:
-- 1. information_schema.*, pg_catalog.* (PostgreSQL system)
-- 2. realtime.*, storage.* (6 tables), graphql.*, graphql_public.* (Supabase internal)
-- 3. extensions.* (Supabase extensions: pgjwt, pg_net, pgrst, etc.)
-- 4. auth.* (Supabase Auth functions - used safely by SDKs)
-- 5. pg_trgm functions (gtrgm_*, gin_extract%trgm*, gin_trgm_*, similarity_*, set_limit, show_limit, show_trgm)
-- 6. citext functions (case-insensitive text type)
-- 7. unaccent functions (text normalization)
--
-- If this query returns 0 rows, your security audit PASSES ✅
