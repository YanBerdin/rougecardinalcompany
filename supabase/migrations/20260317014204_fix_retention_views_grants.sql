-- ============================================================================
-- Migration: Fix data_retention_monitoring & data_retention_stats grants
-- ============================================================================
-- Purpose: Revoke excessive privileges on data retention views.
--          Migration 20260118012000 recreated these views as SECURITY INVOKER
--          but forgot "revoke all from anon, authenticated", leaving all
--          default grants in place. The declarative schema (41_views_retention.sql)
--          already has the correct grants; this migration aligns the DB.
-- Affected views: data_retention_monitoring, data_retention_stats
-- Severity: 🟠 MEDIUM - Security fix (views expose admin data to authenticated)
-- ============================================================================

-- data_retention_monitoring: restrict to service_role only
revoke all on public.data_retention_monitoring from anon, authenticated;
grant select on public.data_retention_monitoring to service_role;

-- data_retention_stats: restrict to service_role only
revoke all on public.data_retention_stats from anon, authenticated;
grant select on public.data_retention_stats to service_role;
