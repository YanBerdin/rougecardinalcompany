-- Migration: Simplify check_valid_event_types constraint on evenements.genres
-- Purpose: Remove speculative unused genre values; add missing 'théâtre' and 'photographie'
--          which are used as fallback values in the DAL (lib/dal/agenda.ts).
-- Changes:
--   - Removed: spectacle, premiere, première (not genres), workshop, conference, masterclass,
--              répétition, repetition, audition, casting, formation, residency, résidence
--   - Added:   théâtre, theatre, photographie  (used in DAL fallback or expected)
--   - Kept:    atelier, rencontre

-- Purge values that are not genres from existing rows
update public.evenements
  set genres = array_remove(array_remove(array_remove(genres, 'première'), 'premiere'), 'spectacle')
  where 'première' = any(genres) or 'premiere' = any(genres) or 'spectacle' = any(genres);

alter table public.evenements
  drop constraint if exists check_valid_event_types;

alter table public.evenements
  add constraint check_valid_event_types
  check (
    genres is null
    or genres <@ array[
      'théâtre', 'theatre',
      'photographie', 'atelier', 'rencontre'
    ]::text[]
  );

comment on constraint check_valid_event_types on public.evenements
  is 'Types d''événements limités à une liste prédéfinie (colonne genres)';
