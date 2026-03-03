-- Migration: Fix hero section position
-- Purpose: The hero section (id=1) has position=5 while history (id=2) has
-- position=0, causing hero to appear after history on the public /compagnie page.
-- This migration sets clean, sequential positions with hero first.

-- Normalize all positions to a clean 0/10/20/30/40/50 sequence
update public.compagnie_presentation_sections set position = 0  where id = 1; -- hero   (was 5)
update public.compagnie_presentation_sections set position = 10 where id = 2; -- history (was 0)
update public.compagnie_presentation_sections set position = 20 where id = 3; -- quote   (was 25)
update public.compagnie_presentation_sections set position = 30 where id = 6; -- mission (was 30, unchanged)
update public.compagnie_presentation_sections set position = 40 where id = 4; -- values  (was 40, unchanged)
update public.compagnie_presentation_sections set position = 50 where id = 5; -- team    (was 50, unchanged)
