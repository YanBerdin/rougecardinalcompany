-- Migration: GRANT EXECUTE sur toutes les fonctions trigger
-- Date: 2025-10-27 02:25:00
-- Contexte: Les triggers utilisent des fonctions qui n'ont pas de GRANT pour authenticated
-- Symptôme: "permission denied for function X" lors d'INSERT/UPDATE/DELETE

-- ============================================================================
-- PROBLÈME
-- ============================================================================
-- Quand un utilisateur authentifié modifie une table, les triggers s'exécutent
-- Ces triggers appellent des fonctions (audit, versioning, etc.)
-- Si authenticated n'a pas EXECUTE sur ces fonctions, le trigger échoue
--
-- Exemples d'erreurs:
--   - permission denied for function create_content_version
--   - permission denied for function audit_trigger
--   - permission denied for function update_updated_at_column

-- ============================================================================
-- SOLUTION
-- ============================================================================
-- Donner EXECUTE à authenticated (et anon pour certaines) sur toutes les fonctions
-- utilisées par les triggers ou les RLS policies

-- ============================================================================
-- FONCTIONS TRIGGER - AUDIT
-- ============================================================================

-- Fonction d'audit automatique (logs_audit)
grant execute on function public.audit_trigger() to authenticated;

-- ============================================================================
-- FONCTIONS TRIGGER - VERSIONING
-- ============================================================================

-- Fonction de création de version (appelée par tous les triggers versioning)
grant execute on function public.create_content_version(text, bigint, jsonb, text, text) to authenticated;

-- Fonction de restauration de version (utilisée par admin)
grant execute on function public.restore_content_version(bigint, text) to authenticated;

-- Triggers de versioning spécifiques par table
grant execute on function public.spectacles_versioning_trigger() to authenticated;
grant execute on function public.articles_versioning_trigger() to authenticated;
grant execute on function public.communiques_versioning_trigger() to authenticated;
grant execute on function public.evenements_versioning_trigger() to authenticated;
grant execute on function public.membres_equipe_versioning_trigger() to authenticated;
grant execute on function public.partners_versioning_trigger() to authenticated;
grant execute on function public.compagnie_values_versioning_trigger() to authenticated;
grant execute on function public.compagnie_stats_versioning_trigger() to authenticated;
grant execute on function public.compagnie_presentation_sections_versioning_trigger() to authenticated;

-- ============================================================================
-- FONCTIONS TRIGGER - AUTOMATISATIONS
-- ============================================================================

-- Mise à jour automatique du timestamp updated_at
grant execute on function public.update_updated_at_column() to authenticated;

-- Génération automatique de slug
grant execute on function public.set_slug_if_empty() to authenticated;
grant execute on function public.generate_slug(text) to authenticated, anon;

-- Mise à jour du compteur d'usage des tags
grant execute on function public.update_tag_usage_count() to authenticated;

-- Validation PDF obligatoire pour communiqués
grant execute on function public.check_communique_has_pdf() to authenticated;

-- Timestamp de consentement pour messages contact
grant execute on function public.set_messages_contact_consent_timestamp() to authenticated, anon;

-- ============================================================================
-- FONCTIONS UTILITAIRES (déjà accordées dans migration précédente)
-- ============================================================================
-- is_admin() - déjà GRANT authenticated, anon (utilisée dans RLS policies)

-- ============================================================================
-- VERIFICATION
-- ============================================================================
do $$
declare
  missing_grants text[];
  func_name text;
begin
  -- Vérifier les fonctions critiques
  for func_name in 
    select unnest(array[
      'create_content_version',
      'audit_trigger',
      'update_updated_at_column',
      'spectacles_versioning_trigger',
      'membres_equipe_versioning_trigger'
    ])
  loop
    if not exists(
      select 1 from pg_proc p
      join pg_namespace n on p.pronamespace = n.oid
      where n.nspname = 'public'
        and p.proname = func_name
        and p.proacl::text like '%authenticated%'
    ) then
      missing_grants := array_append(missing_grants, func_name);
    end if;
  end loop;
  
  if array_length(missing_grants, 1) > 0 then
    raise exception 'Missing EXECUTE grants for authenticated: %', array_to_string(missing_grants, ', ');
  end if;
  
  raise notice '✅ All trigger functions have EXECUTE grants for authenticated';
end $$;

-- ============================================================================
-- POST-MIGRATION TEST
-- ============================================================================
-- Pour tester:
--   1. Authentifiez-vous en tant qu'admin
--   2. Modifiez un membre d'équipe (upsertTeamMember)
--   3. Vérifiez qu'aucune erreur "permission denied for function" n'apparaît
--   4. Vérifiez que logs_audit et content_versions ont de nouvelles entrées
