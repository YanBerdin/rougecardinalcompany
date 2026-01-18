-- Extensions requises pour Rouge Cardinal Company
-- Ordre: 01 - Exécuté en premier pour définir les extensions nécessaires

create schema if not exists extensions;
grant usage on schema extensions to postgres, anon, authenticated, service_role;

create extension if not exists "pgcrypto" with schema extensions; -- Génération UUID optionnelle
create extension if not exists "unaccent" with schema extensions; -- Pour generate_slug()
create extension if not exists "pg_trgm" with schema extensions;   -- Index trigram pour recherche fuzzy
create extension if not exists "citext" with schema extensions;    -- Case-insensitive text pour emails

-- ============================================
-- Rôle pour les vues admin
-- Impact: Isolation des vues admin pour sécurité renforcée (TASK037)
-- ============================================
do $$
begin
  if not exists (select from pg_catalog.pg_roles where rolname = 'admin_views_owner') then
    create role admin_views_owner nologin;
  end if;
end
$$;

-- Grant usage on public schema to admin_views_owner
grant usage on schema public to admin_views_owner;
