--! ==================================================================
-- ⚠️  DANGER — NE PAS APPLIQUER SANS APPROBATION
-- Ce script révoque des privilèges sur des vues/tables applicatives et a
-- fait partie d'une campagne de révocations qui a causé des erreurs
-- 42501 en production. Ne pas exécuter sans revue, justification et plan.
-- Voir doc/INCIDENT_POSTMORTEM_RLS_GRANTS_2025-10-27.md
--! ==================================================================

-- Migration: Revoke authenticated on membres_equipe and messages_contact (tables + admin views)
-- Date: 2025-10-25
-- Purpose: Remove grants to authenticated on team members and contact messages (round 3)
-- Safe: Idempotent - uses DO blocks with exception handling

-- 1. Revoke authenticated grants on public.membres_equipe (table)
DO $$
BEGIN
  BEGIN
    REVOKE ALL ON TABLE public.membres_equipe FROM authenticated;
    RAISE NOTICE 'Revoked ALL on public.membres_equipe from authenticated';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'Table public.membres_equipe does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.membres_equipe: % - skipping', SQLERRM;
  END;
END;
$$;

-- 2. Revoke authenticated grants on public.membres_equipe_admin (view)
DO $$
BEGIN
  BEGIN
    REVOKE ALL ON TABLE public.membres_equipe_admin FROM authenticated;
    RAISE NOTICE 'Revoked ALL on public.membres_equipe_admin from authenticated';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'View public.membres_equipe_admin does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.membres_equipe_admin: % - skipping', SQLERRM;
  END;
END;
$$;

-- 3. Revoke authenticated grants on public.messages_contact (table)
DO $$
BEGIN
  BEGIN
    REVOKE ALL ON TABLE public.messages_contact FROM authenticated;
    RAISE NOTICE 'Revoked ALL on public.messages_contact from authenticated';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'Table public.messages_contact does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.messages_contact: % - skipping', SQLERRM;
  END;
END;
$$;

-- 4. Revoke authenticated grants on public.messages_contact_admin (view)
DO $$
BEGIN
  BEGIN
    REVOKE ALL ON TABLE public.messages_contact_admin FROM authenticated;
    RAISE NOTICE 'Revoked ALL on public.messages_contact_admin from authenticated';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'View public.messages_contact_admin does not exist - skipping';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not revoke public.messages_contact_admin: % - skipping', SQLERRM;
  END;
END;
$$;

-- Note: These tables/views have RLS policies defined in the declarative schema.
-- Access control should be handled entirely through RLS, not table-level grants.
-- 
-- membres_equipe: Public read (active members), admin write
-- membres_equipe_admin: Admin-only view with versioning metadata
-- messages_contact: Public insert (contact form), admin read
-- messages_contact_admin: Admin-only view for contact messages
--
-- No re-grant needed - RLS policies provide the necessary access control.

-- Verify: After applying, run supabase/scripts/audit_grants.sql to confirm no exposed objects remain.
