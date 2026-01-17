-- Création de la table analytics pour statistiques internes

drop table if exists public.analytics_events cascade;
create table public.analytics_events (
  id bigint generated always as identity primary key,
  created_at timestamptz default now() not null,
  event_type text not null,
  entity_type text,
  entity_id bigint,
  user_id uuid references auth.users(id) on delete set null,
  session_id text,
  pathname text,
  search_query text,
  metadata jsonb default '{}'::jsonb,
  ip_address text,
  user_agent text
);

comment on table public.analytics_events is 'Événements analytiques internes (vues, clics, conversions, recherches)';
comment on column public.analytics_events.event_type is 'Type d''événement : page_view, click, search, download, etc.';
comment on column public.analytics_events.entity_type is 'Type d''entité : spectacle, article, media, etc.';
comment on column public.analytics_events.entity_id is 'ID de l''entité concernée';
comment on column public.analytics_events.session_id is 'Identifiant de session anonyme';
comment on column public.analytics_events.pathname is 'Chemin de la page visitée';
comment on column public.analytics_events.search_query is 'Terme de recherche si applicable';
comment on column public.analytics_events.metadata is 'Données supplémentaires au format JSON';
comment on column public.analytics_events.ip_address is 'Adresse IP (anonymisée)';
comment on column public.analytics_events.user_agent is 'User-Agent du navigateur';

-- Index pour performance des requêtes analytiques
create index idx_analytics_events_type on public.analytics_events(event_type, created_at);
create index idx_analytics_events_entity on public.analytics_events(entity_type, entity_id);
create index idx_analytics_events_user_session on public.analytics_events(user_id, session_id);
create index idx_analytics_events_created_at on public.analytics_events(created_at);

-- Index pour recherche fulltext sur search_query
create index if not exists idx_analytics_search_query_trgm on public.analytics_events using gin (search_query gin_trgm_ops);

-- Function pour enregistrer un événement analytique
create or replace function public.track_analytics_event(
  p_event_type text,
  p_metadata jsonb default '{}'::jsonb
)
returns bigint
language plpgsql
security invoker
set search_path = ''
as $$
declare
  headers_json json;
  event_id bigint;
  v_session_id text;
  v_pathname text;
  v_entity_type text;
  v_entity_id bigint;
  v_search_query text;
  v_ip_address text;
  v_user_agent text;
begin
  -- Récupérer les headers HTTP
  headers_json := current_setting('request.headers', true)::json;
  
  -- Extraire les informations des métadonnées
  v_session_id := p_metadata->>'session_id';
  v_pathname := p_metadata->>'pathname';
  v_entity_type := p_metadata->>'entity_type';
  v_entity_id := (p_metadata->>'entity_id')::bigint;
  v_search_query := p_metadata->>'search_query';
  
  -- Extraire IP et User-Agent des headers
  v_ip_address := headers_json->'x-forwarded-for'->>0;
  v_user_agent := headers_json->>'user-agent';
  
  -- Insérer l'événement
  insert into public.analytics_events (
    event_type,
    entity_type,
    entity_id,
    user_id,
    session_id,
    pathname,
    search_query,
    metadata,
    ip_address,
    user_agent
  ) values (
    p_event_type,
    v_entity_type,
    v_entity_id,
    (select auth.uid()),
    v_session_id,
    v_pathname,
    v_search_query,
    p_metadata,
    v_ip_address,
    v_user_agent
  ) returning id into event_id;
  
  return event_id;
end;
$$;

-- Vue pour statistiques rapides
-- SECURITY: Explicitly set SECURITY INVOKER to run with querying user's privileges
create or replace view public.analytics_summary
with (security_invoker = true)
as
select 
  event_type,
  entity_type,
  date_trunc('day', created_at) as event_date,
  count(*) as total_events,
  count(distinct user_id) as unique_users,
  count(distinct session_id) as unique_sessions
from public.analytics_events 
where created_at >= current_date - interval '30 days'
group by event_type, entity_type, date_trunc('day', created_at)
order by event_date desc, total_events desc;

comment on view public.analytics_summary is 'Vue résumé des statistiques analytiques sur 30 jours. SECURITY INVOKER: Runs with querying user privileges, protected by RLS on base tables.';

alter view public.analytics_summary owner to admin_views_owner;
revoke all on public.analytics_summary from anon, authenticated;
grant select on public.analytics_summary to service_role;

-- Vue pour statistiques sur 90 jours (rétention étendue pour le dashboard analytics)
-- SECURITY: Explicitly set SECURITY INVOKER to run with querying user's privileges
create or replace view public.analytics_summary_90d
with (security_invoker = true)
as
select 
  event_type,
  entity_type,
  date_trunc('day', created_at) as event_date,
  count(*) as total_events,
  count(distinct user_id) as unique_users,
  count(distinct session_id) as unique_sessions
from public.analytics_events 
where created_at >= current_date - interval '90 days'
group by event_type, entity_type, date_trunc('day', created_at)
order by event_date desc, total_events desc;

comment on view public.analytics_summary_90d is 'Vue résumé des statistiques analytiques sur 90 jours pour le dashboard admin. SECURITY INVOKER: Runs with querying user privileges, protected by RLS on base tables.';

alter view public.analytics_summary_90d owner to admin_views_owner;
revoke all on public.analytics_summary_90d from anon, authenticated;
grant select on public.analytics_summary_90d to service_role;
