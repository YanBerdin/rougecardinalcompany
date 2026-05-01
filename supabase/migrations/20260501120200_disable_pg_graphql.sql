-- Migration: Disable pg_graphql extension
-- Purpose: pg_graphql exposes the full database schema to the anon role via GraphQL
--          introspection, allowing discovery of 40+ tables/views including sensitive data.
--          This project uses PostgREST (REST API) exclusively — GraphQL is not used.
--          Disabling this extension closes the introspection vector (lint=0026 root cause).
-- Affected: pg_graphql extension (schema: graphql_public)
-- Special considerations:
--   The CASCADE keyword ensures dependent objects (views, functions in graphql_public schema)
--   are also dropped cleanly. No application code uses GraphQL endpoints.

drop extension if exists pg_graphql cascade;
