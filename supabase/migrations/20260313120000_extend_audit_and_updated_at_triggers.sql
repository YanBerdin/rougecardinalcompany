-- Migration: Extend audit and updated_at triggers to additional tables
-- Purpose:   Add trg_audit and trg_update_updated_at to tables missing coverage across
--            three priority tiers: security (invitations), public content (hero/compagnie),
--            and taxonomy (categories, tags, media_folders).
-- Affected tables (9):
--   🔴 CRITICAL  public.user_invitations, public.pending_invitations
--   🟠 HIGH      public.home_hero_slides, public.compagnie_presentation_sections,
--                public.compagnie_values, public.compagnie_stats
--   🟡 MEDIUM    public.categories, public.tags, public.media_folders
-- Notes:
--   - public.user_invitations has no updated_at column → only trg_audit applied
--   - The other 8 tables have updated_at → both triggers applied
--   - public.content_versions is itself a traceability system → deliberately excluded
--   - Junction tables (spectacles_membres_equipe, *_tags, *_categories) → excluded
--     (parent tables are already audited; junction rows have no individual meaning)
--   - public.analytics_events and public.logs_audit → excluded (high-volume / recursion)
-- Reference: supabase/schemas/30_triggers.sql (source of truth updated simultaneously)
-- Task:      TASK076

-- =============================================================================
-- PART 1 — trg_update_updated_at (8 tables with updated_at column)
-- =============================================================================

-- pending_invitations (file d'attente retry emails, transitions de status à tracer)
drop trigger if exists trg_update_updated_at on public.pending_invitations;
create trigger trg_update_updated_at
  before update on public.pending_invitations
  for each row
  execute function public.update_updated_at_column();

-- home_hero_slides (slides hero page d'accueil — home_about_content déjà couvert)
drop trigger if exists trg_update_updated_at on public.home_hero_slides;
create trigger trg_update_updated_at
  before update on public.home_hero_slides
  for each row
  execute function public.update_updated_at_column();

-- compagnie_presentation_sections (sections dynamiques page La Compagnie)
drop trigger if exists trg_update_updated_at on public.compagnie_presentation_sections;
create trigger trg_update_updated_at
  before update on public.compagnie_presentation_sections
  for each row
  execute function public.update_updated_at_column();

-- compagnie_values (valeurs institutionnelles)
drop trigger if exists trg_update_updated_at on public.compagnie_values;
create trigger trg_update_updated_at
  before update on public.compagnie_values
  for each row
  execute function public.update_updated_at_column();

-- compagnie_stats (statistiques / chiffres clés)
drop trigger if exists trg_update_updated_at on public.compagnie_stats;
create trigger trg_update_updated_at
  before update on public.compagnie_stats
  for each row
  execute function public.update_updated_at_column();

-- categories (taxonomy → structure l'ensemble du contenu audité)
drop trigger if exists trg_update_updated_at on public.categories;
create trigger trg_update_updated_at
  before update on public.categories
  for each row
  execute function public.update_updated_at_column();

-- tags (étiquetage flexible)
drop trigger if exists trg_update_updated_at on public.tags;
create trigger trg_update_updated_at
  before update on public.tags
  for each row
  execute function public.update_updated_at_column();

-- media_folders (structure de la médiathèque — modifications rares mais traçables)
drop trigger if exists trg_update_updated_at on public.media_folders;
create trigger trg_update_updated_at
  before update on public.media_folders
  for each row
  execute function public.update_updated_at_column();

-- =============================================================================
-- PART 2 — trg_audit (9 tables, toutes opérations INSERT / UPDATE / DELETE)
-- =============================================================================

do $$
declare
  -- Tables à couvrir par le trigger d'audit
  -- user_invitations incluse malgré l'absence d'updated_at (traçabilité sécurité critique)
  new_tables text[] := array[
    'public.user_invitations',
    'public.pending_invitations',
    'public.home_hero_slides',
    'public.compagnie_presentation_sections',
    'public.compagnie_values',
    'public.compagnie_stats',
    'public.categories',
    'public.tags',
    'public.media_folders'
  ];
  tbl text;
begin
  foreach tbl in array new_tables
  loop
    -- Supprimer le trigger existant s'il y en a un (idempotent)
    execute format('drop trigger if exists trg_audit on %s;', tbl);

    -- Créer le trigger d'audit après chaque mutation
    execute format(
      'create trigger trg_audit
        after insert or update or delete on %s
        for each row
        execute function public.audit_trigger();',
      tbl
    );
  end loop;
end;
$$;
