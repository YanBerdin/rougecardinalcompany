-- Migration: Drop check_valid_event_types constraint on evenements.genres
-- Purpose: Allow free-text genres (not limited to a fixed list)
-- Affected: public.evenements (constraint removal only)
-- Security: Form is admin-only (requireMinRole("editor")); genres validated by Zod
--           (max 10 genres, max 50 chars each); rendered via React text nodes (no XSS risk)
-- Note: Previous constraint limited genres to 5 fixed values ('théâtre', 'theatre',
--       'photographie', 'atelier', 'rencontre'). Application-layer validation replaces it.

alter table public.evenements
  drop constraint if exists check_valid_event_types;
