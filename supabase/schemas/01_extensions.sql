-- Extensions requises pour Rouge Cardinal Company
-- Ordre: 01 - Exécuté en premier pour définir les extensions nécessaires

create schema if not exists extensions;
grant usage on schema extensions to postgres, anon, authenticated, service_role;

create extension if not exists "pgcrypto" with schema extensions; -- Génération UUID optionnelle
create extension if not exists "unaccent" with schema extensions; -- Pour generate_slug()
create extension if not exists "pg_trgm" with schema extensions;   -- Index trigram pour recherche fuzzy
create extension if not exists "citext" with schema extensions;    -- Case-insensitive text pour emails
