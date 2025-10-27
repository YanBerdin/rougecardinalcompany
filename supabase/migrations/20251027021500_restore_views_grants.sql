-- Migration: Restauration des GRANTs pour toutes les vues
-- Date: 2025-10-27 02:15:00
-- Contexte: Les vues créées avant la migration des GRANTs n'ont pas de permissions
--           pour anon/authenticated, causant des erreurs "permission denied"

-- ============================================================================
-- VUES PUBLIQUES (accès lecture pour anon et authenticated)
-- ============================================================================

-- Vue des articles de presse publics
grant select on public.articles_presse_public to anon, authenticated;

-- Vue des communiqués de presse publics
grant select on public.communiques_presse_public to anon, authenticated;

-- Hiérarchie des catégories (navigation publique)
grant select on public.categories_hierarchy to anon, authenticated;

-- Tags populaires (public)
grant select on public.popular_tags to anon, authenticated;

-- ============================================================================
-- VUES ADMIN (accès lecture pour authenticated uniquement)
-- ============================================================================

-- Dashboard communiqués de presse
grant select on public.communiques_presse_dashboard to authenticated;

-- Administration des sections de présentation
grant select on public.compagnie_presentation_sections_admin to authenticated;

-- Versions de contenu détaillées
grant select on public.content_versions_detailed to authenticated;

-- Administration des membres d'équipe
grant select on public.membres_equipe_admin to authenticated;

-- Administration des messages de contact
grant select on public.messages_contact_admin to authenticated;

-- Administration des partenaires
grant select on public.partners_admin to authenticated;

-- Résumé analytics
grant select on public.analytics_summary to authenticated;

-- ============================================================================
-- COMMENTAIRE
-- ============================================================================

comment on schema public is 'GRANTs restaurés pour vues publiques et admin';
