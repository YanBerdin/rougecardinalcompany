--! ==================================================================
-- ⚠️  DANGER — NE PAS APPLIQUER SANS APPROBATION
-- Ce script révoque des privilèges sur des objets applicatifs (communiques_*).
-- Il a été exécuté dans le cadre d'une campagne ayant provoqué des erreurs
-- de permission en production. Avant toute futurs exécution, coordonner
-- avec l'équipe DBA/SRE et préparer un plan de restauration.
-- Voir doc/INCIDENT_POSTMORTEM_RLS_GRANTS_2025-10-27.md
--! ==================================================================


-- 20251025173000_revoke_communiques_privileges.sql
-- Revoke privileges granted to 'authenticated' on communiques_* objects flagged by audit
-- Idempotent: REVOKE of missing privilege is a no-op.
REVOKE ALL PRIVILEGES ON TABLE public.communiques_categories FROM authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.communiques_medias FROM authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.communiques_presse FROM authenticated;
-- PostgreSQL treats views as tables for GRANT/REVOKE; use ON TABLE for views
REVOKE ALL PRIVILEGES ON TABLE public.communiques_presse_dashboard FROM authenticated;

-- Provide notices for auditability when run in SQL Editor
DO $$
BEGIN
  RAISE NOTICE 'Revoked authenticated privileges on communiques_* objects (if present)';
END$$;
