--! ==================================================================
-- ⚠️  DANGER — NE PAS APPLIQUER SANS APPROBATION
-- Ce script révoque des GRANTs larges (anon/authenticated/PUBLIC) sur
-- des tables applicatives. L'exécution a été liée à une panne de
-- production lorsque la campagne de révocations a été appliquée.
-- Avant toute exécution, coordonner avec l'équipe DBA/SRE et fournir
-- un plan de rétablissement. Voir doc/INCIDENT_POSTMORTEM_RLS_GRANTS_2025-10-27.md
--! ==================================================================

-- Migration: Revoke overly-broad grants discovered by CI audit
-- Date: 2025-10-25
-- Purpose: Revoke ALL privileges granted to anon, authenticated and PUBLIC
-- on specific relations flagged by the audit: public.analytics_summary and
-- public.articles_categories

REVOKE ALL ON TABLE public.analytics_summary FROM anon, authenticated, PUBLIC;
REVOKE ALL ON TABLE public.articles_categories FROM anon, authenticated, PUBLIC;

-- NOTE:
-- - This migration intentionally revokes ALL privileges from the listed roles.
-- - If certain roles should retain specific permissions (e.g., SELECT for
--   'authenticated'), add narrow GRANT statements below after review.
-- - Re-running this migration is safe: REVOKE silently succeeds even if no
--   privileges are present.
