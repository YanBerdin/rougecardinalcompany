
--! ==================================================================
-- ⚠️  AVERTISSEMENT — OBJETS RÉSEAUX / RÉALTIME
-- Ce fichier révoque des privilèges sur les objets internes de Realtime.
-- Toute modification doit être coordonnée avec l'équipe plateforme/SRE
-- car elle peut impacter les connexions WebSocket / subscriptions.
-- Voir doc/INCIDENT_POSTMORTEM_RLS_GRANTS_2025-10-27.md
--! ==================================================================
-- Note: These are Supabase Realtime system objects - may have been auto-granted during setup


-- Migration: Revoke grants on Realtime schema objects (round 7 - Supabase Realtime)
-- Date: 2025-10-25
-- Purpose: Remove grants to anon/authenticated on realtime.* system tables
-- Safe: Idempotent - uses DO blocks with exception handling

-- 1. Revoke authenticated grants on realtime.messages
DO $$
BEGIN
  BEGIN
    REVOKE ALL ON TABLE realtime.messages FROM authenticated;
    RAISE NOTICE 'Revoked ALL on realtime.messages from authenticated';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'Table realtime.messages does not exist - skipping';
    WHEN invalid_schema_name THEN
      RAISE NOTICE 'Schema realtime does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke realtime.messages: % - skipping', SQLERRM;
  END;
END;
$$;

-- 2. Revoke authenticated and anon grants on realtime.schema_migrations
DO $$
BEGIN
  BEGIN
    REVOKE ALL ON TABLE realtime.schema_migrations FROM authenticated, anon;
    RAISE NOTICE 'Revoked ALL on realtime.schema_migrations from authenticated, anon';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'Table realtime.schema_migrations does not exist - skipping';
    WHEN invalid_schema_name THEN
      RAISE NOTICE 'Schema realtime does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke realtime.schema_migrations: % - skipping', SQLERRM;
  END;
END;
$$;

-- 3. Revoke anon and authenticated grants on realtime.subscription
DO $$
BEGIN
  BEGIN
    REVOKE ALL ON TABLE realtime.subscription FROM anon, authenticated;
    RAISE NOTICE 'Revoked ALL on realtime.subscription from anon, authenticated';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'Table realtime.subscription does not exist - skipping';
    WHEN invalid_schema_name THEN
      RAISE NOTICE 'Schema realtime does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke realtime.subscription: % - skipping', SQLERRM;
  END;
END;
$$;

-- 4. Final attempt: revoke PUBLIC on information_schema (persistent)
DO $$
BEGIN
  BEGIN
    REVOKE ALL ON TABLE information_schema.administrable_role_authorizations FROM PUBLIC;
    RAISE NOTICE 'Revoked PUBLIC on information_schema.administrable_role_authorizations';
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE WARNING 'Insufficient privilege to revoke information_schema - requires superuser';
    WHEN undefined_table THEN
      RAISE NOTICE 'Object information_schema.administrable_role_authorizations does not exist';
    WHEN OTHERS THEN
      RAISE WARNING 'Could not revoke information_schema: % - may be PostgreSQL system default', SQLERRM;
  END;
END;
$$;

-- Note: Realtime schema objects are Supabase system tables for WebSocket subscriptions
-- These should NOT be accessible to anon/authenticated for security reasons
-- 
-- realtime.messages: Internal message queue for Realtime subscriptions
-- realtime.schema_migrations: Realtime extension migration history
-- realtime.subscription: Active subscription tracking
--
-- Access to Realtime should be controlled via Supabase RLS policies on user tables,
-- not via direct grants on realtime.* system tables.
--
-- information_schema: PostgreSQL system view - may persist despite revocations

-- Verify: After applying, run supabase/scripts/audit_grants.sql to confirm no exposed objects remain.
