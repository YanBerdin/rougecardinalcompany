--! ==================================================================
-- ⚠️  DANGER — NE PAS APPLIQUER SANS APPROBATION
-- Ce script révoque des privilèges sur des tables applicatives. Il a
-- été exécuté dans le cadre d'une campagne de révocations ayant causé
-- des interruptions en production. Ne pas exécuter sans validation
-- DBA/SRE, ticket d'impact et plan de rétablissement. Voir
-- doc/INCIDENT_POSTMORTEM_RLS_GRANTS_2025-10-27.md
--! ==================================================================

-- 20251025175500_revoke_additional_authenticated_grants.sql
-- Revoke authenticated privileges on tables flagged by security audit
-- Idempotent: REVOKE of missing privilege is a no-op.

REVOKE ALL PRIVILEGES ON TABLE public.communiques_presse_public FROM authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.communiques_tags FROM authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.compagnie_presentation_sections FROM authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.compagnie_presentation_sections_admin FROM authenticated;

DO $$
BEGIN
  RAISE NOTICE 'Revoked authenticated privileges on additional tables (if present)';
END$$;
