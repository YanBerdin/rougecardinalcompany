-- Validation RLS - Vérification des politiques de sécurité
-- Ce fichier sert de documentation et de validation des politiques RLS

-- ✅ Tables avec RLS complètes
/*

TABLES AVEC POLITIQUES RLS CONFIGURÉES :

1. public.profiles (60_rls_profiles.sql)
   - SELECT: Lecture publique
   - INSERT: Utilisateurs peuvent créer leur profil
   - UPDATE/DELETE: Propriétaires uniquement

2. public.medias (61_rls_main_tables.sql)
   - SELECT: Lecture publique
   - INSERT: Utilisateurs authentifiés
   - UPDATE/DELETE: Uploadeur ou admin

3. public.spectacles (61_rls_main_tables.sql)
   - SELECT: Spectacles publics seulement
   - INSERT: Utilisateurs authentifiés
   - UPDATE/DELETE: Créateur ou admin

4. public.evenements (61_rls_main_tables.sql)
   - SELECT: Lecture publique
   - INSERT/UPDATE/DELETE: Admins seulement

5. public.partners (61_rls_main_tables.sql)
   - SELECT: Partenaires actifs publiquement, tous pour admins
   - INSERT/UPDATE/DELETE: Admins seulement

6. public.analytics_events (62_rls_advanced_tables.sql)
   - SELECT: Admins seulement
   - INSERT: Tout le monde (tracking)
   - UPDATE/DELETE: Admins seulement

7. public.categories (62_rls_advanced_tables.sql)
   - SELECT: Catégories actives publiquement, toutes pour admins
   - INSERT/UPDATE/DELETE: Admins seulement

8. public.tags (62_rls_advanced_tables.sql)
   - SELECT: Lecture publique
   - INSERT/UPDATE/DELETE: Admins seulement

9. Tables de relations tags/categories (62_rls_advanced_tables.sql)
   - spectacles_categories, spectacles_tags
   - articles_categories, articles_tags
   - SELECT: Lecture publique
   - INSERT/UPDATE/DELETE: Admins seulement

10. public.content_versions (62_rls_advanced_tables.sql)
    - SELECT: Admins seulement
    - INSERT: Utilisateurs authentifiés (via triggers)
    - UPDATE/DELETE: Admins seulement

11. public.seo_redirects (62_rls_advanced_tables.sql)
    - SELECT/INSERT/UPDATE/DELETE: Admins seulement

12. public.sitemap_entries (62_rls_advanced_tables.sql)
    - SELECT: Entrées indexées publiquement
    - INSERT/UPDATE/DELETE: Admins seulement

NOUVELLES TABLES AJOUTÉES (63_rls_missing_tables.sql):

13. public.lieux
    - SELECT: Lecture publique
    - INSERT/UPDATE/DELETE: Admins seulement

14. public.membres_equipe
    - SELECT: Lecture publique
    - INSERT/UPDATE/DELETE: Admins seulement

15. public.abonnes_newsletter
    - SELECT: Admins seulement (protection RGPD)
    - INSERT: Tout le monde (inscription)
    - UPDATE/DELETE: Admins seulement

16. public.messages_contact
    - SELECT: Admins seulement
    - INSERT: Tout le monde (contact)
    - UPDATE/DELETE: Admins seulement

17. public.configurations_site
    - SELECT: Configs publiques pour tous, toutes pour admins
    - INSERT/UPDATE/DELETE: Admins seulement

18. public.logs_audit
    - SELECT: Admins seulement
    - INSERT: Système (via triggers)
    - UPDATE/DELETE: Super-admins seulement

19. public.events_recurrence
    - SELECT: Lecture publique
    - INSERT/UPDATE/DELETE: Admins seulement

*/

-- ⚡ Optimisations Appliquées
/*

OPTIMISATIONS DE PERFORMANCE RLS :

1. Utilisation de (select auth.uid()) pour mise en cache
2. Utilisation de (select public.is_admin()) pour mise en cache
3. Index sur colonnes utilisées dans les politiques :
   - profiles.user_id
   - medias.uploaded_by
   - spectacles.created_by
   - spectacles.public
   - partners.is_active
   - categories.is_active
   - profiles.role
   - configurations_site.is_public

*/

-- 📝 Notes Importantes
/*

CONFORMITÉ AUX INSTRUCTIONS :

✅ Politiques séparées par opération (SELECT, INSERT, UPDATE, DELETE)
✅ Utilisation de auth.uid() au lieu de current_user
✅ USING pour SELECT/DELETE, WITH CHECK pour INSERT/UPDATE
✅ Politiques PERMISSIVE (pas RESTRICTIVE)
✅ Noms descriptifs entre guillemets doubles
✅ Rôles spécifiés avec TO clause
✅ Optimisations avec (select function()) pour performance

SÉCURITÉ :

- Tables publiques : spectacles, evenements, lieux, membres_equipe, tags
- Tables protégées : analytics, logs_audit, messages_contact, abonnes_newsletter
- Tables mixtes : categories, configurations_site (public/private selon flag)
- Propriété utilisateur : profiles, medias (users own their data)

*/
