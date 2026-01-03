-- Migration: Fix cleanup display toggles - Remove erroneous DELETE statements
-- Author: Rouge Cardinal Company Development Team
-- Date: 2026-01-01 18:00:00
--
-- Purpose:
--   Corriger la migration 20260101170000 qui tentait de supprimer des clés
--   display_toggle_compagnie_* qui n'ont jamais existé.
--
-- Context:
--   - Le plan TASK030 mentionnait des toggles compagnie à supprimer
--   - Le seed 20260101160100 n'a JAMAIS créé ces toggles
--   - La migration cleanup 20260101170000 essayait de les supprimer (sans effet)
--   - Cette migration documente la correction et nettoie la confusion
--
-- Affected Tables:
--   - public.configurations_site (aucune modification réelle)
--
-- Breaking Changes: None
--
-- Verification:
--   Les 9 display toggles suivants doivent exister après cette migration :
--   - display_toggle_home_hero
--   - display_toggle_home_about
--   - display_toggle_home_spectacles
--   - display_toggle_home_a_la_une
--   - display_toggle_home_partners
--   - display_toggle_home_newsletter
--   - display_toggle_agenda_newsletter
--   - display_toggle_contact_newsletter
--   - display_toggle_presse_articles

-- ============================================================================
-- DOCUMENTATION ONLY MIGRATION
-- ============================================================================
-- Cette migration ne contient AUCUNE opération SQL.
-- Elle documente le fait que la migration 20260101170000 contenait des
-- DELETE statements pour des clés qui n'existaient pas :
--   - display_toggle_compagnie_values
--   - display_toggle_compagnie_presentation
--   - display_toggle_compagnie_stats
--
-- Ces clés n'ont jamais été créées par le seed 20260101160100.
-- Le DELETE dans 20260101170000 n'a donc eu AUCUN effet (0 rows affected).
--
-- Recommandation :
--   - Ne PAS modifier la migration 20260101170000 (déjà appliquée)
--   - Mettre à jour le plan TASK030 pour corriger l'erreur
--   - Documenter dans supabase/schemas/README.md

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Vérifier que les 9 toggles corrects existent
do $$
declare
  toggle_count int;
begin
  select count(*) into toggle_count
  from public.configurations_site
  where key like 'display_toggle_%';

  if toggle_count != 9 then
    raise exception 'Expected 9 display toggles, found %', toggle_count;
  end if;

  raise notice 'Verification OK: 9 display toggles exist';
end $$;

-- Vérifier qu'aucune clé compagnie n'existe
do $$
declare
  compagnie_count int;
begin
  select count(*) into compagnie_count
  from public.configurations_site
  where key like 'display_toggle_compagnie_%';

  if compagnie_count > 0 then
    raise exception 'Found unexpected compagnie toggles: %', compagnie_count;
  end if;

  raise notice 'Verification OK: No compagnie toggles exist (as expected)';
end $$;
