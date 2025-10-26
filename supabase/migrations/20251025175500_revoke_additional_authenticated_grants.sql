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
