-- Migration: Fix evenements_status_check constraint
-- Purpose: Add 'completed' to the allowed status values for evenements.status
-- Affected: public.evenements (constraint evenements_status_check)
-- Root cause: The application code uses 'completed' but the constraint only contained 'complet' (French)
-- Fix: Recreate the constraint with the complete list including 'completed'

do $$
begin
  if exists (
    select 1 from pg_constraint c
    join pg_class t on c.conrelid = t.oid
    join pg_namespace n on t.relnamespace = n.oid
    where n.nspname = 'public'
      and t.relname = 'evenements'
      and c.conname = 'evenements_status_check'
  ) then
    execute 'alter table public.evenements drop constraint evenements_status_check';
  end if;

  -- Recreate with 'completed' added alongside the existing values
  execute 'alter table public.evenements add constraint evenements_status_check check (status in (''planifie'',''confirme'',''complet'',''annule'',''reporte'',''scheduled'',''confirmed'',''sold_out'',''cancelled'',''postponed'',''completed''))';
exception when others then
  raise notice 'Could not update evenements_status_check: %', sqlerrm;
end;
$$ language plpgsql;

comment on constraint evenements_status_check on public.evenements is 'Statuts valides pour un événement (valeurs françaises et anglaises)';
