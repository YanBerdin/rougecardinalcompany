-- =====================================================
-- Data Retention Tables
-- =====================================================
-- Purpose: Tables de configuration et audit pour système de rétention automatique
-- Created: 2026-01-17
-- Dependencies: 20_audit_logs_retention.sql (logs_audit.expires_at existant)
-- =====================================================

-- =====================================================
-- Table: data_retention_config
-- Description: Configuration centralisée des politiques de rétention
-- =====================================================

drop table if exists public.data_retention_config cascade;

create table public.data_retention_config (
  id bigint generated always as identity primary key,
  table_name text not null unique,
  retention_days integer not null check (retention_days > 0),
  date_column text not null,
  enabled boolean not null default true,
  last_run_at timestamptz,
  description text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint valid_table_name check (table_name ~ '^[a-z_]+$')
);

comment on table public.data_retention_config is 
  'Configuration centralisée des politiques de rétention de données';

comment on column public.data_retention_config.table_name is 
  'Nom de la table concernée (validation: lowercase + underscores uniquement)';

comment on column public.data_retention_config.retention_days is 
  'Nombre de jours de rétention (>0)';

comment on column public.data_retention_config.date_column is 
  'Nom de la colonne utilisée pour calculer l''expiration (ex: created_at, unsubscribed_at, expires_at)';

comment on column public.data_retention_config.enabled is 
  'Active/désactive la purge automatique pour cette table';

comment on column public.data_retention_config.last_run_at is 
  'Date de dernière exécution de la purge (mis à jour automatiquement)';

-- =====================================================
-- Indexes pour performance
-- =====================================================

create index idx_data_retention_config_table 
  on public.data_retention_config(table_name);

create index idx_data_retention_config_enabled 
  on public.data_retention_config(enabled) 
  where enabled = true;

-- =====================================================
-- RLS Policies: Admin-only
-- =====================================================

alter table public.data_retention_config enable row level security;

create policy "Admins can manage retention config"
  on public.data_retention_config
  for all
  to authenticated
  using ( (select public.is_admin()) )
  with check ( (select public.is_admin()) );

-- =====================================================
-- Table: data_retention_audit
-- Description: Historique des opérations de purge
-- =====================================================

drop table if exists public.data_retention_audit cascade;

create table public.data_retention_audit (
  id bigint generated always as identity primary key,
  table_name text not null,
  rows_deleted integer not null default 0,
  execution_time_ms integer,
  error_message text,
  status text not null check (status in ('success', 'partial', 'failed')),
  executed_at timestamptz default now() not null,
  metadata jsonb default '{}'::jsonb
);

comment on table public.data_retention_audit is 
  'Historique des opérations de purge automatique - conservation 1 an pour conformité RGPD';

comment on column public.data_retention_audit.table_name is 
  'Table concernée par la purge';

comment on column public.data_retention_audit.rows_deleted is 
  'Nombre de lignes supprimées lors de cette exécution';

comment on column public.data_retention_audit.execution_time_ms is 
  'Temps d''exécution en millisecondes';

comment on column public.data_retention_audit.error_message is 
  'Message d''erreur si status != success';

comment on column public.data_retention_audit.status is 
  'Statut de l''exécution: success (tout supprimé), partial (partiel), failed (échec total)';

comment on column public.data_retention_audit.metadata is 
  'Métadonnées supplémentaires (JSON): config utilisée, filtres appliqués, etc.';

-- =====================================================
-- Indexes pour monitoring
-- =====================================================

create index idx_retention_audit_table 
  on public.data_retention_audit(table_name, executed_at desc);

create index idx_retention_audit_status 
  on public.data_retention_audit(status, executed_at desc);

create index idx_retention_audit_executed_at 
  on public.data_retention_audit(executed_at desc);

-- =====================================================
-- RLS Policies: Admin read-only
-- =====================================================

alter table public.data_retention_audit enable row level security;

create policy "Admins can view retention audit"
  on public.data_retention_audit
  for select
  to authenticated
  using ( (select public.is_admin()) );

-- =====================================================
-- Trigger: Auto-update updated_at
-- =====================================================

-- Trigger moved to 30_triggers.sql to avoid dependency ordering issue
-- (update_updated_at() function is defined in 20_functions_core.sql)

-- =====================================================
-- Seed Data: Configuration initiale
-- =====================================================

insert into public.data_retention_config (table_name, retention_days, date_column, description) 
values
  (
    'logs_audit', 
    90, 
    'expires_at', 
    'Logs d''audit - rétention RGPD (fonction cleanup_expired_audit_logs() existante)'
  ),
  (
    'abonnes_newsletter', 
    90, 
    'unsubscribed_at', 
    'Désabonnements newsletter - rétention RGPD (preuve opt-out + liste exclusion)'
  ),
  (
    'messages_contact', 
    365, 
    'created_at', 
    'Messages contact - rétention légale 1 an (obligation fiscale + suivi conversations)'
  ),
  (
    'analytics_events', 
    90, 
    'created_at', 
    'Événements analytics - optimisation performance (données anonymisées)'
  )
on conflict (table_name) do nothing;

comment on table public.data_retention_config is 
  'Configuration centralisée des politiques de rétention - seed data: 4 tables (logs_audit, newsletter, contact, analytics)';
