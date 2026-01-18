-- Système de versioning pour le contenu éditorial

drop table if exists public.content_versions cascade;
create table public.content_versions (
  id bigint generated always as identity primary key,
  entity_type text not null, -- 'spectacle', 'article_presse', etc.
  entity_id bigint not null,
  version_number integer not null,
  content_snapshot jsonb not null,
  change_summary text,
  change_type text not null, -- 'create', 'update', 'publish', 'unpublish', 'restore'
  created_at timestamptz default now() not null,
  created_by uuid references auth.users(id) on delete set null,
  constraint content_versions_entity_version_unique unique (entity_type, entity_id, version_number)
);

comment on table public.content_versions is 'Historique des versions pour tous les contenus éditoriaux';
comment on column public.content_versions.entity_type is 'Type d''entité : spectacle, article_presse, communique_presse, membre_equipe, etc.';
comment on column public.content_versions.content_snapshot is 'Snapshot JSON complet des données au moment de la version';
comment on column public.content_versions.change_summary is 'Résumé des modifications apportées';
comment on column public.content_versions.change_type is 'Type de modification : create, update, publish, unpublish, restore';

-- Index pour performance
create index idx_content_versions_entity on public.content_versions(entity_type, entity_id);
create index idx_content_versions_created_at on public.content_versions(created_at desc);
create index idx_content_versions_created_by on public.content_versions(created_by);
create index idx_content_versions_type on public.content_versions(change_type);

-- Fonction générique pour créer une version
create or replace function public.create_content_version(
  p_entity_type text,
  p_entity_id bigint,
  p_content_snapshot jsonb,
  p_change_summary text default null,
  p_change_type text default 'update'
)
returns bigint
language plpgsql
security invoker
set search_path = ''
as $$
declare
  next_version integer;
  extracted_title text;
  version_id bigint;
begin
  -- Calculer le prochain numéro de version
  select coalesce(max(version_number), 0) + 1
  into next_version
  from public.content_versions
  where entity_type = p_entity_type and entity_id = p_entity_id;
  
  -- Extraire un title du snapshot si possible pour le résumé auto
  extracted_title := p_content_snapshot->>'title';
  if extracted_title is null then
    extracted_title := p_content_snapshot->>'name';
  end if;
  
  -- Générer un résumé automatique si non fourni
  if p_change_summary is null then
    p_change_summary := case
      when p_change_type = 'create' then 'Création initiale'
      when p_change_type = 'update' then 'Mise à jour'
      when p_change_type = 'publish' then 'Publication'
      when p_change_type = 'unpublish' then 'Dépublication'
      when p_change_type = 'restore' then 'Restauration depuis version antérieure'
      else 'Modification'
    end;
    
    if extracted_title is not null then
      p_change_summary := p_change_summary || ' - ' || extracted_title;
    end if;
  end if;
  
  -- Insérer la nouvelle version
  insert into public.content_versions (
    entity_type,
    entity_id,
    version_number,
    content_snapshot,
    change_summary,
    change_type,
    created_by
  ) values (
    p_entity_type,
    p_entity_id,
    next_version,
    p_content_snapshot,
    p_change_summary,
    p_change_type,
    (select auth.uid())
  ) returning id into version_id;
  
  return version_id;
end;
$$;

-- Trigger function pour capturer automatiquement les versions des spectacles
create or replace function public.spectacles_versioning_trigger()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  change_summary_text text;
  change_type_value text;
begin
  -- Déterminer le type de changement
  if tg_op = 'INSERT' then
    change_type_value := 'create';
    change_summary_text := 'Création du spectacle: ' || NEW.title;
  else
    -- Utiliser le champ 'public' (boolean) au lieu de 'published_at'
    if OLD.public = false and NEW.public = true then
      change_type_value := 'publish';
      change_summary_text := 'Publication du spectacle: ' || NEW.title;
    elsif OLD.public = true and NEW.public = false then
      change_type_value := 'unpublish';
      change_summary_text := 'Dépublication du spectacle: ' || NEW.title;
    else
      change_type_value := 'update';
      change_summary_text := 'Mise à jour du spectacle: ' || NEW.title;
    end if;
  end if;
  
  -- Créer la version
  perform public.create_content_version(
    'spectacle',
    NEW.id,
    to_jsonb(NEW),
    change_summary_text,
    change_type_value
  );
  
  return NEW;
end;
$$;

-- Trigger function pour les articles de presse
create or replace function public.articles_versioning_trigger()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  change_summary_text text;
  change_type_value text;
begin
  if tg_op = 'INSERT' then
    change_type_value := 'create';
    change_summary_text := 'Création de l''article: ' || NEW.title;
  else
    if OLD.published_at is null and NEW.published_at is not null then
      change_type_value := 'publish';
      change_summary_text := 'Publication de l''article: ' || NEW.title;
    elsif OLD.published_at is not null and NEW.published_at is null then
      change_type_value := 'unpublish';
      change_summary_text := 'Dépublication de l''article: ' || NEW.title;
    else
      change_type_value := 'update';
      change_summary_text := 'Mise à jour de l''article: ' || NEW.title;
    end if;
  end if;
  
  -- Créer la version
  perform public.create_content_version(
    'article_presse',
    NEW.id,
    to_jsonb(NEW),
    change_summary_text,
    change_type_value
  );
  
  return NEW;
end;
$$;

-- Trigger function pour les communiqués de presse
create or replace function public.communiques_versioning_trigger()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  change_summary_text text;
  change_type_value text;
begin
  if tg_op = 'INSERT' then
    change_type_value := 'create';
    change_summary_text := 'Création du communiqué: ' || NEW.title;
  else
    if OLD.public = false and NEW.public = true then
      change_type_value := 'publish';
      change_summary_text := 'Publication du communiqué: ' || NEW.title;
    elsif OLD.public = true and NEW.public = false then
      change_type_value := 'unpublish';
      change_summary_text := 'Dépublication du communiqué: ' || NEW.title;
    else
      change_type_value := 'update';
      change_summary_text := 'Mise à jour du communiqué: ' || NEW.title;
    end if;
  end if;
  
  -- Créer la version
  perform public.create_content_version(
    'communique_presse',
    NEW.id,
    to_jsonb(NEW),
    change_summary_text,
    change_type_value
  );
  
  return NEW;
end;
$$;

-- Trigger function pour les membres de l'équipe
create or replace function public.membres_equipe_versioning_trigger()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  change_summary_text text;
  change_type_value text;
begin
  if tg_op = 'INSERT' then
    change_type_value := 'create';
  change_summary_text := 'Création membre équipe: ' || coalesce(NEW.name, '');
  else
    change_type_value := 'update';
  change_summary_text := 'Mise à jour membre équipe: ' || coalesce(NEW.name, '');
  end if;

  perform public.create_content_version(
    'membre_equipe',
    NEW.id,
    to_jsonb(NEW),
    change_summary_text,
    change_type_value
  );

  return NEW;
end;
$$;

-- Trigger function pour les événements
create or replace function public.evenements_versioning_trigger()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  change_summary_text text;
  change_type_value text;
  spectacle_title text;
begin
  -- Récupérer le titre du spectacle pour le résumé
  select title into spectacle_title 
  from public.spectacles 
  where id = NEW.spectacle_id;
  
  if tg_op = 'INSERT' then
    change_type_value := 'create';
    change_summary_text := 'Création d''événement pour: ' || coalesce(spectacle_title, 'Spectacle #' || NEW.spectacle_id);
  else
    if OLD.status != NEW.status then
      change_type_value := 'update';
      change_summary_text := 'Changement de statut (' || OLD.status || ' → ' || NEW.status || ') pour: ' || coalesce(spectacle_title, 'Spectacle #' || NEW.spectacle_id);
    else
      change_type_value := 'update';
      change_summary_text := 'Mise à jour d''événement pour: ' || coalesce(spectacle_title, 'Spectacle #' || NEW.spectacle_id);
    end if;
  end if;
  
  -- Créer la version
  perform public.create_content_version(
    'evenement',
    NEW.id,
    to_jsonb(NEW),
    change_summary_text,
    change_type_value
  );
  
  return NEW;
end;
$$;

-- Appliquer les triggers de versioning
drop trigger if exists trg_spectacles_versioning on public.spectacles;
create trigger trg_spectacles_versioning
  after insert or update on public.spectacles
  for each row execute function public.spectacles_versioning_trigger();

drop trigger if exists trg_articles_versioning on public.articles_presse;
create trigger trg_articles_versioning
  after insert or update on public.articles_presse
  for each row execute function public.articles_versioning_trigger();

drop trigger if exists trg_communiques_versioning on public.communiques_presse;
create trigger trg_communiques_versioning
  after insert or update on public.communiques_presse
  for each row execute function public.communiques_versioning_trigger();

drop trigger if exists trg_membres_equipe_versioning on public.membres_equipe;
create trigger trg_membres_equipe_versioning
  after insert or update on public.membres_equipe
  for each row execute function public.membres_equipe_versioning_trigger();

drop trigger if exists trg_evenements_versioning on public.evenements;
create trigger trg_evenements_versioning
  after insert or update on public.evenements
  for each row execute function public.evenements_versioning_trigger();

-- Trigger function pour les partenaires
create or replace function public.partners_versioning_trigger()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  change_summary_text text;
  change_type_value text;
begin
  if tg_op = 'INSERT' then
    change_type_value := 'create';
    change_summary_text := 'Création partenaire: ' || coalesce(NEW.name, '');
  else
    change_type_value := 'update';
    change_summary_text := 'Mise à jour partenaire: ' || coalesce(NEW.name, '');
  end if;

  perform public.create_content_version(
    'partner',
    NEW.id,
    to_jsonb(NEW),
    change_summary_text,
    change_type_value
  );

  return NEW;
end;
$$;

drop trigger if exists trg_partners_versioning on public.partners;
create trigger trg_partners_versioning
  after insert or update on public.partners
  for each row execute function public.partners_versioning_trigger();

-- Trigger function pour les valeurs de la compagnie
create or replace function public.compagnie_values_versioning_trigger()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  change_summary_text text;
  change_type_value text;
begin
  if tg_op = 'INSERT' then
    change_type_value := 'create';
    change_summary_text := 'Création valeur compagnie: ' || coalesce(NEW.title, '');
  else
    change_type_value := 'update';
    change_summary_text := 'Mise à jour valeur compagnie: ' || coalesce(NEW.title, '');
  end if;

  perform public.create_content_version(
    'compagnie_value',
    NEW.id,
    to_jsonb(NEW),
    change_summary_text,
    change_type_value
  );

  return NEW;
end;
$$;

drop trigger if exists trg_compagnie_values_versioning on public.compagnie_values;
create trigger trg_compagnie_values_versioning
  after insert or update on public.compagnie_values
  for each row execute function public.compagnie_values_versioning_trigger();

-- Trigger function pour les statistiques de la compagnie
create or replace function public.compagnie_stats_versioning_trigger()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  change_summary_text text;
  change_type_value text;
begin
  if tg_op = 'INSERT' then
    change_type_value := 'create';
    change_summary_text := 'Création statistique compagnie: ' || coalesce(NEW.label, '');
  else
    change_type_value := 'update';
    change_summary_text := 'Mise à jour statistique compagnie: ' || coalesce(NEW.label, '');
  end if;

  perform public.create_content_version(
    'compagnie_stat',
    NEW.id,
    to_jsonb(NEW),
    change_summary_text,
    change_type_value
  );

  return NEW;
end;
$$;

drop trigger if exists trg_compagnie_stats_versioning on public.compagnie_stats;
create trigger trg_compagnie_stats_versioning
  after insert or update on public.compagnie_stats
  for each row execute function public.compagnie_stats_versioning_trigger();

-- Trigger function pour les sections de présentation compagnie
create or replace function public.compagnie_presentation_sections_versioning_trigger()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  change_summary_text text;
  change_type_value text;
begin
  if tg_op = 'INSERT' then
    change_type_value := 'create';
    change_summary_text := 'Création section présentation: ' || coalesce(NEW.slug, '');
  else
    change_type_value := 'update';
    change_summary_text := 'Mise à jour section présentation: ' || coalesce(NEW.slug, '');
  end if;

  perform public.create_content_version(
    'compagnie_presentation_section',
    NEW.id,
    to_jsonb(NEW),
    change_summary_text,
    change_type_value
  );

  return NEW;
end;
$$;

drop trigger if exists trg_compagnie_presentation_sections_versioning on public.compagnie_presentation_sections;
create trigger trg_compagnie_presentation_sections_versioning
  after insert or update on public.compagnie_presentation_sections
  for each row execute function public.compagnie_presentation_sections_versioning_trigger();

-- Vue pour consulter facilement l'historique d'une entité
-- SECURITY: Explicitly set SECURITY INVOKER to run with querying user's privileges
create or replace view public.content_versions_detailed
with (security_invoker = true)
as
select 
  cv.id,
  cv.entity_type,
  cv.entity_id,
  cv.version_number,
  cv.change_type,
  cv.change_summary,
  cv.created_at,
  p.display_name as created_by_name,
  cv.created_by as created_by_id,
  char_length(cv.content_snapshot::text) as snapshot_size
from public.content_versions cv
left join public.profiles as p on cv.created_by = p.user_id
order by cv.entity_type, cv.entity_id, cv.version_number desc;

comment on view public.content_versions_detailed is 'Vue détaillée de l''historique des versions avec informations sur les auteurs. SECURITY INVOKER: Runs with querying user privileges, protected by RLS on base tables.';

-- alter view public.content_versions_detailed owner to admin_views_owner; -- Removed from seed globals to avoid permission error
revoke all on public.content_versions_detailed from anon, authenticated;
grant select on public.content_versions_detailed to service_role;

-- Fonction pour restaurer une version antérieure
create or replace function public.restore_content_version(
  p_version_id bigint,
  p_change_summary text default 'Restauration d''une version antérieure'
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  version_record record;
  restore_success boolean := false;
begin
  -- Récupérer les informations de la version à restaurer
  select 
    entity_type,
    entity_id,
    content_snapshot
  into version_record
  from public.content_versions
  where id = p_version_id;
  
  -- Vérifier que la version existe
  if version_record is null then
    return false;
  end if;
  
  -- Restaurer selon le type d'entité
  if version_record.entity_type = 'spectacle' then
    update public.spectacles
    set 
      title = version_record.content_snapshot->>'title',
      description = version_record.content_snapshot->>'description',
      public = (version_record.content_snapshot->>'public')::boolean,
      image_url = version_record.content_snapshot->>'image_url',
      updated_at = now()
      -- Autres champs à restaurer
    where id = version_record.entity_id;
    
    restore_success := found;
    
  elsif version_record.entity_type = 'article_presse' then
    update public.articles_presse
    set 
      title = version_record.content_snapshot->>'title',
      author = version_record.content_snapshot->>'author',
      type = version_record.content_snapshot->>'type',
      slug = version_record.content_snapshot->>'slug',
      chapo = version_record.content_snapshot->>'chapo',
      excerpt = version_record.content_snapshot->>'excerpt',
      source_publication = version_record.content_snapshot->>'source_publication',
      source_url = version_record.content_snapshot->>'source_url',
      published_at = (version_record.content_snapshot->>'published_at')::timestamptz,
      updated_at = now()
      -- Autres champs à restaurer
    where id = version_record.entity_id;
    
    restore_success := found;
    
  elsif version_record.entity_type = 'communique_presse' then
    update public.communiques_presse
    set 
      title = version_record.content_snapshot->>'title',
      description = version_record.content_snapshot->>'description',
      date_publication = (version_record.content_snapshot->>'date_publication')::date,
      public = (version_record.content_snapshot->>'public')::boolean,
      ordre_affichage = (version_record.content_snapshot->>'ordre_affichage')::integer,
      file_size_bytes = (version_record.content_snapshot->>'file_size_bytes')::bigint,
      image_url = version_record.content_snapshot->>'image_url',
      updated_at = now()
      -- Note: Relations many-to-many (medias, categories, tags) non restaurées pour éviter incohérences
    where id = version_record.entity_id;
    
    restore_success := found;
    
  elsif version_record.entity_type = 'evenement' then
    update public.evenements
    set 
      spectacle_id = (version_record.content_snapshot->>'spectacle_id')::bigint,
      lieu_id = (version_record.content_snapshot->>'lieu_id')::bigint,
      date_debut = (version_record.content_snapshot->>'date_debut')::timestamptz,
      date_fin = (version_record.content_snapshot->>'date_fin')::timestamptz,
      capacity = (version_record.content_snapshot->>'capacity')::integer,
      price_cents = (version_record.content_snapshot->>'price_cents')::integer,
      status = version_record.content_snapshot->>'status',
      ticket_url = version_record.content_snapshot->>'ticket_url',
      image_url = version_record.content_snapshot->>'image_url',
      start_time = (version_record.content_snapshot->>'start_time')::time,
      end_time = (version_record.content_snapshot->>'end_time')::time,
      type_array = array(select jsonb_array_elements_text(version_record.content_snapshot->'type_array')),
      metadata = version_record.content_snapshot->'metadata',
      recurrence_rule = version_record.content_snapshot->>'recurrence_rule',
      recurrence_end_date = (version_record.content_snapshot->>'recurrence_end_date')::timestamptz,
      parent_event_id = (version_record.content_snapshot->>'parent_event_id')::bigint,
      updated_at = now()
    where id = version_record.entity_id;
    
    restore_success := found;
  elsif version_record.entity_type = 'membre_equipe' then
    update public.membres_equipe
    set 
      name = coalesce(version_record.content_snapshot->>'name', version_record.content_snapshot->>'nom'),
      role = version_record.content_snapshot->>'role',
      description = version_record.content_snapshot->>'description',
      image_url = version_record.content_snapshot->>'image_url',
      photo_media_id = (version_record.content_snapshot->>'photo_media_id')::bigint,
      ordre = (version_record.content_snapshot->>'ordre')::smallint,
      active = (version_record.content_snapshot->>'active')::boolean,
      updated_at = now()
    where id = version_record.entity_id;

    restore_success := found;
  elsif version_record.entity_type = 'partner' then
    update public.partners
    set
      name = version_record.content_snapshot->>'name',
      description = version_record.content_snapshot->>'description',
      website_url = version_record.content_snapshot->>'website_url',
      logo_url = version_record.content_snapshot->>'logo_url',
      logo_media_id = (version_record.content_snapshot->>'logo_media_id')::bigint,
      is_active = (version_record.content_snapshot->>'is_active')::boolean,
      display_order = (version_record.content_snapshot->>'display_order')::integer,
      updated_at = now()
    where id = version_record.entity_id;

    restore_success := found;
  elsif version_record.entity_type = 'compagnie_value' then
    update public.compagnie_values
    set
      key = version_record.content_snapshot->>'key',
      title = version_record.content_snapshot->>'title',
      description = version_record.content_snapshot->>'description',
      position = (version_record.content_snapshot->>'position')::smallint,
      active = (version_record.content_snapshot->>'active')::boolean,
      updated_at = now()
    where id = version_record.entity_id;

    restore_success := found;
  elsif version_record.entity_type = 'compagnie_stat' then
    update public.compagnie_stats
    set
      key = version_record.content_snapshot->>'key',
      label = version_record.content_snapshot->>'label',
      value = version_record.content_snapshot->>'value',
      position = (version_record.content_snapshot->>'position')::smallint,
      active = (version_record.content_snapshot->>'active')::boolean,
      updated_at = now()
    where id = version_record.entity_id;

    restore_success := found;
  elsif version_record.entity_type = 'compagnie_presentation_section' then
    update public.compagnie_presentation_sections
    set
      slug = version_record.content_snapshot->>'slug',
      kind = version_record.content_snapshot->>'kind',
      title = version_record.content_snapshot->>'title',
      subtitle = version_record.content_snapshot->>'subtitle',
      content = case when version_record.content_snapshot ? 'content' then array(select jsonb_array_elements_text(version_record.content_snapshot->'content')) else null end,
      quote_text = version_record.content_snapshot->>'quote_text',
      quote_author = version_record.content_snapshot->>'quote_author',
      image_url = version_record.content_snapshot->>'image_url',
      image_media_id = (version_record.content_snapshot->>'image_media_id')::bigint,
      position = (version_record.content_snapshot->>'position')::smallint,
      active = (version_record.content_snapshot->>'active')::boolean,
      updated_at = now()
    where id = version_record.entity_id;

    restore_success := found;
  end if;
  
  -- Si restauration réussie, créer une nouvelle version pour tracer l'opération
  if restore_success then
    perform public.create_content_version(
      version_record.entity_type,
      version_record.entity_id,
      version_record.content_snapshot,
      p_change_summary,
      'restore'
    );
  end if;
  
  return restore_success;
end;
$$;
