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
comment on column public.content_versions.entity_type is 'Type d''entité : spectacle, article_presse, membre_equipe, etc.';
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
    if OLD.published_at is null and NEW.published_at is not null then
      change_type_value := 'publish';
      change_summary_text := 'Publication du spectacle: ' || NEW.title;
    elsif OLD.published_at is not null and NEW.published_at is null then
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

-- Appliquer les triggers de versioning
drop trigger if exists trg_spectacles_versioning on public.spectacles;
create trigger trg_spectacles_versioning
  after insert or update on public.spectacles
  for each row execute function public.spectacles_versioning_trigger();

drop trigger if exists trg_articles_versioning on public.articles_presse;
create trigger trg_articles_versioning
  after insert or update on public.articles_presse
  for each row execute function public.articles_versioning_trigger();

-- Vue pour consulter facilement l'historique d'une entité
create or replace view public.content_versions_detailed as
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
left join public.profiles p on cv.created_by = p.user_id
order by cv.entity_type, cv.entity_id, cv.version_number desc;

comment on view public.content_versions_detailed is 'Vue détaillée de l''historique des versions avec informations sur les auteurs';

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
      published_at = (version_record.content_snapshot->>'published_at')::timestamptz,
      public = (version_record.content_snapshot->>'public')::boolean,
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
