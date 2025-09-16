-- Ajout de la gestion de récurrence pour les événements

-- Ajouter les colonnes de récurrence à la table evenements
alter table public.evenements 
add column if not exists recurrence_rule text,
add column if not exists recurrence_end_date timestamptz,
add column if not exists parent_event_id bigint references public.evenements(id) on delete cascade;

-- Ajouter les commentaires
comment on column public.evenements.recurrence_rule is 'Règle de récurrence au format RRULE (RFC 5545)';
comment on column public.evenements.recurrence_end_date is 'Date de fin de la récurrence';
comment on column public.evenements.parent_event_id is 'Référence vers l''événement parent pour les occurrences générées';

-- Index pour les performances sur les requêtes de récurrence
create index if not exists idx_evenements_parent_event_id on public.evenements (parent_event_id);
create index if not exists idx_evenements_recurrence_end_date on public.evenements (recurrence_end_date);

-- Contrainte pour éviter la récursion infinie
alter table public.evenements 
add constraint check_no_self_parent 
check (parent_event_id != id or parent_event_id is null);

-- Fonction helper pour valider les règles RRULE basiques
create or replace function public.validate_rrule(rule text)
returns boolean
language plpgsql
immutable
security invoker
set search_path = ''
as $$
begin
  -- Validation basique du format RRULE
  if rule is null then
    return true;
  end if;

  -- Vérifier que la règle commence par RRULE:
  if position('RRULE:' in upper(rule)) != 1 then
    return false;
  end if;

  -- Vérification basique de la présence de FREQ (obligatoire)
  if position('FREQ=' in upper(rule)) = 0 then
    return false;
  end if;

  -- Validation passée
  return true;
end;
$$;

comment on function public.validate_rrule(text) is 
'Validates basic RRULE format for event recurrence (RFC 5545). Marked IMMUTABLE since validation logic is deterministic - same input always produces same result, enabling use in check constraints.';

-- Contrainte de validation RRULE
alter table public.evenements 
add constraint check_valid_rrule 
check (recurrence_rule is null or public.validate_rrule(recurrence_rule));

-- Row Level Security pour events_recurrence (si la table existe)
-- Note: Cette section assume l'existence d'une table events_recurrence séparée
-- Si cette table n'existe pas, ces politiques peuvent être supprimées
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'events_recurrence') then
    -- Activer RLS sur events_recurrence
    execute 'alter table public.events_recurrence enable row level security';

    -- Tout le monde peut voir les récurrences des événements publics
    execute 'drop policy if exists "Event recurrences are viewable by everyone" on public.events_recurrence';
    execute 'create policy "Event recurrences are viewable by everyone"
    on public.events_recurrence
    for select
    to anon, authenticated
    using ( true )';

    -- Seuls les admins peuvent gérer les récurrences
    execute 'drop policy if exists "Admins can create event recurrences" on public.events_recurrence';
    execute 'create policy "Admins can create event recurrences"
    on public.events_recurrence
    for insert
    to authenticated
    with check ( (select public.is_admin()) )';

    execute 'drop policy if exists "Admins can update event recurrences" on public.events_recurrence';
    execute 'create policy "Admins can update event recurrences"
    on public.events_recurrence
    for update
    to authenticated
    using ( (select public.is_admin()) )
    with check ( (select public.is_admin()) )';

    execute 'drop policy if exists "Admins can delete event recurrences" on public.events_recurrence';
    execute 'create policy "Admins can delete event recurrences"
    on public.events_recurrence
    for delete
    to authenticated
    using ( (select public.is_admin()) )';
  end if;
end $$;
