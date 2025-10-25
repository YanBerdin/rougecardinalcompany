-- Migration: Revoke broad grants on articles tables flagged by CI audit
-- Date: 2025-10-25
-- Purpose: Remove privileges granted to PUBLIC/anon/authenticated on
-- public.articles_medias and public.articles_presse discovered by the
-- security audit. Keep this migration idempotent and safe to run.

REVOKE ALL PRIVILEGES ON TABLE public.articles_medias FROM anon, authenticated, PUBLIC;
REVOKE ALL PRIVILEGES ON TABLE public.articles_presse FROM anon, authenticated, PUBLIC;

-- Optional: If you still want authenticated users to SELECT, add an explicit grant (uncomment):
-- GRANT SELECT ON TABLE public.articles_medias TO authenticated;
-- GRANT SELECT ON TABLE public.articles_presse TO authenticated;

-- NOTE: Also ensure the declarative schema in supabase/schemas/ does not
-- reintroduce these grants on next db push. Update schema files if needed.
