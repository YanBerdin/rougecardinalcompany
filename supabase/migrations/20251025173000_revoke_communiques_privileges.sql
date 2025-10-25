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
