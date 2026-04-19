-- Migration: Rename type_array → genres on evenements table
-- Purpose: Unify naming — type_array and genres were redundant names for the same concept.
--          genres is the canonical name used across the application layer (Zod, DAL, components).
-- Affected:
--   - public.evenements  (column rename + constraint update)
--   - idx_evenements_type_array (index rename)
--   - check_valid_event_types  (constraint updated to reference genres)
-- Note: Historical migrations and seed dumps are NOT modified (they still reference type_array).
--       The live DB column is renamed here; the shadow DB conflict with the seed migration
--       is a pre-existing incompatibility that does not affect production.

-- =========================================================
-- 1. Rename column type_array → genres
-- =========================================================
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'evenements'
      and column_name  = 'type_array'
  ) then
    alter table public.evenements rename column type_array to genres;
    raise notice 'Renamed column type_array → genres on public.evenements';
  else
    raise notice 'Column type_array does not exist on public.evenements — skipping rename (already renamed?)';
  end if;
end;
$$ language plpgsql;

-- =========================================================
-- 2. Rename GIN index: idx_evenements_type_array → idx_evenements_genres
-- =========================================================
do $$
begin
  if exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and tablename  = 'evenements'
      and indexname  = 'idx_evenements_type_array'
  ) then
    alter index public.idx_evenements_type_array rename to idx_evenements_genres;
    raise notice 'Renamed index idx_evenements_type_array → idx_evenements_genres';
  elsif not exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and tablename  = 'evenements'
      and indexname  = 'idx_evenements_genres'
  ) then
    -- Index does not exist under either name — create it
    create index idx_evenements_genres on public.evenements using gin (genres);
    raise notice 'Created index idx_evenements_genres (was missing)';
  else
    raise notice 'Index idx_evenements_genres already exists — skipping';
  end if;
end;
$$ language plpgsql;

-- =========================================================
-- 3. Update check_valid_event_types constraint to reference genres
--    (drop old definition that used type_array, recreate with genres)
-- =========================================================
alter table public.evenements
  drop constraint if exists check_valid_event_types;

alter table public.evenements
  add constraint check_valid_event_types
  check (
    genres is null
    or genres <@ array[
      'spectacle', 'atelier', 'photographie'
      'rencontre', 'conference'
    ]::text[]
  );

comment on constraint check_valid_event_types on public.evenements
  is 'Types d''événements limités à une liste prédéfinie (colonne genres)';

-- =========================================================
-- 4. Update column comment
-- =========================================================
comment on column public.evenements.genres
  is 'Tableau des types d''événements : theatre, photographie, atelier, rencontre, etc.';
