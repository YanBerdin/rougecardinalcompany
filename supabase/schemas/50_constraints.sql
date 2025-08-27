-- Contraintes et validations
-- Ordre: 50 - Après les tables et index

-- Contraintes de validation pour profiles.role
do $$
begin
  if exists (
    select 1 from pg_constraint c
    join pg_class t on c.conrelid = t.oid
    join pg_namespace n on t.relnamespace = n.oid
    where n.nspname = 'public' and t.relname = 'profiles' and c.conname = 'profiles_role_check'
  ) then
    execute 'alter table public.profiles drop constraint profiles_role_check';
  end if;
  
  execute 'alter table public.profiles add constraint profiles_role_check check (role in (''user'',''editor'',''admin''))';
exception when others then
  raise notice 'Could not add profiles_role_check: %', sqlerrm;
end;
$$ language plpgsql;

-- Contraintes pour evenements.status
do $$
begin
  if exists (
    select 1 from pg_constraint c
    join pg_class t on c.conrelid = t.oid
    join pg_namespace n on t.relnamespace = n.oid
    where n.nspname = 'public' and t.relname = 'evenements' and c.conname = 'evenements_status_check'
  ) then
    execute 'alter table public.evenements drop constraint evenements_status_check';
  end if;
  
  execute 'alter table public.evenements alter column status set default ''planifie''';
  execute 'alter table public.evenements add constraint evenements_status_check check (status in (''planifie'',''confirme'',''complet'',''annule'',''reporte'',''scheduled'',''confirmed'',''sold_out'',''cancelled'',''postponed''))';
exception when others then
  raise notice 'Could not add evenements_status_check: %', sqlerrm;
end;
$$ language plpgsql;

-- Contrainte anti-récursion pour événements
alter table public.evenements 
add constraint if not exists check_no_self_parent 
check (parent_event_id != id or parent_event_id is null);
