-- Migration: Fix excessive anon grants on sensitive tables
-- Purpose: Restrict anon role access — currently anon has ALL privileges on 13 sensitive tables,
--          which exposes private data via pg_graphql schema introspection (lint=0026).
-- Affected tables:
--   - abonnes_newsletter: INSERT only (newsletter subscription form)
--   - messages_contact: INSERT only (contact form)
--   - analytics_events: INSERT only (client-side event tracking)
--   - content_versions: NO anon access (versioning history — admin only)
--   - data_retention_audit: NO anon access (internal audit — admin only)
--   - data_retention_config: NO anon access (config — admin only)
--   - logs_audit: NO anon access (security logs — admin only)
--   - media_folders: NO anon access (media library structure — admin only)
--   - media_item_tags: NO anon access (media tags — admin only)
--   - media_tags: NO anon access (media tags — admin only)
--   - pending_invitations: NO anon access (invitations — admin only)
--   - profiles: NO anon access (user profiles — authenticated only)
--   - user_invitations: NO anon access (invitations — admin only)
-- Special considerations:
--   RLS policies remain in place as defense-in-depth.
--   This migration handles the GRANT layer (before RLS).

-- =============================================================================
-- TABLES WITH INSERT-ONLY ACCESS FOR ANON (public-facing forms)
-- =============================================================================

-- abonnes_newsletter: only allow subscribing (INSERT), not reading the list
revoke all on public.abonnes_newsletter from anon;
grant insert on public.abonnes_newsletter to anon;

-- messages_contact: only allow submitting a message (INSERT), not reading messages
revoke all on public.messages_contact from anon;
grant insert on public.messages_contact to anon;

-- analytics_events: only allow recording events (INSERT), not reading analytics data
revoke all on public.analytics_events from anon;
grant insert on public.analytics_events to anon;

-- =============================================================================
-- TABLES WITH NO ANON ACCESS (admin / internal data)
-- =============================================================================

-- content_versions: versioning history — admin only
revoke all on public.content_versions from anon;

-- data_retention_audit: internal audit trail — admin only
revoke all on public.data_retention_audit from anon;

-- data_retention_config: retention configuration — admin only
revoke all on public.data_retention_config from anon;

-- logs_audit: security audit logs — admin only
revoke all on public.logs_audit from anon;

-- media_folders: media library folder structure — admin only
revoke all on public.media_folders from anon;

-- media_item_tags: junction table for media tags — admin only
revoke all on public.media_item_tags from anon;

-- media_tags: tag definitions for media — admin only
revoke all on public.media_tags from anon;

-- pending_invitations: in-flight invitation tokens — admin only
revoke all on public.pending_invitations from anon;

-- profiles: user profile data — authenticated users only
revoke all on public.profiles from anon;

-- user_invitations: invitation records — admin only
revoke all on public.user_invitations from anon;
