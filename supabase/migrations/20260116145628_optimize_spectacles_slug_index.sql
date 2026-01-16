-- Migration: Optimize spectacles slug index
-- Purpose: Convert index to partial index for better performance on published spectacles
-- Affected: public.spectacles (index modification)
-- RLS: No changes
-- Special: Partial index reduces index size and improves query performance for public pages

-- =============================================================================
-- INDEX OPTIMIZATION
-- =============================================================================

-- Drop existing non-partial index
drop index if exists public.idx_spectacles_slug;

-- Create partial index optimized for published spectacles only
-- This reduces index size and improves performance for public queries
create index idx_spectacles_slug_published 
  on public.spectacles(slug) 
  where status = 'published';

comment on index public.idx_spectacles_slug_published is 
'Partial index on slug for published spectacles only - optimizes public page queries';
