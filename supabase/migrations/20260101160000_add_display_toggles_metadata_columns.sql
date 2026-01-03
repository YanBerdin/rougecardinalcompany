-- Migration: Add display toggles metadata columns to configurations_site
-- Author: Rouge Cardinal Company Development Team
-- Date: 2026-01-01 16:00:00
--
-- Purpose:
--   Extend configurations_site table with metadata columns needed for
--   the Display Toggles feature (TASK030):
--     - category: Organize toggles by section (home_display, compagnie_display, presse_display)
--     - description: Human-readable explanation of what each toggle controls
--     - updated_by: Track which admin user last modified each toggle
--
-- Affected Tables:
--   - public.configurations_site (ADD COLUMNS)
--
-- Special Considerations:
--   - This migration runs BEFORE 20260101153838_migrate_display_toggles.sql (data seed)
--   - All new columns are nullable to avoid breaking existing rows
--   - No default values to preserve current configurations_site data integrity
--
-- Breaking Changes: None (backward compatible)

-- Add category column for organizing toggles by feature section
alter table public.configurations_site
add column if not exists category text;

-- Add description column for human-readable toggle documentation
alter table public.configurations_site
add column if not exists description text;

-- Add updated_by column for audit trail (references auth.users)
alter table public.configurations_site
add column if not exists updated_by uuid references auth.users(id) on delete set null;

-- Add index on category for efficient filtering in admin UI
create index if not exists idx_configurations_site_category
on public.configurations_site (category);

-- Update table comment to reflect new structure
comment on table public.configurations_site is 
'Key-value store for site-wide configuration with metadata support for categorization, description, and audit tracking.';

-- Add column comments for documentation
comment on column public.configurations_site.category is 
'Feature section category (e.g., home_display, compagnie_display, presse_display) for organizing toggles in admin UI.';

comment on column public.configurations_site.description is 
'Human-readable description of what this configuration toggle controls.';

comment on column public.configurations_site.updated_by is 
'References auth.users.id of the admin who last modified this configuration (NULL for system defaults).';
