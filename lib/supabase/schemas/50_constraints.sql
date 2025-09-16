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

-- ===== CONTRAINTES POUR EVENEMENTS - NOUVEAUX CHAMPS =====

-- Contraintes de validation pour ticket_url (format URL)
alter table public.evenements 
add constraint if not exists check_ticket_url_format 
check (ticket_url is null or ticket_url ~* '^https?://.*$');

-- Contraintes de validation pour image_url (format URL)
alter table public.evenements 
add constraint if not exists check_image_url_format 
check (image_url is null or image_url ~* '^https?://.*$');

-- Contrainte pour s'assurer que start_time <= end_time quand les deux sont définis
alter table public.evenements 
add constraint if not exists check_start_end_time_order 
check (start_time is null or end_time is null or start_time <= end_time);

-- Contrainte pour valider les types d'événements
alter table public.evenements 
add constraint if not exists check_valid_event_types 
check (
  type_array is null or 
  array_length(type_array, 1) is null or
  (
    array_length(type_array, 1) > 0 and
    not exists (
      select 1 from unnest(type_array) as t(type)
      where t.type not in (
        'spectacle', 'première', 'premiere', 'atelier', 'workshop',
        'rencontre', 'conference', 'masterclass', 'répétition', 'repetition',
        'audition', 'casting', 'formation', 'residency', 'résidence'
      )
    )
  )
);

comment on constraint check_ticket_url_format on public.evenements is 'URL de billetterie doit être au format http/https';
comment on constraint check_image_url_format on public.evenements is 'URL d''image doit être au format http/https';
comment on constraint check_start_end_time_order on public.evenements is 'L''heure de début doit être antérieure à l''heure de fin';
comment on constraint check_valid_event_types on public.evenements is 'Types d''événements limités à une liste prédéfinie';

-- ===== CONTRAINTES POUR MEMBRES EQUIPE =====

-- Contrainte de validation pour membres_equipe.image_url (format URL http/https)
-- Mise à jour: renforcement pattern pour extensions d'images courantes (jpg|jpeg|png|webp|gif|avif|svg)
alter table public.membres_equipe 
drop constraint if exists membres_equipe_image_url_format;
alter table public.membres_equipe 
add constraint membres_equipe_image_url_format 
check (
  image_url is null or 
  image_url ~* '^https?://[A-Za-z0-9._~:/?#%\-@!$&''()*+,;=]+\.(jpg|jpeg|png|webp|gif|avif|svg)(\?.*)?(#.*)?$'
);

comment on constraint membres_equipe_image_url_format on public.membres_equipe is 'URL d''image externe doit être au format http/https';

-- ===== CONTRAINTES POUR PARTNERS =====

-- Contrainte format URL simple pour logo_url (externe) avec extensions images fréquentes facultatives
alter table public.partners 
drop constraint if exists partners_logo_url_format;
alter table public.partners 
add constraint partners_logo_url_format
check (
  logo_url is null or 
  logo_url ~* '^https?://[A-Za-z0-9._~:/?#%\-@!$&''()*+,;=]+'
);

comment on constraint partners_logo_url_format on public.partners is 'URL externe du logo doit être http/https';

-- ===== CONTRAINTES POUR COMMUNIQUES DE PRESSE =====

-- Fonction pour vérifier qu'un communiqué a un PDF principal
create or replace function public.check_communique_has_pdf()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  pdf_count integer;
begin
  -- Compter les PDFs principaux (ordre = -1) pour ce communiqué
  select count(*)
  into pdf_count
  from public.communiques_medias cm
  where cm.communique_id = coalesce(NEW.communique_id, OLD.communique_id)
    and cm.ordre = -1;

  -- Si c'est une suppression et qu'il ne reste aucun PDF, empêcher la suppression
  if TG_OP = 'DELETE' and pdf_count <= 1 then
    raise exception 'Impossible de supprimer le dernier PDF principal du communiqué. Un communiqué doit toujours avoir un PDF principal (ordre = -1).';
  end if;

  -- Pour les insertions/mises à jour, vérifier qu'il y a exactement un PDF principal
  if TG_OP in ('INSERT', 'UPDATE') then
    -- Permettre l'insertion du premier PDF principal
    if NEW.ordre = -1 and pdf_count = 0 then
      return NEW;
    end if;
    
    -- Empêcher les doublons de PDF principal
    if NEW.ordre = -1 and pdf_count >= 1 then
      raise exception 'Un communiqué ne peut avoir qu''un seul PDF principal (ordre = -1). PDF principal déjà existant.';
    end if;
  end if;

  if TG_OP = 'DELETE' then
    return OLD;
  else
    return NEW;
  end if;
end;
$$;

-- Trigger pour valider l'obligation du PDF principal
drop trigger if exists trg_check_communique_pdf on public.communiques_medias;
create trigger trg_check_communique_pdf
  before insert or update or delete on public.communiques_medias
  for each row
  when (NEW.ordre = -1 or OLD.ordre = -1 or (NEW is null and OLD.ordre = -1))
  execute function public.check_communique_has_pdf();

-- Contrainte CHECK pour s'assurer que l'ordre -1 est réservé aux PDFs
alter table public.communiques_medias 
add constraint if not exists check_pdf_order_constraint
check (
  (ordre = -1) or (ordre >= 0)
);

comment on constraint check_pdf_order_constraint on public.communiques_medias is 'Ordre -1 réservé au PDF principal, 0+ pour autres médias';

-- Fonction pour vérifier qu'un communiqué peut être créé (appelée par l'application)
create or replace function public.validate_communique_creation(p_communique_id bigint)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  pdf_count integer;
begin
  -- Vérifier qu'il y a exactement un PDF principal
  select count(*)
  into pdf_count
  from public.communiques_medias cm
  where cm.communique_id = p_communique_id
    and cm.ordre = -1;
    
  return pdf_count = 1;
end;
$$;

comment on function public.validate_communique_creation(bigint) is 'Valide qu''un communiqué a exactement un PDF principal avant publication';
