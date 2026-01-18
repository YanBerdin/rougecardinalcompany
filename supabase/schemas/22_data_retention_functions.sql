-- =====================================================
-- Data Retention Functions
-- =====================================================
-- Purpose: Fonctions de purge automatique pour rétention RGPD
-- Created: 2026-01-17
-- Dependencies: 21_data_retention_tables.sql
-- =====================================================

-- =====================================================
-- Function: cleanup_expired_data (GENERIC)
-- Description: Purge générique basée sur data_retention_config
-- Security Model: SECURITY DEFINER
-- =====================================================

/*
 * Security Model: SECURITY DEFINER
 * 
 * Rationale:
 *   1. Doit supprimer des données indépendamment des RLS policies
 *   2. Appelée par scheduled jobs sans contexte utilisateur (Edge Function/pg_cron)
 *   3. Audit trail complet de chaque exécution dans data_retention_audit
 * 
 * Risks Evaluated:
 *   - Authorization: Fonction appelée uniquement par système (service_role)
 *   - Input validation: Validation stricte du nom de table via whitelist (data_retention_config)
 *   - SQL injection: format() avec %I (identifier escaping) + table name whitelist
 *   - Data integrity: Transaction atomique avec rollback automatique sur erreur
 *   - Concurrency: Pas de lock - purges peuvent être concurrentes (DELETE idempotent)
 * 
 * Validation:
 *   - Testé avec données expirées insérées manuellement
 *   - Testé avec table non configurée (exception raised)
 *   - Testé avec table inexistante (exception raised)
 *   - Audit trail validé (toutes exécutions loggées)
 * 
 * Grant Policy:
 *   - EXECUTE granted to service_role only (Edge Function/cron jobs)
 *   - NOT granted to authenticated/anon (pas d'accès direct utilisateurs)
 */

create or replace function public.cleanup_expired_data(p_table_name text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_config record;
  v_deleted_count integer := 0;
  v_start_time timestamptz;
  v_execution_time_ms integer;
  v_sql text;
  v_error_msg text;
  v_status text := 'success';
begin
  v_start_time := clock_timestamp();
  
  -- Récupérer la configuration pour cette table (whitelist validation)
  select * into v_config
  from public.data_retention_config
  where table_name = p_table_name and enabled = true;
  
  if not found then
    raise exception 'No active retention config found for table: %', p_table_name;
  end if;
  
  -- Construction de la requête DELETE dynamique
  -- %I = identifier escaping pour protection SQL injection
  v_sql := format(
    'delete from public.%I where %I < now() - interval ''%s days''',
    v_config.table_name,
    v_config.date_column,
    v_config.retention_days
  );
  
  begin
    -- Exécution de la purge
    execute v_sql;
    get diagnostics v_deleted_count = row_count;
    
    -- Mise à jour de last_run_at
    update public.data_retention_config
    set last_run_at = now()
    where table_name = p_table_name;
    
  exception when others then
    v_status := 'failed';
    v_error_msg := sqlerrm;
    v_deleted_count := 0;
  end;
  
  -- Calcul du temps d'exécution
  v_execution_time_ms := extract(milliseconds from clock_timestamp() - v_start_time)::integer;
  
  -- Insertion dans l'audit trail
  insert into public.data_retention_audit (
    table_name, rows_deleted, execution_time_ms, error_message, status, metadata
  ) values (
    p_table_name, 
    v_deleted_count, 
    v_execution_time_ms, 
    v_error_msg, 
    v_status,
    jsonb_build_object(
      'retention_days', v_config.retention_days,
      'date_column', v_config.date_column,
      'sql', v_sql
    )
  );
  
  return jsonb_build_object(
    'table', p_table_name,
    'deleted', v_deleted_count,
    'status', v_status,
    'execution_time_ms', v_execution_time_ms,
    'error', v_error_msg
  );
end;
$$;

grant execute on function public.cleanup_expired_data(text) to service_role;

comment on function public.cleanup_expired_data(text) is 
  'Purge générique des données expirées basée sur data_retention_config. 
SECURITY DEFINER: bypass RLS pour purge système. 
Usage: SELECT cleanup_expired_data(''table_name'');';

-- =====================================================
-- Function: cleanup_unsubscribed_newsletter
-- Description: Purge spécifique newsletter (uniquement désabonnements)
-- =====================================================

/*
 * Security Model: SECURITY DEFINER
 * 
 * Rationale:
 *   1. Purge uniquement les désabonnements expirés (subscribed = false)
 *   2. Préserve les abonnements actifs indéfiniment (RGPD opt-in)
 *   3. Bypass RLS pour suppression système
 * 
 * Risks Evaluated:
 *   - Authorization: Service role only
 *   - Data integrity: Filtre strict (subscribed = false + date expiration)
 *   - RGPD compliance: Conservation preuve opt-out 90j (liste exclusion)
 */

create or replace function public.cleanup_unsubscribed_newsletter()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_deleted_count integer := 0;
  v_retention_days integer;
  v_start_time timestamptz;
  v_execution_time_ms integer;
begin
  v_start_time := clock_timestamp();
  
  -- Récupérer la rétention configurée
  select retention_days into v_retention_days
  from public.data_retention_config
  where table_name = 'abonnes_newsletter' and enabled = true;
  
  if not found then
    raise exception 'Retention config not found for abonnes_newsletter';
  end if;
  
  -- Supprimer UNIQUEMENT les désabonnements expirés
  delete from public.abonnes_newsletter
  where subscribed = false
    and unsubscribed_at is not null
    and unsubscribed_at < now() - make_interval(days => v_retention_days);
  
  get diagnostics v_deleted_count = row_count;
  
  -- Mise à jour last_run_at
  update public.data_retention_config
  set last_run_at = now()
  where table_name = 'abonnes_newsletter';
  
  v_execution_time_ms := extract(milliseconds from clock_timestamp() - v_start_time)::integer;
  
  -- Audit
  insert into public.data_retention_audit (
    table_name, rows_deleted, execution_time_ms, status, metadata
  ) values (
    'abonnes_newsletter', 
    v_deleted_count, 
    v_execution_time_ms, 
    'success',
    jsonb_build_object(
      'retention_days', v_retention_days,
      'filter', 'subscribed = false AND unsubscribed_at expired'
    )
  );
  
  return jsonb_build_object(
    'table', 'abonnes_newsletter',
    'deleted', v_deleted_count,
    'status', 'success',
    'execution_time_ms', v_execution_time_ms
  );
end;
$$;

grant execute on function public.cleanup_unsubscribed_newsletter() to service_role;

comment on function public.cleanup_unsubscribed_newsletter() is 
  'Purge des désabonnements newsletter expirés (subscribed=false + date dépassée). 
SECURITY DEFINER: bypass RLS. 
Préserve les abonnements actifs (subscribed=true).';

-- =====================================================
-- Function: cleanup_old_contact_messages
-- Description: Purge messages contact anciens
-- =====================================================

/*
 * Security Model: SECURITY DEFINER
 * 
 * Rationale:
 *   1. Purge messages contact après rétention légale (1 an par défaut)
 *   2. Données personnelles sensibles (email, nom, message)
 *   3. Obligation fiscale: conservation 1 an minimum
 * 
 * Risks Evaluated:
 *   - Authorization: Service role only
 *   - RGPD compliance: Suppression après durée légale
 *   - Data integrity: Filtre date + statut traité (optionnel)
 */

create or replace function public.cleanup_old_contact_messages()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_deleted_count integer := 0;
  v_retention_days integer;
  v_start_time timestamptz;
  v_execution_time_ms integer;
begin
  v_start_time := clock_timestamp();
  
  -- Récupérer la rétention configurée
  select retention_days into v_retention_days
  from public.data_retention_config
  where table_name = 'messages_contact' and enabled = true;
  
  if not found then
    raise exception 'Retention config not found for messages_contact';
  end if;
  
  -- Suppression directe des messages anciens
  -- Note: Si besoin d'archivage, ajouter INSERT INTO archive_table avant DELETE
  delete from public.messages_contact
  where created_at < now() - make_interval(days => v_retention_days);
    -- Optionnel: ajouter filtre statut si colonne existe
    -- AND (status = 'processed' OR status = 'closed')
  
  get diagnostics v_deleted_count = row_count;
  
  -- Mise à jour last_run_at
  update public.data_retention_config
  set last_run_at = now()
  where table_name = 'messages_contact';
  
  v_execution_time_ms := extract(milliseconds from clock_timestamp() - v_start_time)::integer;
  
  -- Audit
  insert into public.data_retention_audit (
    table_name, rows_deleted, execution_time_ms, status, metadata
  ) values (
    'messages_contact', 
    v_deleted_count, 
    v_execution_time_ms, 
    'success',
    jsonb_build_object(
      'retention_days', v_retention_days,
      'filter', 'created_at expired (1 year default)',
      'archived', 0
    )
  );
  
  return jsonb_build_object(
    'table', 'messages_contact',
    'deleted', v_deleted_count,
    'archived', 0,
    'status', 'success',
    'execution_time_ms', v_execution_time_ms
  );
end;
$$;

grant execute on function public.cleanup_old_contact_messages() to service_role;

comment on function public.cleanup_old_contact_messages() is 
  'Purge messages contact anciens (>1 an par défaut). 
SECURITY DEFINER: bypass RLS. 
Suppression définitive (pas d''archivage par défaut).';

-- =====================================================
-- Function: check_retention_health
-- Description: Détecte anomalies pour alertes
-- =====================================================

create or replace function public.check_retention_health()
returns table (
  table_name text,
  issue text,
  severity text
)
language plpgsql
security invoker
set search_path = ''
as $$
begin
  return query
  select 
    c.table_name,
    case 
      when c.last_run_at is null then 
        'Jamais exécuté'
      when c.last_run_at < now() - interval '2 days' then 
        format('Dernière exécution: %s (>48h)', c.last_run_at::text)
      when a.status = 'failed' then 
        format('Dernière exécution échouée: %s', a.error_message)
      when a.status = 'partial' then 
        'Exécution partielle - vérifier logs'
      else
        null
    end as issue,
    case 
      when c.last_run_at is null then 'critical'
      when c.last_run_at < now() - interval '7 days' then 'critical'
      when c.last_run_at < now() - interval '2 days' then 'warning'
      when a.status = 'failed' then 'critical'
      when a.status = 'partial' then 'warning'
      else 'ok'
    end as severity
  from public.data_retention_config c
  left join lateral (
    select status, error_message, executed_at
    from public.data_retention_audit audit
    where audit.table_name = c.table_name
    order by executed_at desc
    limit 1
  ) a on true
  where c.enabled = true
    and (
      c.last_run_at is null 
      or c.last_run_at < now() - interval '2 days'
      or a.status in ('failed', 'partial')
    );
end;
$$;

grant execute on function public.check_retention_health() to service_role, authenticated;

comment on function public.check_retention_health() is 
  'Détecte anomalies dans système de rétention (jobs non exécutés, échecs). 
Retourne lignes uniquement si problème détecté. 
Usage: SELECT * FROM check_retention_health();';
