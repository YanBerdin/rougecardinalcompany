-- Migration: Fix history section position after form update bug
-- The edit form was sending position in the update payload, causing it to reset.
-- Root fix: position is now stripped from form submissions (PresentationForm.tsx / ValueForm.tsx).
-- This migration restores history to its seed position 20 (between hero=5 and quote-history=25).

update public.compagnie_presentation_sections
set position = 20
where slug = 'history';
