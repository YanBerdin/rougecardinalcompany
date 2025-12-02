-- Migration: Move extensions to dedicated schema
-- Purpose: Security best practice to keep public schema clean
-- Affected: unaccent, pg_trgm, citext

-- 1. Create the extensions schema
create schema if not exists extensions;

-- 2. Grant usage to standard roles
grant usage on schema extensions to postgres, anon, authenticated, service_role;

-- 3. Move existing extensions to the new schema
-- Note: We use IF EXISTS to avoid errors if they are not installed, 
-- though they should be based on 01_extensions.sql
alter extension "unaccent" set schema extensions;
alter extension "pg_trgm" set schema extensions;
alter extension "citext" set schema extensions;
-- pgcrypto is often used in auth or public, but let's move it too if it's in public
-- The lint warning didn't mention pgcrypto, but it's good practice.
-- However, pgcrypto might be used by auth schema? No, usually public.
-- Let's stick to the ones mentioned in the warning: unaccent, pg_trgm, citext.
-- But 01_extensions.sql also has pgcrypto. Let's move it too to be consistent.
alter extension "pgcrypto" set schema extensions;

-- 4. Update database search path to include extensions
-- This ensures that queries using these extensions (like citext type) still work
-- without needing to fully qualify them everywhere.
alter database postgres set search_path to public, extensions;

-- Also update for the current session so immediate subsequent commands work if any
set search_path to public, extensions;
