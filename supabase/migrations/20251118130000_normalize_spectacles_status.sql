-- Migration: Normalize spectacles status values
-- Date: 2025-11-18
-- Purpose: Remove underscores, add proper accents, standardize status values
-- Affected Tables: spectacles (status column)
-- Special Considerations: Updates existing data to match normalized format

-- Update existing status values to normalized format
-- This ensures consistency with the UI constants and helpers
update public.spectacles
set status = case
  -- Map common French legacy variants to canonical English tokens
  when lower(trim(status)) in ('brouillon','projet') then 'draft'

  -- Map play-running / on-stage variants → published
  when lower(trim(status)) in ('en_cours','en cours','en_tournee','en_tournée','a_l_affiche','a l''affiche','actuellement') then 'published'

  -- Map finished/archived variants → archived
  when lower(trim(status)) in ('archive','archivé','archived','terminé','termine','annulé','annule') then 'archived'

  -- Map preparation → draft
  when lower(trim(status)) in ('en_preparation','en préparation','nouvelle_creation') then 'draft'

  else status
end
where status is not null and (
  status like '%_%'
  or lower(trim(status)) in ('termine','annule','actuellement','archive','archivé','en_cours','en_preparation','a_l_affiche')
);

-- Update column comment for documentation (canonical tokens stored)
comment on column public.spectacles.status is 
'Canonical status values stored as english tokens: ''draft'', ''published'', ''archived''. Legacy french values will be migrated to these tokens by this script.';
