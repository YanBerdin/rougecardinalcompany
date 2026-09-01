-- Migration : Anonymisation de l'adresse IP dans track_analytics_event()
--
-- Objectif : Mettre en conformité la collecte analytics avec la délibération CNIL 2020-091
--   permettant une exemption de consentement pour les analytics internes strictement nécessaires,
--   à condition que l'IP soit anonymisée (suppression d'au moins 2 derniers octets IPv4).
--
-- Tables affectées : public.analytics_events (colonne ip_address)
-- Fonctions affectées : public.track_analytics_event()
--
-- Avant : l'IP brute (ex. 192.168.1.23) était stockée directement depuis x-forwarded-for
-- Après : seul le préfixe réseau est conservé (192.168.0.0 pour IPv4, préfixe /64 pour IPv6)

-- Mise à jour du commentaire de colonne pour refléter l'anonymisation réelle
comment on column public.analytics_events.ip_address
  is 'Adresse IP anonymisée — 2 derniers octets IPv4 supprimés (ex. 192.168.0.0), préfixe /64 conservé pour IPv6. Conforme délibération CNIL 2020-091.';

-- Recréation de la fonction avec anonymisation de l'IP
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

  -- Anonymiser l'adresse IP (délibération CNIL 2020-091)
  -- IPv4 : supprimer les 2 derniers octets (ex. 192.168.1.23 → 192.168.0.0)
  -- IPv6 : conserver uniquement le préfixe /64 (8 premiers groupes de 4 hex)
  if v_ip_address is not null then
    if v_ip_address like '%.%.%.%' then
      -- IPv4 : remplacer les 2 derniers octets par 0.0
      v_ip_address := regexp_replace(v_ip_address, '\d+\.\d+$', '0.0');
    elsif v_ip_address like '%:%' then
      -- IPv6 : garder uniquement le préfixe /64 (les 4 premiers groupes)
      v_ip_address := regexp_replace(v_ip_address, '(([0-9a-fA-F]{0,4}:){4}).*', '\1::/64');
    end if;
  end if;

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
