-- Migration: Restauration des GRANTs pour toutes les tables restantes
-- Date: 2025-10-27 02:00:00
-- Contexte: Après campagne de sécurité RLS, les GRANTs ont été révoqués
--           mais PostgreSQL nécessite GRANT + RLS (2 niveaux de permission)
-- Référence: Issue #RLS-GRANTS-MISSING

-- Cette migration restaure les GRANTs de base pour anon et authenticated
-- Les RLS policies continuent de filtrer les lignes accessibles

-- ============================================================================
-- TABLES DE CONTENU PUBLIC
-- ============================================================================

-- Événements (lectures publiques, écritures admin via RLS)
grant select on public.evenements to anon, authenticated;
grant insert, update, delete on public.evenements to authenticated;

-- Lieux (lectures publiques, écritures admin via RLS)
grant select on public.lieux to anon, authenticated;
grant insert, update, delete on public.lieux to authenticated;

-- Médias (lectures publiques, uploads via RLS)
grant select on public.medias to anon, authenticated;
grant insert, update, delete on public.medias to authenticated;

-- Articles de presse (lectures publiques, écritures admin via RLS)
grant select on public.articles_presse to anon, authenticated;
grant insert, update, delete on public.articles_presse to authenticated;

-- Catégories (lectures publiques si actives, écritures admin via RLS)
grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;

-- Tags (lectures publiques, écritures admin via RLS)
grant select on public.tags to anon, authenticated;
grant insert, update, delete on public.tags to authenticated;

-- Contacts presse (admin seulement via RLS)
grant select, insert, update, delete on public.contacts_presse to authenticated;

-- Présentation de la compagnie
grant select on public.compagnie_presentation_sections to anon, authenticated;
grant insert, update, delete on public.compagnie_presentation_sections to authenticated;

-- Valeurs de la compagnie
grant select on public.compagnie_values to anon, authenticated;
grant insert, update, delete on public.compagnie_values to authenticated;

-- ============================================================================
-- TABLES DE LIAISON (many-to-many)
-- ============================================================================

-- Relations articles
grant select on public.articles_medias to anon, authenticated;
grant insert, update, delete on public.articles_medias to authenticated;

grant select on public.articles_categories to anon, authenticated;
grant insert, update, delete on public.articles_categories to authenticated;

grant select on public.articles_tags to anon, authenticated;
grant insert, update, delete on public.articles_tags to authenticated;

-- Relations communiqués
grant select on public.communiques_medias to anon, authenticated;
grant insert, update, delete on public.communiques_medias to authenticated;

grant select on public.communiques_categories to anon, authenticated;
grant insert, update, delete on public.communiques_categories to authenticated;

grant select on public.communiques_tags to anon, authenticated;
grant insert, update, delete on public.communiques_tags to authenticated;

-- Relations spectacles
grant select on public.spectacles_medias to anon, authenticated;
grant insert, update, delete on public.spectacles_medias to authenticated;

grant select on public.spectacles_categories to anon, authenticated;
grant insert, update, delete on public.spectacles_categories to authenticated;

grant select on public.spectacles_tags to anon, authenticated;
grant insert, update, delete on public.spectacles_tags to authenticated;

grant select on public.spectacles_membres_equipe to anon, authenticated;
grant insert, update, delete on public.spectacles_membres_equipe to authenticated;

-- ============================================================================
-- TABLES SYSTÈME
-- ============================================================================

-- Newsletter (inscription libre, lecture admin via RLS)
grant select, insert on public.abonnes_newsletter to anon, authenticated;
grant update, delete on public.abonnes_newsletter to authenticated;

-- Messages contact (envoi libre, lecture admin via RLS)
grant select, insert on public.messages_contact to anon, authenticated;
grant update, delete on public.messages_contact to authenticated;

-- Analytics (insertion libre, lecture admin via RLS)
grant select, insert on public.analytics_events to anon, authenticated;
grant update, delete on public.analytics_events to authenticated;

-- Audit logs (système seulement via RLS)
grant select on public.logs_audit to authenticated;

-- Content versioning (système + admin via RLS)
grant select on public.content_versions to authenticated;
grant insert, update, delete on public.content_versions to authenticated;

-- SEO
grant select on public.seo_redirects to authenticated;
grant insert, update, delete on public.seo_redirects to authenticated;

grant select on public.sitemap_entries to anon, authenticated;
grant insert, update, delete on public.sitemap_entries to authenticated;

-- ============================================================================
-- SÉQUENCES
-- ============================================================================

-- Permettre l'usage des séquences pour les inserts
grant usage on all sequences in schema public to anon, authenticated;

-- ============================================================================
-- COMMENTAIRES
-- ============================================================================

comment on schema public is 'GRANTs restaurés pour anon/authenticated - RLS policies filtrent les lignes';
