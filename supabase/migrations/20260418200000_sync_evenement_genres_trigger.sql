-- Migration: sync evenements.genres automatically from spectacles.genre
-- Purpose: genres are managed in the spectacle form; events inherit them via triggers
-- Affected tables:
--   public.evenements (trigger on INSERT + UPDATE spectacle_id)
--   public.spectacles (trigger on UPDATE genre → cascade to evenements)
-- Pattern: SECURITY INVOKER for evenements trigger (READ from spectacles)
--          SECURITY DEFINER for spectacles cascade trigger (UPDATE across tables)

-- =============================================================================
-- TRIGGER 1: auto-populate evenements.genres on INSERT / spectacle_id UPDATE
-- =============================================================================

-- Triggered BEFORE insert or spectacle_id change on evenements.
-- Reads spectacles.genre and sets genres = ARRAY[genre] (or '{}' if null).
create or replace function public.sync_evenement_genres_from_spectacle()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  spectacle_genre text;
begin
  select genre
  into spectacle_genre
  from public.spectacles
  where id = new.spectacle_id;

  new.genres := case
    when spectacle_genre is not null then array[spectacle_genre]
    else '{}'::text[]
  end;

  return new;
end;
$$;

drop trigger if exists trg_sync_evenement_genres on public.evenements;

create trigger trg_sync_evenement_genres
before insert or update of spectacle_id
on public.evenements
for each row
execute function public.sync_evenement_genres_from_spectacle();

-- =============================================================================
-- TRIGGER 2: cascade spectacles.genre change to all linked evenements
-- =============================================================================

-- Triggered AFTER update of genre on spectacles.
-- Updates evenements.genres for all events linked to the updated spectacle.
-- Uses SECURITY DEFINER to allow cross-table UPDATE regardless of RLS.

/*
 * Security Model: SECURITY DEFINER
 *
 * Rationale:
 *   1. This trigger updates public.evenements from a trigger on public.spectacles
 *   2. RLS on evenements could block the update if invoked with user permissions
 *   3. SECURITY INVOKER is insufficient for cross-table UPDATE in trigger context
 *   4. Legitimate use: automatic cascade sync when spectacle genre is modified
 *
 * Risks Evaluated:
 *   - Authorization: Only fires on UPDATE of spectacles.genre (admin-only operation)
 *   - Input validation: Uses OLD/NEW system values, no user input
 *   - Privilege escalation: Only updates genres column on matching evenements rows
 *   - Concurrency: No advisory lock needed (scoped to one spectacle_id)
 *   - Data integrity: AFTER trigger ensures spectacle row is committed first
 *
 * Grant Policy:
 *   - No GRANT needed — executes in trigger context only, not callable by users
 */
create or replace function public.sync_evenements_genres_on_spectacle_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.genre is distinct from new.genre then
    update public.evenements
    set genres = case
      when new.genre is not null then array[new.genre]::text[]
      else '{}'::text[]
    end
    where spectacle_id = new.id;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_sync_evenements_on_spectacle_genre_update on public.spectacles;

create trigger trg_sync_evenements_on_spectacle_genre_update
after update of genre
on public.spectacles
for each row
execute function public.sync_evenements_genres_on_spectacle_update();

-- =============================================================================
-- BACKFILL: sync all existing evenements from their linked spectacle
-- =============================================================================

-- Sets genres for all existing events that are missing the sync (genres = '{}').
-- Safe to run multiple times (only updates rows where genres differs from spectacle).
update public.evenements e
set genres = case
  when s.genre is not null then array[s.genre]::text[]
  else '{}'::text[]
end
from public.spectacles s
where e.spectacle_id = s.id
  and e.genres is distinct from (
    case when s.genre is not null then array[s.genre]::text[] else '{}'::text[] end
  );
