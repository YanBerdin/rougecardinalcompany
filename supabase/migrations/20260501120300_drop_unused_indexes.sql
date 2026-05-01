-- Migration: Drop all unused indexes
-- Purpose: Remove 68 indexes that have never been scanned (idx_scan = 0 in pg_stat_user_indexes).
--          These indexes consume storage and slow down INSERT/UPDATE/DELETE operations
--          without providing any query performance benefit (lint=0005).
-- Affected: 22 tables across the public schema
-- Special considerations:
--   All indexes listed here were confirmed unused via:
--     SELECT indexrelname FROM pg_stat_user_indexes
--     WHERE idx_scan = 0 AND schemaname = 'public'
--   Primary keys and unique constraints are excluded.
--   If future queries require any of these indexes, they can be recreated.

-- =============================================================================
-- analytics_events (3 indexes)
-- =============================================================================
drop index if exists public.idx_analytics_events_entity;
drop index if exists public.idx_analytics_events_type;
drop index if exists public.idx_analytics_search_query_trgm;

-- =============================================================================
-- articles_categories (1 index)
-- =============================================================================
drop index if exists public.idx_articles_categories_category_id;

-- =============================================================================
-- articles_presse (4 indexes)
-- =============================================================================
drop index if exists public.idx_articles_presse_og_image_media_id;
drop index if exists public.idx_articles_published_at;
drop index if exists public.idx_articles_published_at_public;
drop index if exists public.idx_articles_title_trgm;

-- =============================================================================
-- articles_tags (1 index)
-- =============================================================================
drop index if exists public.idx_articles_tags_tag_id;

-- =============================================================================
-- categories (4 indexes)
-- =============================================================================
drop index if exists public.idx_categories_created_by;
drop index if exists public.idx_categories_display_order;
drop index if exists public.idx_categories_is_active;
drop index if exists public.idx_categories_parent_id;

-- =============================================================================
-- compagnie_presentation_sections (3 indexes)
-- =============================================================================
drop index if exists public.idx_compagnie_presentation_sections_active_order;
drop index if exists public.idx_compagnie_presentation_sections_image_media_id;
drop index if exists public.idx_compagnie_presentation_sections_kind;

-- =============================================================================
-- configurations_site (3 indexes)
-- =============================================================================
drop index if exists public.idx_configurations_site_category;
drop index if exists public.idx_configurations_site_key_pattern;
drop index if exists public.idx_configurations_site_updated_by;

-- =============================================================================
-- contacts_presse (3 indexes)
-- =============================================================================
drop index if exists public.idx_contacts_presse_actif;
drop index if exists public.idx_contacts_presse_media;
drop index if exists public.idx_contacts_presse_specialites;

-- =============================================================================
-- content_versions (2 indexes)
-- =============================================================================
drop index if exists public.idx_content_versions_created_at;
drop index if exists public.idx_content_versions_type;

-- =============================================================================
-- data_retention_audit (1 index)
-- =============================================================================
drop index if exists public.idx_retention_audit_status;

-- =============================================================================
-- data_retention_config (1 index)
-- =============================================================================
drop index if exists public.idx_data_retention_config_enabled;

-- =============================================================================
-- evenements (6 indexes)
-- =============================================================================
drop index if exists public.idx_evenements_date_time;
drop index if exists public.idx_evenements_genres;
drop index if exists public.idx_evenements_lieu_id;
drop index if exists public.idx_evenements_parent_event_id;
drop index if exists public.idx_evenements_recurrence_end_date;
drop index if exists public.idx_evenements_start_time;

-- =============================================================================
-- home_about_content (2 indexes)
-- =============================================================================
drop index if exists public.idx_home_about_content_active_order;
drop index if exists public.idx_home_about_content_image_media_id;

-- =============================================================================
-- home_hero_slides (3 indexes)
-- =============================================================================
drop index if exists public.idx_home_hero_slides_active_order;
drop index if exists public.idx_home_hero_slides_image_media_id;
drop index if exists public.idx_home_hero_slides_schedule;

-- =============================================================================
-- medias (3 indexes)
-- =============================================================================
drop index if exists public.idx_medias_storage_path_prefix;
drop index if exists public.idx_medias_thumbnail_path;
drop index if exists public.idx_medias_uploaded_by;

-- =============================================================================
-- membres_equipe (1 index)
-- =============================================================================
drop index if exists public.idx_membres_equipe_photo_media_id;

-- =============================================================================
-- messages_contact (5 indexes)
-- =============================================================================
drop index if exists public.idx_messages_contact_consent_true;
drop index if exists public.idx_messages_contact_contact_presse;
drop index if exists public.idx_messages_contact_reason;
drop index if exists public.idx_messages_contact_status;
drop index if exists public.idx_messages_contact_status_actifs;

-- =============================================================================
-- partners (4 indexes)
-- =============================================================================
drop index if exists public.idx_partners_active_order;
drop index if exists public.idx_partners_created_by;
drop index if exists public.idx_partners_is_active;
drop index if exists public.idx_partners_logo_media_id;

-- =============================================================================
-- pending_invitations (1 index)
-- =============================================================================
drop index if exists public.idx_pending_invitations_status;

-- =============================================================================
-- profiles (1 index)
-- =============================================================================
drop index if exists public.idx_profiles_role;

-- =============================================================================
-- seo_redirects (2 indexes)
-- =============================================================================
drop index if exists public.idx_seo_redirects_active;
drop index if exists public.idx_seo_redirects_old_path;

-- =============================================================================
-- sitemap_entries (2 indexes)
-- =============================================================================
drop index if exists public.idx_sitemap_entries_indexed;
drop index if exists public.idx_sitemap_entries_last_modified;

-- =============================================================================
-- spectacles (6 indexes)
-- =============================================================================
drop index if exists public.idx_spectacles_created_by;
drop index if exists public.idx_spectacles_search_vector;
drop index if exists public.idx_spectacles_slug_published;
drop index if exists public.idx_spectacles_status;
drop index if exists public.idx_spectacles_title;
drop index if exists public.idx_spectacles_title_trgm;

-- =============================================================================
-- spectacles_categories (1 index)
-- =============================================================================
drop index if exists public.idx_spectacles_categories_category_id;

-- =============================================================================
-- spectacles_membres_equipe (1 index)
-- =============================================================================
drop index if exists public.idx_spectacles_membres_equipe_membre_id;

-- =============================================================================
-- spectacles_tags (1 index)
-- =============================================================================
drop index if exists public.idx_spectacles_tags_tag_id;

-- =============================================================================
-- tags (3 indexes)
-- =============================================================================
drop index if exists public.idx_tags_created_by;
drop index if exists public.idx_tags_is_featured;
drop index if exists public.idx_tags_usage_count;
