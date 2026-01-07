# Rapport Supabase Advisors — 2026-01-07

Projet Supabase: `yvtrlvmbofklefxcxrzv`

Résumé bref

- Sécurité: 3 alertes (leaked passwords disabled, MFA insuffisante, postgres à mettre à jour).
- Performance: nombreuses recommandations (FK sans index couvrant, RLS inefficace, indices inutilisés, policies permissives multiples).

> **Conseils de sécurité (détaillé)**

1. Leaked password protection désactivée (niveau: WARN)
   - Description : la vérification contre les mots de passe compromis (HaveIBeenPwned) n'est pas activée.
   - Impact : risque d'acceptation de mots de passe déjà compromis → comptes vulnérables (bruteforce/credential stuffing).
   - Remédiation : activer la protection dans la console Supabase (auth settings) et imposer une politique de force minimale des mots de passe.
   - Lien : https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

2. Options MFA insuffisantes (niveau: WARN)
   - Description : trop peu d'options d'authentification multi-facteurs activées pour le projet.
   - Impact : augmentation du risque d'accès non autorisé pour comptes privilégiés.
   - Remédiation : activer au minimum OTP via application d'authentification et prévoir méthodes alternatives (backup codes, sms si nécessaire). Documenter le processus d'enrôlement pour les admins.
   - Lien : https://supabase.com/docs/guides/auth/auth-mfa

3. Version Postgres avec patchs disponibles (niveau: WARN)
   - Description : la version détectée `supabase-postgres-17.4.1.069` a des correctifs de sécurité disponibles.
   - Impact : exposition possible à vulnérabilités corrigées dans des versions plus récentes.
   - Remédiation : planifier une montée de version via le dashboard Supabase (sauvegardes complètes, fenêtre de maintenance). Tester sur staging avant prod.
   - Lien : https://supabase.com/docs/guides/platform/upgrading

> **Conseils de performance (détaillé)**

A. Clés étrangères sans index couvrant — action prioritaire

- Problème : plusieurs contraintes FK n'ont pas d'index couvrant sur la colonne référencée → jointures/filtrages lents.
- Tables / contraintes identifiées (créer index sur la colonne FK listée) :
  - public.articles_categories — `articles_categories_category_id_fkey`
  - public.articles_medias — `articles_medias_media_id_fkey`
  - public.articles_presse — `articles_presse_og_image_media_id_fkey`
  - public.articles_tags — `articles_tags_tag_id_fkey`
  - public.categories — `categories_created_by_fkey`
  - public.communiques_categories — `communiques_categories_category_id_fkey`
  - public.communiques_medias — `communiques_medias_media_id_fkey`
  - public.communiques_presse — `communiques_presse_evenement_id_fkey`
  - public.communiques_tags — `communiques_tags_tag_id_fkey`
  - public.compagnie_presentation_sections — `compagnie_presentation_sections_image_media_id_fkey`
  - public.configurations_site — `configurations_site_updated_by_fkey`
  - public.contacts_presse — `contacts_presse_created_by_fkey`
  - public.evenements — `evenements_lieu_id_fkey`
  - public.home_about_content — `home_about_content_image_media_id_fkey`
  - public.home_hero_slides — `home_hero_slides_image_media_id_fkey`
  - public.membres_equipe — `membres_equipe_photo_media_id_fkey`
  - public.partners — `partners_logo_media_id_fkey`
  - public.seo_redirects — `seo_redirects_created_by_fkey`
  - public.spectacles — `spectacles_og_image_media_id_fkey`
  - public.spectacles_categories — `spectacles_categories_category_id_fkey`
  - public.spectacles_medias — `spectacles_medias_media_id_fkey`
  - public.spectacles_membres_equipe — `spectacles_membres_equipe_membre_id_fkey`
  - public.spectacles_tags — `spectacles_tags_tag_id_fkey`
  - public.tags — `tags_created_by_fkey`

- Exemple SQL (générique) :

```sql
create index if not exists idx_table_fkcol on public.table_name (fk_column);
```

- Remarques : privilégier `create index concurrently` pour les bases en production si disponible, ou planifier la fenêtre de maintenance.

B. RLS — appels `auth.<function>()` réévalués par ligne (initPlan)

- Problème : certaines policies (ex. `public.spectacles`) appellent `auth.<function>()` directement dans la clause, ce qui peut forcer l'évaluation par ligne.
- Impact : dégradation des performances sur scans/reads à grande échelle.
- Remédiation : remplacer `auth.uid()` par `(select auth.uid())` dans les clauses `using`/`with check` des policies pour permettre la mise en cache par initPlan.
- Exemple :

```sql
-- mauvais
create policy "Admins can view all spectacles" on public.spectacles for select to authenticated using ( auth.uid() = owner_id );

-- bon (initPlan)
create policy "Admins can view all spectacles" on public.spectacles for select to authenticated using ( (select auth.uid()) = owner_id );
```

- Lien : https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select

C. Politiques permissives multiples pour le même rôle+action

- Problème : tables avec plusieurs policies permissives pour `authenticated` + `select` (ex. `categories`, `communiques_presse`, `compagnie_presentation_sections`, `home_hero_slides`, `membres_equipe`, `partners`, `spectacles`).
- Impact : chaque policy permissive est évaluée → coût supplémentaire et complexité.
- Remédiation : fusionner les policies compatibles en une seule policy permissive par rôle+action, ou rendre certaines policies restrictives si elles doivent filtrer des sous-ensembles.
- Exemple d'approche :
  - Auditer les policies existantes (décrire l'intention métier).
  - Écrire une policy unique `for select to authenticated using ( <combined_condition> )` ou conserver une seule `to authenticated` et ajouter des policies `to authenticated as restrictive` si besoin (préférer permissive unique pour lectures publiques).

D. Index inutilisés (candidates à suppression ou revision)

- Liste d'indices détectés comme non utilisés (analyse recommandée via `pg_stat_user_indexes` / `pg_stat_all_indexes`) :
  - `idx_pending_invitations_status` (pending_invitations)
  - `idx_compagnie_presentation_sections_kind` (compagnie_presentation_sections)
  - `idx_evenements_parent_event_id`, `idx_evenements_recurrence_end_date`, `idx_evenements_start_time`, `idx_evenements_type_array`, `idx_evenements_date_time` (evenements)
  - `idx_analytics_events_type`, `idx_analytics_events_entity`, `idx_analytics_events_created_at`, `idx_analytics_search_query_trgm` (analytics_events)
  - `idx_categories_display_order`, `idx_categories_is_active` (categories)
  - `idx_content_versions_type` (content_versions)
  - `idx_seo_redirects_old_path`, `idx_seo_redirects_active` (seo_redirects)
  - `idx_sitemap_entries_indexed`, `idx_sitemap_entries_last_modified` (sitemap_entries)
  - `idx_spectacles_title`, `idx_spectacles_title_trgm`, `idx_spectacles_search_vector`, `idx_spectacles_slug`, `idx_spectacles_status`, `idx_spectacles_public`, `idx_spectacles_title_trgm` (spectacles)
  - `idx_articles_published_at`, `idx_articles_title_trgm` (articles_presse)
  - `idx_medias_uploaded_by`, `idx_medias_thumbnail_path` (medias)
  - `idx_communiques_presse_public`, `idx_communiques_presse_ordre`, `idx_communiques_presse_search` (communiques_presse)
  - `idx_partners_is_active` (partners)
  - `idx_profiles_role` (profiles)
  - `idx_configurations_site_key_pattern`, `idx_configurations_site_category` (configurations_site)
  - `idx_messages_contact_*` (messages_contact: reason, status, contact_presse, status_actifs, consent_true)
  - `media_item_tags_tag_id_idx` (media_item_tags)

- Remédiation : pour chaque index non utilisé
  1. vérifier statistiques d'utilisation (`pg_stat_user_indexes`, `pg_stat_all_indexes`).
  2. si inutilisé depuis longtemps, envisager `drop index` après revue et tests.
  3. si index partiellement utile, remplacer par index partiel (`where ...`) pour réduire coût et espace.

> **Actions recommandées — checklist & priorités**

- Haute priorité (sécurité) :
  - activer leaked-password protection immédiatement
  - activer / renforcer MFA pour roles administratifs
  - planifier mise à jour Postgres (test staging → fenêtre maintenance)

- Haute priorité (performance) :
  - créer index couvrants pour les FK listées (voir section A)
  - corriger RLS pour `auth.<function>()` → `(select auth.<function>())`
  - auditer et consolider policies permissives sur les tables listées

- Moyenne priorité :
  - analyser indices non utilisés et préparer suppressions ou index partiels
  - planifier monitoring (pg_stat_user_indexes) et alertes sur croissance des tables/scan

- Exemple de commandes / SQL à utiliser lors d'une intervention :

```sql
-- ajouter index sur clé étrangère
create index concurrently if not exists idx_articles_categories_category_id on public.articles_categories (category_id);

-- remplacer auth.uid() dans une policy (exemple conceptuel)
alter policy "Admins can view all spectacles" on public.spectacles
  using ( (select auth.uid()) = owner_id );
```

> **Fichiers / livrables possibles (si vous voulez que je génère)**

- migrations SQL timestampées pour créer les index FK prioritaires
- patches SQL pour corriger les policies RLS (wrap auth calls)
- rapport Markdown (ce fichier) + checklist prête à PR

---

Ressource : export complet des advisors utilisé pour ce rapport (fournir sur demande).

Fichier généré : [doc/supabase_advisors_report_20260107.md](./supabase_advisors_report_20260107.md)

---

> **Fin du rapport Supabase Advisors — 2026-01-07**
