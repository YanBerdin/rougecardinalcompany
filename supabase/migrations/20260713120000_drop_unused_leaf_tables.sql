-- Migration: Drop unused empty leaf tables
-- Purpose: Remove scaffolded-but-never-used tables that are empty (0 rows),
--          have no incoming foreign keys, no dependent views, and no runtime
--          code references (verified against cloud DB on 2026-07-13).
-- Affected (dropped): public.spectacles_membres_equipe, public.articles_medias,
--   public.spectacles_categories, public.spectacles_tags,
--   public.articles_categories, public.articles_tags,
--   public.pending_invitations
-- Special considerations:
--   - DESTRUCTIVE: each `drop table ... cascade` removes the table together
--     with its RLS policies, indexes, constraints and triggers.
--   - All targeted tables were confirmed empty (0 rows) prior to this migration.
--   - The press/media taxonomy still in use (categories, tags,
--     communiques_categories, communiques_tags, communiques_medias,
--     media_item_tags) is intentionally NOT touched here.
--   - The active views (communiques_presse_public, spectacles_*_photos_admin)
--     are intentionally preserved.

-- ============================================================================
-- DESTRUCTIVE DROPS (leaf tables, verified empty and unreferenced)
-- ============================================================================

-- Casting spectacle <-> membre : scaffold jamais câblé (spectacles.casting text utilisé à la place)
drop table if exists public.spectacles_membres_equipe cascade;

-- Jonction articles <-> médias : jamais alimentée, aucune vue dépendante
drop table if exists public.articles_medias cascade;

-- Jonctions taxonomie spectacles : feature catégories/tags jamais activée côté UI
drop table if exists public.spectacles_categories cascade;
drop table if exists public.spectacles_tags cascade;

-- Jonctions taxonomie articles : feature catégories/tags jamais activée côté UI
drop table if exists public.articles_categories cascade;
drop table if exists public.articles_tags cascade;

-- File d'attente d'invitations retry : remplacée en pratique par user_invitations
drop table if exists public.pending_invitations cascade;
