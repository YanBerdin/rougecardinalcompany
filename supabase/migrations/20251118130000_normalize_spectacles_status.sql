-- Migration: Normalize spectacles status values
-- Date: 2025-11-18
-- Purpose: Remove underscores, add proper accents, standardize status values
-- Affected Tables: spectacles (status column)
-- Special Considerations: Updates existing data to match normalized format

-- Update existing status values to normalized format
-- This ensures consistency with the UI constants and helpers
update public.spectacles
set status = case
  -- Normalize "en cours" variants (remove underscores)
  when status = 'en_cours' then 'en cours'
  when status = 'en_tournee' then 'en cours'
  when status = 'nouvelle_creation' then 'en cours'
  
  -- Normalize "terminé" (add proper accent)
  when status = 'termine' then 'terminé'
  
  -- Normalize "en préparation" (remove underscore, add accent)
  when status = 'en_preparation' then 'en préparation'
  
  -- Normalize "a l'affiche" (remove underscore, add apostrophe)
  when status = 'a_l_affiche' then 'a l''affiche'
  
  -- Normalize "annulé" (add proper accent)
  when status = 'annule' then 'annulé'
  
  -- Keep other values as-is (draft, published, archived, projet)
  else status
end
where status like '%_%' or status in ('termine', 'annule');

-- Update column comment for documentation
comment on column public.spectacles.status is 
'Status values: draft, published, archived, en cours, terminé, projet, a l''affiche, en préparation, annulé (normalized - no underscores, proper French accents and apostrophes)';
