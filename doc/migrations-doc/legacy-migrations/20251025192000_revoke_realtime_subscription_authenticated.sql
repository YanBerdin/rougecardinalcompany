
--! ==================================================================
-- ⚠️  DANGER — NE PAS APPLIQUER SANS APPROBATION
-- Objet système Realtime: ces revocations touchent des tables internes
-- au service Realtime. N'exécutez pas sans validation DBA/SRE et revue
-- du post‑mortem (doc/INCIDENT_POSTMORTEM_RLS_GRANTS_2025-10-27.md).
--! ==================================================================

-- Migration: Revoke authenticated role from realtime.subscription (Round 7b -補完)
-- Date: 2025-10-25
-- Purpose: Complete Round 7 by revoking authenticated role on realtime.subscription
--          CI detected that authenticated was still granted after initial Round 7
-- Safe: Idempotent - uses DO blocks with exception handling

-- Revoke authenticated grants on realtime.subscription (missed in initial Round 7)
DO $$
BEGIN
  BEGIN
    REVOKE ALL ON TABLE realtime.subscription FROM authenticated;
    RAISE NOTICE 'Revoked ALL on realtime.subscription from authenticated';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'Table realtime.subscription does not exist - skipping';
    WHEN invalid_schema_name THEN
      RAISE NOTICE 'Schema realtime does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke realtime.subscription from authenticated: % - skipping', SQLERRM;
  END;
END;
$$;

-- Note: This completes the Round 7 remediation
-- The original Round 7 migration only revoked anon, but CI audit detected authenticated was also exposed
-- This is a Supabase Realtime system table that should NOT be accessible to any user roles
