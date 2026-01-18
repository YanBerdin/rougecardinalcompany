-- =====================================================
-- Migration: Seed Data Retention Config
-- =====================================================
-- Purpose: Insert initial retention configuration for TASK053
-- Note: DML (INSERT) is not captured by schema diff, hence separate migration
-- Date: 2026-01-18
-- =====================================================

-- Seed data retention configuration
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
  ),
  (
    'data_retention_audit', 
    365, 
    'executed_at', 
    'Audit des purges - rétention légale 1 an (traçabilité RGPD)'
  )
on conflict (table_name) do nothing;
