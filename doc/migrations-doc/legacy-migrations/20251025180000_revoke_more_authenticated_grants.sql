--! ==================================================================
-- ⚠️  DANGER — NE PAS APPLIQUER SANS APPROBATION
-- Ce script révoque des privilèges sur des tables applicatives. Il fait
-- partie d'une série de migrations de révocation qui ont causé des erreurs
-- de permission en production. Avant toute exécution, contacter l'équipe
-- DBA/SRE et ouvrir un ticket d'impact. Voir
-- doc/INCIDENT_POSTMORTEM_RLS_GRANTS_2025-10-27.md
--! ==================================================================

-- 20251025180000_revoke_more_authenticated_grants.sql
-- Revoke authenticated privileges on additional tables flagged by security audit
-- Also attempt to revoke PUBLIC on information_schema.administrable_role_authorizations
-- Idempotent and tolerant: errors are caught and emitted as NOTICE.

REVOKE ALL PRIVILEGES ON TABLE public.compagnie_stats FROM authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.compagnie_values FROM authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.configurations_site FROM authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.contacts_presse FROM authenticated;

-- Attempt to revoke PUBLIC on the information_schema view/table (may be restricted)
DO $$
BEGIN
  BEGIN
    EXECUTE 'REVOKE ALL ON TABLE information_schema.administrable_role_authorizations FROM PUBLIC';
    RAISE NOTICE 'Revoked PUBLIC on information_schema.administrable_role_authorizations';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not revoke on information_schema.administrable_role_authorizations: %', SQLERRM;
  END;
  RAISE NOTICE 'Applied revocations for additional audited tables (idempotent)';
END$$;
