-- Migration: FINAL enforcement of SECURITY INVOKER on all views
-- Created: 2025-12-31
-- Purpose: Apply SECURITY INVOKER to all views after ALL other migrations
--
-- Context:
--   The migration 20250918000002_apply_declarative_schema_complete.sql is a snapshot
--   that was created BEFORE security_invoker=true was added to declarative schema files.
--   This migration ensures all views use SECURITY INVOKER regardless of migration order.
--
-- Note:
--   This migration MUST be the LAST migration to be applied (highest timestamp).
--   It forces SECURITY INVOKER on all views defined in declarative schema.

BEGIN;

-- ============================================================================
-- ENFORCE SECURITY INVOKER ON ALL VIEWS
-- ============================================================================

-- Convert all views to SECURITY INVOKER using ALTER VIEW
-- This migration runs AFTER all other migrations to ensure all views
-- use SECURITY INVOKER regardless of how they were created

DO $$
DECLARE
  view_record RECORD;
BEGIN
  FOR view_record IN
    SELECT schemaname, viewname
    FROM pg_views
    WHERE schemaname = 'public'
    AND viewname IN (
      'communiques_presse_dashboard',
      'communiques_presse_public',
      'articles_presse_public',
      'spectacles_public',
      'spectacles_admin',
      'membres_equipe_admin',
      'compagnie_presentation_sections_admin',
      'partners_admin',
      'messages_contact_admin',
      'content_versions_detailed',
      'analytics_summary',
      'popular_tags',
      'categories_hierarchy'
    )
  LOOP
    EXECUTE format('ALTER VIEW %I.%I SET (security_invoker = true)', 
                   view_record.schemaname, view_record.viewname);
    RAISE NOTICE '✅ Set SECURITY INVOKER on %.%', view_record.schemaname, view_record.viewname;
  END LOOP;
END $$;

COMMIT;
