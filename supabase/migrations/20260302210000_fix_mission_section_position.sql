-- Migration: Fix mission section position after form update bug
-- The form was not preserving position on update, resetting it to 0.
-- Restore mission to position 30 (between quote=20 and values=40).

update public.compagnie_presentation_sections
set position = 30
where slug = 'mission';
