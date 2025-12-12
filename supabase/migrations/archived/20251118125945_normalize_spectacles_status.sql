-- Migration: Normalize spectacles status values
-- Purpose: Replace underscores with spaces in status values
-- Affected Tables: spectacles (status column)
-- Special Considerations: Updates existing data, adds column comment

-- Update existing values to remove underscores
UPDATE public.spectacles
SET status = CASE
  WHEN status = 'en_cours' THEN 'en cours'
  WHEN status = 'termine' THEN 'terminé'
  ELSE status
END
WHERE status IN ('en_cours', 'termine');

-- Add comment for documentation
COMMENT ON COLUMN public.spectacles.status IS
'Status: draft, published, archived, en cours, terminé, projet (no underscores, capitalize first letter)';