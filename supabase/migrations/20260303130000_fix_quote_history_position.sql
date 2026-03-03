-- Migration: Restore quote-history section to its original seed position
-- Affected: compagnie_presentation_sections
-- Reason: Zod .default(0) combined with .partial() was resetting position
--         to 0 on every content edit. Schema fix applied in compagnie-admin.ts.

update public.compagnie_presentation_sections
set position = 25
where slug = 'quote-history';
