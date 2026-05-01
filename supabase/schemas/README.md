# Schéma déclaratif (supabase/schemas)

Ce dossier contient la source de vérité déclarative du schéma de la base de données utilisée par Supabase. Suivez ces règles lorsqu'il faut modifier la structure des tables, vues, fonctions ou politiques RLS.

Principes clés

- modifier uniquement les fichiers `.sql` dans `supabase/schemas/` pour que `supabase db diff` et le workflow déclaratif restent cohérents.
- nommer les fichiers pour forcer l'ordre d'exécution si nécessaire (lexicographic order).
- ne pas exécuter de DML (insert/update/delete) dans ces fichiers : gardez la déclaration du schéma pure.

RLS & vues

- toutes les nouvelles tables doivent activer `row level security`.
- pour les vues admin, utilisez `security invoker` et ajoutez un filtre explicite s'appuyant sur la fonction `public.is_admin()` dans la définition de la vue :

```sql
create view public.my_admin_view
as
select * from public.sensitive_table
where (select public.is_admin()) = true;
```

- n'accordez jamais `grant select to authenticated` sur des vues admin ; préférez des politiques RLS et des gardes dans la vue.
- pour les **tables éditoriales** (spectacles, événements, presse, médias, compagnie, hero, about, partenaires…), utilisez `public.has_min_role('editor')` au lieu de `public.is_admin()` dans les policies RLS d'écriture. Cela permet aux éditeurs de modifier le contenu sans accès admin complet :

```sql
-- Pattern hiérarchique : user(0) < editor(1) < admin(2)
create policy "Editors+ can update spectacles" on public.spectacles
for update
to authenticated
using ( (select public.has_min_role('editor')) )
with check ( (select public.has_min_role('editor')) );
```

Migrations de sécurité récentes

- `supabase/migrations/20260501203935_add_audit_logs_filter_indexes.sql` — perf/fix : 3 index btree créés sur `public.logs_audit` (`idx_logs_audit_action`, `idx_logs_audit_table_name`, `idx_logs_audit_user_id`) pour résoudre les `statement_timeout` des 11 tests E2E ADM-AUDIT-001 à ADM-AUDIT-011. Utilise `CREATE INDEX IF NOT EXISTS`. Déclaratif synchronisé : `42_rpc_audit_logs.sql`. Appliquée le 2026-05-01 (local + cloud).
- `supabase/migrations/20260502140000_revoke_get_audit_logs_from_authenticated.sql` — fix lint-0029 : révocation EXECUTE sur `get_audit_logs_with_email(bigint, bigint, text, text)` des rôles `authenticated` et `anon`. DAL migré vers `createAdminClient()` (service_role). `is_admin()` retiré de la fonction (`auth.uid() = null` via service_role). Déclaratif synchronisé : `42_rpc_audit_logs.sql`. Appliquée le 2026-05-02.
- `supabase/migrations/20260502120200_drop_remaining_unused_indexes.sql` — fix lint-0005 : suppression de ~18 index inutilisés sur plusieurs tables. Utilise `DROP INDEX IF EXISTS`. Appliquée le 2026-05-02.
- `supabase/migrations/20260502120100_add_communiques_fk_indexes.sql` — fix lint-0001 : 6 index btree créés sur les FK non indexées des tables `communiques_*` (`communiques_categories`, `communiques_presse`, `communiques_tags`). Utilise `CREATE INDEX IF NOT EXISTS`. Appliquée le 2026-05-02.
- `supabase/migrations/20260502120000_revoke_anon_all_security_definer_functions.sql` — fix lint-0028/0029 : TIER 1 → conversion en SECURITY INVOKER (`is_admin`, `has_min_role`, `get_current_timestamp`, `reorder_hero_slides`, `reorder_team_members`) ; TIER 2 → `REVOKE FROM PUBLIC` sur 10 fonctions SECURITY DEFINER restantes. Note : seul `REVOKE FROM PUBLIC` supprime l'EXECUTE hérité de `PUBLIC`. Appliquée le 2026-05-02.
- `supabase/migrations/20260318000000_optimize_audit_logs_rpc.sql` — perf : réécriture de `get_audit_logs_with_email` avec 3 CTEs indépendants (total_count sans JOIN, page_logs avec LIMIT avant JOIN, JOIN final sur ≤50 lignes) + index `idx_logs_audit_created_at` + plafond `p_limit ≤ 200`. Résout `statement_timeout=8s` du rôle authenticated sur ~7 696 lignes. Déclaratif synchronisé : `42_rpc_audit_logs.sql`. Appliquée le 2026-03-18.
- `supabase/migrations/20260313020000_add_audit_trigger_to_junction_tag_tables.sql` — fix : ajout `trg_audit` (AFTER INSERT OR UPDATE OR DELETE) sur les 4 tables de jonction tags : `articles_tags`, `communiques_tags`, `media_item_tags`, `spectacles_tags`. Compatibles avec les triggers `usage_count` existants. `popular_tags` exclue (VIEW). Déclaratif synchronisé : `30_triggers.sql`. Appliquée le 2026-03-13.
- `supabase/migrations/20260313010000_add_audit_trigger_to_media_tags.sql` — fix : `media_tags` absente de l'array `audit_tables` → opérations éditeur non tracées dans `logs_audit`. Ajout de `trg_audit` (AFTER INSERT OR UPDATE OR DELETE). Déclaratif synchronisé : `30_triggers.sql`. Appliquée le 2026-03-13.
- `supabase/migrations/20260312140000_fix_handle_new_user_admin_managed_flag.sql` — fix : `handle_new_user()` retourne `NEW` sans INSERT quand `raw_user_meta_data->>'_admin_managed' = 'true'` → `createUserProfileWithRole()` avec client authentifié capture le vrai UUID admin dans l'audit. Déclaratif synchronisé : `21_functions_auth_sync.sql`. Appliquée le 2026-03-12.
- `supabase/migrations/20260312130000_skip_profile_trigger_for_invited_users.sql` — fix (supersédé) : tentative via `invited_at IS NOT NULL` — abandonnée car `generateLink` fixe `invited_at = NULL` à l'INSERT time. Remplacée par `20260312140000`. Appliquée le 2026-03-12.
- `supabase/migrations/20260312120000_fix_profiles_delete_rls_for_admins.sql` — fix : policy RLS DELETE `profiles` étendue avec `OR (select public.is_admin()) = true` pour permettre la suppression pré-audit avec client authentifié. Déclaratif : `60_rls_profiles.sql`. Appliquée le 2026-03-12.
- `supabase/migrations/20260311120000_editor_role_rls_policies.sql` — feat : ~60 ALTER POLICY sur tables éditoriales migrent `is_admin()` vers `has_min_role('editor')` (spectacles, événements, presse, médias, compagnie, hero, about, partenaires, lieux, tags, catégories, SEO, versioning). Déclaratifs synchronisés : `61_rls_main_tables.sql`, `62_rls_advanced_tables.sql`. Appliquée le 2026-03-11.
- `supabase/migrations/20260311030511_editor_storage_policies.sql` — feat : policies stockage bucket `medias` migrées de `is_admin()` vers `has_min_role('editor')` pour INSERT/UPDATE/DELETE. Déclaratif : `70_storage_policies.sql` (nouveau). Appliquée le 2026-03-11.
- `supabase/migrations/20260311030000_create_has_min_role_function.sql` — feat : création fonction `public.has_min_role(required_role text)` retournant boolean, hiérarchie `user(0) < editor(1) < admin(2)`, SECURITY INVOKER, `set search_path = ''`, immutable. Prérequis cloud pour les policies éditeur. Déclaratif : `02b_functions_core.sql`. Appliquée le 2026-03-11.
- `supabase/migrations/20260310120000_fix_rls_policy_bugs.sql` — bugfix : (P0) retrait `AS RESTRICTIVE` sur policy SELECT admin `articles_presse` (bloquait les authenticated non-admins), (P1-a) policies `super_admin` impossibles remplacées par `is_admin()` sur `logs_audit`, (P1-b) subqueries inline `exists(...)` remplacées par `(select public.is_admin())` dans les policies `spectacles`, (P2) description rôle `editor` mise à jour dans `InviteUserForm.tsx`. Déclaratifs synchronisés : `08_table_articles_presse.sql`, `10_tables_system.sql`, `61_rls_main_tables.sql`. Appliquée le 2026-03-10.
- `supabase/migrations/20260304010000_fix_rls_display_toggles_visibility.sql` — hotfix : correction policy RLS SELECT `configurations_site` pour autoriser les clés `display_toggle_*` en lecture publique (anon + authenticated). Les sections hero/about/spectacles/partners/newsletter étaient invisibles car RLS filtrait les display toggles. Déclaratif : `10_tables_system.sql`. Appliquée le 2026-03-04.
- `supabase/migrations/20260304000000_fix_configurations_site_grants.sql` — hotfix : ajout GRANT SELECT (anon, authenticated) et GRANT INSERT/UPDATE/DELETE (authenticated) manquants sur `configurations_site`. Déclaratif : `10_tables_system.sql`. Appliquée le 2026-03-04.
- `supabase/migrations/20260227210418_fix_analytics_events_insert_policy.sql` — hotfix : correction policy RLS INSERT `analytics_events` : ajout `'page_view'` dans les event_types autorisés + `entity_type IS NULL` permis explicitement. Deux policies granulaires anon/authenticated remplacent l'ancienne policy combinée. Déclaratif : `62_rls_advanced_tables.sql` (NOTE ajoutée). Appliquée le 2026-02-27.
- `supabase/migrations/20260311190551_fix_spectacle_photo_views_editor_access.sql` — bugfix : remplacement du garde `is_admin()` par `has_min_role('editor')` dans les vues `spectacles_landscape_photos_admin` et `spectacles_gallery_photos_admin`. Les éditeurs ne pouvaient plus voir les photos paysage/galerie en backoffice (formulaire vide → `[ERR_PHOTO_001]`). Déclaratifs synchronisés : `41_views_spectacle_photos.sql`, `42_views_spectacle_gallery.sql`. Appliquée le 2026-03-11.
- `supabase/migrations/20260220130000_fix_spectacle_admin_views_security.sql` — hotfix : ajout garde `is_admin()` sur `spectacles_landscape_photos_admin` (`41_views_spectacle_photos.sql`) et `spectacles_gallery_photos_admin` (`42_views_spectacle_gallery.sql`) + REVOKE anon (pattern TASK037). Appliquée le 2026-02-20.
- `supabase/migrations/20260103120000_fix_communiques_presse_dashboard_admin_access.sql` — hotfix : recréation de la vue admin avec garde `is_admin()`.
- `supabase/migrations/20260103123000_revoke_authenticated_on_communiques_dashboard.sql` — révocation du SELECT au rôle `authenticated` sur la vue admin.
- `supabase/migrations/20260118010000_restore_insert_policies_dropped_by_task053.sql` — restauration des INSERT policies sur `messages_contact` et `analytics_events`, ré-activation RLS sur `home_hero_slides`, révocation grants `communiques_presse_dashboard`.
- `supabase/migrations/20260118012000_fix_security_definer_views_and_merge_policies.sql` — conversion de 4 vues en SECURITY INVOKER (`communiques_presse_public`, `data_retention_recent_audit`, `data_retention_monitoring`, `data_retention_stats`) + fusion des policies SELECT redondantes sur `home_hero_slides`.

Bonnes pratiques opérationnelles

- avant de pousser une migration critique : exécuter les scripts de vérification (`scripts/check-views-security.ts`, `scripts/test-views-security-authenticated.ts`).
- en cas de mismatch d'historique de migrations, réparer l'historique distant puis `supabase db pull` avant de re-pusher.

Contact & support

- Pour questions sur le schéma ou les migrations : voir `supabase/migrations/migrations.md` et contacter l'équipe infra (mainteneur : `yandevformation@gmail.com`).

# 📊 Schéma Déclaratif Rouge Cardinal Company

Ce dossier contient le schéma déclaratif de la base de données selon les instructions **Declarative Database Schema Management** de Supabase.

---

## 🎯 Vue d'Ensemble

### Principe du Schéma Déclaratif

- **UN fichier .sql par entité** (table, fonction, policy, etc.)
- **Ordre lexicographique** pour gérer les dépendances
- **État final désiré** (pas de migrations incrémentales)
- **Génération automatique** des migrations via `supabase db diff`

### Conformité Instructions ✅

| Instruction | Statut | Détail |
| ------------- | -------- | -------- |
| **RLS Policies** | ✅ 100% | 36/36 tables protégées (25 principales + 11 liaison) |
| **Functions** | ✅ 100% | SECURITY INVOKER, search_path défini |
| **SQL Style** | ✅ 100% | Lowercase, snake_case, commentaires |
| **Schema Structure** | ✅ 100% | Ordre lexicographique respecté |
| **Performance** | ✅ Optimisé | 24 index FK + RLS initPlan + policies fusionnées (2026-01-07) |

---

## 📁 Organisation des Fichiers

```bash
supabase/schemas/
├── 01_extensions.sql              # Extensions PostgreSQL (pgcrypto, pg_trgm)
├── 02b_functions_core.sql         # Fonctions cœur précoces (is_admin, has_min_role, helpers, immutable…)
├── 02c_storage_buckets.sql        # Buckets Supabase Storage (medias, backups) + RLS policies
├── 02_table_profiles.sql          # Table des profils + RLS
├── 03_table_medias.sql            # Table des médias + RLS
├── 04_table_media_tags_folders.sql # Tags et dossiers médias + RLS
├── 04_table_membres_equipe.sql    # Table membres équipe + RLS
├── 05_profiles_auto_sync.sql      # Trigger sync auth.users → profiles
├── 05_table_lieux.sql             # Table des lieux + RLS
├── 06_table_spectacles.sql        # Table des spectacles + RLS
├── 07_table_evenements.sql        # Table des événements + RLS (billeterie, horaires, types)
├── 07b_table_compagnie_content.sql # Contenu institutionnel (valeurs & stats) + RLS
├── 07c_table_compagnie_presentation.sql # Sections présentation compagnie + RLS
├── 07d_table_home_hero.sql        # Slides hero page d'accueil + RLS
├── 07e_table_home_about.sql       # Bloc About de la Home (title/intro/mission) + RLS
├── 08_table_articles_presse.sql   # Table articles presse + RLS
├── 08b_communiques_presse.sql     # Table communiqués presse + RLS + contacts presse
├── 09_table_partners.sql          # Table des partenaires + RLS
├── 10_tables_system.sql           # Tables système + RLS (config, logs, newsletter, contact)
├── 10b_tables_user_management.sql # Invitations utilisateurs + RLS
├── 11_tables_relations.sql        # Tables de liaison many-to-many + RLS
├── 12_evenements_recurrence.sql   # Gestion de récurrence événements + RLS
├── 13_analytics_events.sql        # Table analytics événements + RLS + vue 90d
├── 14_categories_tags.sql         # Système de catégories et tags + RLS
├── 15_content_versioning.sql      # Système de versioning du contenu + RLS
├── 16_seo_metadata.sql            # Métadonnées SEO et redirections + RLS
├── 20_audit_logs_retention.sql    # Rétention logs audit (expires_at) + cleanup function
├── 20_functions_core.sql          # (Shim) — déplacées en 02b_functions_core.sql
├── 21_data_retention_tables.sql   # 🆕 TASK053: Tables config + audit rétention
├── 21_functions_auth_sync.sql     # Fonctions sync auth.users
├── 22_data_retention_functions.sql # 🆕 TASK053: Fonctions purge SECURITY DEFINER
├── 30_triggers.sql                # Déclencheurs (audit, search, update_at)
├── 40_indexes.sql                 # Index et optimisations RLS
├── 41_views_admin_content_versions.sql # Vues tardives: admin contenu/versioning
├── 41_views_communiques.sql       # Vues tardives: communiqués (public + dashboard)
├── 41_views_retention.sql         # 🆕 TASK053: Vues monitoring rétention
├── 42_rpc_audit_logs.sql          # RPC pour audit logs viewer
├── 50_constraints.sql             # Contraintes et validations
├── 60_rls_profiles.sql            # Politiques RLS pour profils
├── 61_rls_main_tables.sql         # Politiques RLS tables principales
├── 62_rls_advanced_tables.sql     # Politiques RLS tables avancées
├── 63_reorder_team_members.sql    # Fonction réordonnancement équipe
├── 63b_reorder_hero_slides.sql    # Fonction réordonnancement hero slides
├── 70_storage_policies.sql        # Policies stockage bucket medias (has_min_role)
└── README.md                      # Cette documentation
```

**Note RLS**: les nouvelles tables co‑localisent leurs politiques (dans le même fichier que la table). Des fichiers RLS globaux (60–62) restent en place pour les tables historiques; convergence vers un modèle 100% co‑localisé en cours.

---

## 🆕 Mises à jour récentes (avril 2026)

- **FIX: Suppression de `display_toggle_home_hero` (23 avril 2026)** : Toggle erroné supprimé de la base de données et de toutes les couches applicatives.
  - **Migration** : `20260101190000_remove_display_toggle_home_hero.sql` (DELETE 1 row sur `configurations_site`)
  - **Contexte** : Ce toggle permettait de masquer le Hero Banner depuis l'interface admin, ce qui ne correspond pas au comportement attendu. Le hero doit être toujours visible si des slides actifs existent.
  - **État DB** : 9 display toggles (5 home: about, spectacles, a_la_une, partners, newsletter • 2 presse • 1 agenda • 1 contact)
  - **Impact applicatif** : `HeroContainer.tsx` sans gate toggle, `ToggleCard.tsx` / `site-config-actions.ts` nettoyés, groupe Home admin passe de 6 à 5 toggles
  - **Tests E2E** : ADM-CONFIG-001 mis à jour (5 toggles home), ADM-CONFIG-002 et ADM-CONFIG-003 supprimés

- **FEAT: Triggers sync `evenements.genres` depuis `spectacles.genre` (18 avril 2026)** : `evenements.genres` (text[]) n'est plus saisi manuellement dans le formulaire événement. Deux triggers PostgreSQL assurent la synchronisation automatique depuis `spectacles.genre` (text, source de vérité) :
  - `trg_sync_evenement_genres` — BEFORE INSERT OR UPDATE OF `spectacle_id` sur `evenements` → fonction `sync_evenement_genres_from_spectacle()` (SECURITY INVOKER)
  - `trg_sync_evenements_on_spectacle_genre_update` — AFTER UPDATE OF `genre` sur `spectacles` → propage le changement à tous les événements liés (SECURITY DEFINER)
  - Un backfill initialise tous les événements existants au moment de l'application.
  - **Impact applicatif** : `genres` retiré de `EventFormSchema`, `EventInputSchema`, `createEventAction`, `updateEventAction`, `EventForm.tsx`. `EventDTO.genres` et `EventClientDTO.genres` conservés (lecture seule).
  - **Migration** : `20260418200000_sync_evenement_genres_trigger.sql`. Déclaratif synchronisé : `07_table_evenements.sql`, `30_triggers.sql`. Appliquée le 2026-04-18.

- **REFACTOR: Suppression contrainte `check_valid_event_types` (18 avril 2026)** : La contrainte CHECK limitant les valeurs de `evenements.genres` à une liste figée a été supprimée. Elle est devenue obsolète maintenant que `genres` est auto-géré par trigger depuis `spectacles.genre` (valeur libre text).
  - **Migration** : `20260418182912_drop_genres_constraint.sql`. Déclaratif synchronisé : `50_constraints.sql`. Appliquée le 2026-04-18.

- **FIX: Contrainte `evenements_status_check` — ajout de `'completed'` (17 avril 2026)** : La contrainte CHECK sur `evenements.status` ne contenait que `'complet'` (valeur française legacy) mais pas `'completed'` (valeur anglaise utilisée par le code TypeScript/Zod). Tout changement de statut vers « terminé » déclenchait `[ERR_AGENDA_004] new row for relation "evenements" violates check constraint`.
  - **Root cause** : Divergence enum — le schéma Zod (`lib/schemas/agenda.ts`) et le DAL (`lib/dal/admin-agenda.ts`) utilisent `'completed'`, mais la DB n'acceptait pas cette valeur.
  - **Migration hotfix** : `20260417120000_fix_evenements_status_check_add_completed.sql` — recréation idempotente de la contrainte avec `'completed'` ajouté à la liste complète.
  - **Schéma déclaratif synchronisé** : `50_constraints.sql` — source de vérité mise à jour.
  - **Application** : ✅ `pnpm dlx supabase db push` → exit 0 (2026-04-17).

---

## 🆕 Mises à jour récentes (mars 2026)

- **FIX: Conformité RLS MIG-005 — Séparation policies anon/authenticated — TASK077 + TASK079 (15 mars 2026)** : Toutes les policies RLS combinant `to anon, authenticated` ont été remplacées par des policies granulaires séparées (1 par rôle Supabase), conformément à la règle MIG-005.
  - **TASK077 (batch 1)** : 13 tables corrigées dans 9 fichiers schema.
    - Schemas : `06_table_spectacles.sql`, `07_table_evenements.sql`, `08_table_articles_presse.sql`, `08b_communiques_presse.sql`, `09_table_partners.sql`, `10_tables_system.sql`, `13_analytics_events.sql`, `14_categories_tags.sql`, `61_rls_main_tables.sql`
    - Migration : `20260315001500_fix_rls_separate_anon_authenticated_batch1.sql`
  - **TASK079 (batch 2)** : 17 tables, 21 violations corrigées dans 11 fichiers schema.
    - Schemas : `02_table_profiles.sql`, `03_table_medias.sql`, `05_table_lieux.sql`, `07b_table_compagnie_content.sql`, `07c_table_compagnie_presentation.sql`, `07d_table_home_hero.sql`, `07e_table_home_about.sql`, `10_tables_system.sql`, `12_evenements_recurrence.sql`, `15_content_versioning.sql`, `16_seo_metadata.sql`
    - Migration : `20260315000238_fix_rls_separate_anon_authenticated_batch2.sql`
    - Nettoyage inclus : 2 policies dupliquées TASK076 (`categories` + `tags`) + gestion conditionnelle `events_recurrence`
  - **Résultat** : 0 violation `{anon,authenticated}` restante. Distribution : 40 anon + 162 authenticated.

- **FEAT: Extension triggers audit et updated_at — TASK076 (13 mars 2026)** : Extension de la couverture des triggers `trg_audit` et `trg_update_updated_at` à 9 tables supplémentaires non encore couvertes.
  - **Tables couvertes (3 priorités)** :
    - 🔴 CRITIQUE : `user_invitations`, `pending_invitations` (sécurité / traçabilité RH)
    - 🟠 HAUTE : `home_hero_slides`, `compagnie_presentation_sections`, `compagnie_values`, `compagnie_stats` (contenu public)
    - 🟡 MOYENNE : `categories`, `tags`, `media_folders` (taxonomie / organisation médiathèque)
  - **Détail** : `user_invitations` n'a pas de colonne `updated_at` → seul `trg_audit` appliqué. Les 8 autres tables reçoivent `trg_audit` + `trg_update_updated_at`. Exclusions délibérées : `content_versions` (traçabilité native), tables de jonction, `analytics_events` / `logs_audit` (haut volume / récursion).
  - **Schéma déclaratif mis à jour** : `30_triggers.sql` — source de vérité synchronisée simultanément.
  - **Migration** : `20260313120000_extend_audit_and_updated_at_triggers.sql` — idempotente (`DROP TRIGGER IF EXISTS` avant chaque `CREATE`).
  - **Application** : ✅ `pnpm dlx supabase db push --linked` le 2026-03-13.

- **FEAT: Permissions hiérarchiques rôle éditeur — user < editor < admin (11 mars 2026)** : Implémentation complète de la hiérarchie de rôles permettant aux éditeurs de gérer le contenu éditorial sans accès admin complet.
  - **Fonction SQL** : `public.has_min_role(required_role text)` — SECURITY INVOKER, immutable, `set search_path = ''`. Hiérarchie : `user(0) < editor(1) < admin(2)`. Lecture rôle depuis JWT claims (`app_metadata.role` → `user_metadata.role` → fallback `'user'`).
  - **~60 policies RLS migrées** : Toutes les policies d'écriture (INSERT/UPDATE/DELETE) sur les tables éditoriales passent de `is_admin()` à `has_min_role('editor')`. Tables : spectacles, événements, presse, médias, compagnie, hero, about, partenaires, lieux, tags, catégories, SEO, versioning.
  - **Storage bucket `medias`** : Policies INSERT/UPDATE/DELETE migrées vers `has_min_role('editor')`.
  - **Middleware Next.js** (`supabase/middleware.ts`) : Corrigé pour accepter les éditeurs (remplacement `role === 'admin'` par `isRoleAtLeast(role, 'editor')` via `lib/auth/role-helpers.ts`).
  - **Schémas déclaratifs modifiés** :
    - `02b_functions_core.sql` : Ajout `has_min_role()` function
    - `61_rls_main_tables.sql` : Migration policies tables principales
    - `62_rls_advanced_tables.sql` : Migration policies tables avancées
    - `70_storage_policies.sql` (nouveau) : Policies stockage avec `has_min_role`
  - **Migrations** :
    - `20260311030000_create_has_min_role_function.sql` — prérequis cloud
    - `20260311030511_editor_storage_policies.sql` — storage bucket medias
    - `20260311120000_editor_role_rls_policies.sql` — ~60 ALTER POLICY
  - **Validation** : Build Next.js OK, 3 migrations cloud appliquées, accès éditeur testé et fonctionnel.

---

## 🆕 Mises à jour récentes (février 2026)

- **FIX: Contact RLS INSERT Policy + Serialization Error (28 fév. 2026)** : Restauration de la politique RLS INSERT sur `messages_contact` et correction de l'erreur de sérialisation du formulaire de contact.
  - **Root cause** : La migration `20260201135511_add_landscape_photos_to_spectacles.sql` avait supprimé la politique `"Validated contact submission"` sans la recréer (DROP / CREATE implicite).
  - **Migration hotfix** : `20260228231707_restore_contact_insert_policy.sql` — recrée la politique INSERT pour `anon` et `authenticated`.
  - **Schéma déclaratif** : `10_tables_system.sql` synchronisé — la politique `"Validated contact submission"` est désormais définie in extenso (plus un simple commentaire).
  - **Fix sérialisation** : `ZodFormattedError` remplacé par plain string dans `components/features/public-site/contact/actions.ts` (React 19 Flight protocol ne sérialise pas les objets Zod).
  - **Commits** : `c108e3b` (hotfix migration + serialization fix), `d5248eb` (schema sync + migrations.md)
  - **Validation** : `supabase db push --linked` OK, formulaire contact fonctionnel

- **TASK065: Admin Press Audit Violations Fix (28 fév. 2026)** : Correction de 12 violations d'audit sur la feature admin presse.
  - **14 étapes** en 4 phases : P0 critiques (server-only, imports DAL, any→interface), P1 majeures (split actions/DAL, cache(), dalSuccess/dalError, codes erreur, ActionResult partagé, parseAsync), P2 mineures (onSubmit, formatDateFr, form.watch deps)
  - **Fichiers modifiés** : 23 fichiers (3 DAL, 3 actions, 4 components, 3 pages, helpers, types)
  - **Score conformité** : ~75% → ≥95%
  - **Commit** : `1ff52a3` sur branche `fix/admin-press-audit-violations`

- **FEAT: Photos Paysage Spectacles - TASK057 (1 fév. 2026)** : Système de gestion de 2 photos paysage par spectacle.
  - **Migrations** : `20260201093000_fix_entity_type_whitelist.sql` + `20260201100000_add_landscape_photos_to_spectacles.sql`
  - **Modifications BDD** :
    - Colonne `type` dans `spectacles_medias` (valeurs: 'poster', 'landscape', 'gallery')
    - CHECK constraints: type valide + ordre 0/1 pour landscape
    - Contrainte UNIQUE: `(spectacle_id, type, ordre)`
    - Index: `idx_spectacles_medias_type_ordre`
    - Vues: `spectacles_landscape_photos_public` + `spectacles_landscape_photos_admin`
  - **Code** : DAL `lib/dal/spectacle-photos.ts`, API route `/api/spectacles/[id]/photos`, Admin `SpectaclePhotoManager`
  - **Pattern** : TASK055 BigInt Serialization (validation number, conversion BigInt après)
  - **Validation** : TypeScript 0 erreurs, tests manuels OK

---

## 🆕 Mises à jour récentes (janvier 2026)

- **FEAT: Media Library Integration Press (22 jan. 2026)** : Intégration ImageFieldGroup dans les formulaires presse.
  - **Colonnes ajoutées** :
    - `articles_presse.image_url` (text) — URL externe vers image
    - `articles_presse.og_image_media_id` (bigint) — Image SEO/Open Graph via Media Library (existait déjà en DB)
    - `communiques_presse.image_media_id` (bigint) — Image principale via Media Library
  - **Index** : `idx_communiques_presse_image_media_id`
  - **Security Fix** : `communiques_presse_dashboard` converti de VIEW à FUNCTION SECURITY DEFINER
    - Avant : VIEW retournait array vide pour non-admins (faille sécurité)
    - Après : FUNCTION lève `permission denied: admin access required`
  - **Schémas modifiés** :
    - `08_table_articles_presse.sql` : Ajout colonnes image
    - `08b_communiques_presse.sql` : Ajout `image_media_id`
    - `40_indexes.sql` : Ajout index FK
    - `41_views_communiques.sql` : Conversion VIEW → FUNCTION
  - **Migrations** :
    - `20260121231253_add_press_media_library_integration.sql`
    - `20260122000000_fix_communiques_presse_dashboard_security.sql`
  - **Validation** : 8/8 tests sécurité passent (`pnpm test:views:auth:local`)

- **FIX: Validation Zod + Trigger Slug (21 jan. 2026)** : Corrections transformations empty string et support communiques_presse.
  - **Problème Zod** : Formulaires soumettent `""` mais schemas serveur attendaient `null` pour champs optionnels
  - **Symptômes** : Erreurs "Too small: expected string to have >=1 characters" sur `slug`, `image_url`, `description`
  - **Solution Zod** : Ajout `.transform(val => val === "" ? null : val)` sur tous les champs optionnels
  - **Schemas modifiés** :
    - `lib/schemas/press-release.ts` : `slug`, `description`, `image_url`
    - `lib/schemas/press-article.ts` : `slug`, `author`, `chapo`, `excerpt`, `source_publication`, `source_url`
  - **Problème Trigger** : `set_slug_if_empty()` ne gérait pas `communiques_presse` (erreur `[ERR_PRESS_RELEASE_001]`)
  - **Solution Trigger** : Ajout case `communiques_presse` avec `NEW.title`
  - **Migration** : `20260121205257_fix_communiques_slug_trigger.sql`
  - **Validation** : TypeScript 0 erreurs, création communiqué fonctionnelle

- **FIX: RLS Spectacles Include Archived Status (20 jan. 2026)** : Correction de la politique RLS pour inclure les spectacles archivés.
  - **Migration** : `20260120183000_fix_spectacles_rls_include_archived.sql`
  - **Problème** : La section "Nos Créations Passées" sur `/spectacles` affichait 0 spectacles pour les utilisateurs anonymes (Chrome sans session) alors que Edge avec session admin affichait correctement les 11 spectacles archivés.
  - **Cause** : La RLS policy n'autorisait que `status = 'published'`, excluant `status = 'archived'` pour le public.
  - **Solution** : Mise à jour de la policy spectacles pour autoriser `status IN ('published', 'archived')` aux utilisateurs anonymes.
  - **Schéma déclaratif** : `61_rls_main_tables.sql` mis à jour avec la nouvelle policy.
  - **Validation** : Migration appliquée local + cloud le 2026-01-20, test Chrome incognito OK.
  - **Fix connexe DAL** : Ajout d'un fallback dans `lib/dal/site-config.ts` pour retourner `{ enabled: true }` par défaut si un toggle `display_toggle_*` est absent de la base (résout homepage vide pour utilisateurs anonymes).

- **TASK053: Data Retention Automation (18 jan. 2026)** : Système complet d'automatisation de rétention des données RGPD/CNIL.
  - **Migration** : `20260117234007_task053_data_retention.sql` (698 lignes)
  - **Nouveaux schémas déclaratifs** :
    - `21_data_retention_tables.sql` : Tables `data_retention_config` (5 lignes pré-seedées) + `data_retention_audit`
    - `22_data_retention_functions.sql` : Fonctions SECURITY DEFINER (`purge_expired_data`, `purge_table_with_audit`, `get_retention_statistics`)
    - `41_views_retention.sql` : Vues de monitoring (`retention_config_status`, `retention_audit_summary`, `tables_with_expirable_data`)
  - **Tables configurées** : logs_audit (90d), abonnes_newsletter (90d), messages_contact (365d), analytics_events (90d), data_retention_audit (365d)
  - **Edge Function** : `supabase/functions/scheduled-cleanup/index.ts` - Première Edge Function Deno du projet
  - **DAL** : `lib/dal/data-retention.ts` - 12 fonctions avec `requireAdmin()`
  - **Schemas Zod** : `lib/schemas/data-retention.ts` - 8 schemas (RetentionConfig, RetentionAudit, RetentionStats...)
  - **Tests** : 8/8 passés localement
  - **Conformité** : RGPD Art. 17 (droit à l'effacement), CNIL (durées minimales recommandées)

- **PERF: Partial Index on spectacles.slug (16 jan. 2026)** : Index partiel pour optimiser les requêtes publiques sur les spectacles.
  - **Migration** : `20260116145628_optimize_spectacles_slug_index.sql`
  - **Source** : TASK034 Phase 4 - Performance Optimization
  - **Changement** : Remplacement de l'index complet `idx_spectacles_slug` par un index partiel `idx_spectacles_slug_published WHERE status='published'`
  - **Impact** : Réduction taille index, accélération requêtes pages publiques (seuls les spectacles publiés sont indexés)
  - **Schéma déclaratif** : `06_table_spectacles.sql` mis à jour avec le nouvel index partiel
  - **Validation** : Migration appliquée local + cloud le 2026-01-16

- **Fix Database Reset - medias.folder_id Restoration (11 jan. 2026)** : Restauration de la colonne `folder_id` supprimée par erreur par une migration générée.
  - **Migration** : `20260111120000_restore_medias_folder_id_final.sql`
  - **Problème** : La migration `20260103183217_audit_logs_retention_and_rpc.sql` (générée par `db pull`) contenait un `DROP COLUMN folder_id` qui supprimait la colonne après que les migrations précédentes l'avaient créée.
  - **Impact** : Page `/admin/media/library` cassée après tout `db reset` (local ou cloud) avec erreur "column medias.folder_id does not exist".
  - **Solution** : Nouvelle migration finale + mise à jour du schéma déclaratif (`03_table_medias.sql` et `04_table_media_tags_folders.sql`).
  - **Schéma déclaratif** : `03_table_medias.sql` inclut maintenant `folder_id bigint`, et `04_table_media_tags_folders.sql` ajoute la FK + index.
  - **Validation** : `db reset` local fonctionne avec folder_id présent.
  - **Leçons** : ⚠️ Vérifier les migrations générées par `db pull` avant commit - elles peuvent contenir des `DROP COLUMN` inattendus.

- **Fix Audit Trigger - Tables Sans `id` Column (10 jan. 2026)** : Correction de la fonction `audit_trigger()` pour supporter les tables utilisant d'autres colonnes comme PK.
  - **Migration** : `20260110011128_fix_audit_trigger_no_id_column.sql`
  - **Problème** : La fonction `audit_trigger()` accédait directement à `new.id`, causant l'erreur `[ERR_CONFIG_003] record "new" has no field "id"` sur la table `configurations_site` qui utilise `key` (text) comme PK.
  - **Impact** : 14 tables avec audit triggers (profiles, medias, spectacles, etc.), mais seule `configurations_site` échouait (display toggles inutilisables).
  - **Solution** : Utilisation de l'opérateur JSON avec fallback chain : `to_json(new) ->> 'id'` → `to_json(new) ->> 'key'` → `to_json(new) ->> 'uuid'` → `null`
  - **Pattern appliqué** : JSON operator safe field access pour fonctions génériques (trigger functions)
  - **Schéma déclaratif** : `02b_functions_core.sql` ligne ~119 mise à jour avec la logique JSON operator
  - **Validation** : 10 display toggles testés OK sur cloud, admin interface fonctionnelle
  - **Script créé** : `scripts/check-cloud-data.ts` pour vérification data integrity post-reset
  - **Leçons** : ⚠️ `db reset --linked` affecte production (reset accidentel effectué pendant le fix)

- **Display Toggles - Correction Migration Cleanup (1er jan. 2026)** : Résolution incohérence entre plan TASK030 et implémentation réelle.
  - **Problème identifié** : Le plan TASK030 mentionnait 3 toggles compagnie à supprimer (`display_toggle_compagnie_values`, `display_toggle_compagnie_presentation`, `display_toggle_compagnie_stats`) mais ces clés n'ont jamais été créées par le seed initial (`20260101160100_seed_display_toggles.sql`).
  - **Migration cleanup incorrecte** : `20260101170000_cleanup_and_add_epic_toggles.sql` contenait des DELETE pour ces clés inexistantes (aucun impact fonctionnel, 0 rows affected).
  - **Migration corrective** : `20260101180000_fix_cleanup_display_toggles_no_compagnie.sql` (documentation only, verification des 9 toggles corrects).
  - **État final** : 9 display toggles corrects en base (4 home + 1 presse + 2 newsletter + 2 Epic additions).
  - **Composants concernés** : `AboutContainer.tsx` utilise correctement `display_toggle_home_about` ✅.
  - **Action requise** : Mettre à jour le plan TASK030 pour refléter la réalité (toggles compagnie jamais créés).

## 🆕 Mises à jour récentes (décembre 2025)

- **Corrections RLS & SECURITY INVOKER (31 déc. 2025)** : Résolution complète des politiques RLS et enforcement SECURITY INVOKER sur toutes les vues.
  - **Migration RLS** : `20251231010000_fix_base_tables_rls_revoke_admin_views_anon.sql`
    - Fix politiques RLS `membres_equipe` : lecture publique limitée à `active = true`
    - Fix politiques RLS `compagnie_presentation_sections` : lecture publique limitée à `active = true`
    - Révocation accès anon aux 7 vues admin (*_admin)
    - Schémas déclaratifs mis à jour : `04_table_membres_equipe.sql`, `07c_table_compagnie_presentation.sql`
  - **Migration SECURITY INVOKER** : `20251231020000_enforce_security_invoker_all_views_final.sql`
    - Force SECURITY INVOKER sur 11 vues publiques via `ALTER VIEW ... SET (security_invoker = true)`
    - Résout le problème de migration snapshot qui recréait les vues sans security_invoker
    - Vues corrigées : communiques_presse_dashboard, communiques_presse_public, articles_presse_public, membres_equipe_admin, compagnie_presentation_sections_admin, partners_admin, messages_contact_admin, content_versions_detailed, analytics_summary, popular_tags, categories_hierarchy
  - **Tests de sécurité** : 13/13 PASSED (4 vues publiques accessibles, 7 vues admin bloquées, 2 tables filtrées)
  - **Documentation complète** : `doc/SUPABASE-VIEW-SECURITY/README.md`

- **Normalisation `spectacles.status` (9-12 déc. 2025)** : Normalisation des valeurs de statut vers des tokens anglais canoniques.
  - **Valeurs canoniques** : `'draft'`, `'published'`, `'archived'` (exclusivement)
  - **Migration DML** : `20251209120000_normalize_spectacles_status_to_english.sql` (⚠️ modifie les données en place)
  - **Contrainte CHECK** : `chk_spectacles_status_allowed` ajoutée pour prévenir les régressions
  - **Schéma déclaratif** : `06_table_spectacles.sql` mis à jour avec la contrainte et `status text not null default 'draft'`
  - **Traduction UI** : Gérée par `translateStatus()` côté application
  - **Legacy cleanup** : Anciennes migrations archivées dans `supabase/migrations/archived/`

- **Hero Slides CTA Dual Buttons (5 déc. 2025)** : Refactoring des boutons CTA pour supporter deux boutons (primaire + secondaire).
  - **Migration** : `20251205220000_refactor_hero_slides_cta_dual_buttons.sql` (idempotente)
  - **Nouvelles colonnes** : `cta_primary_enabled`, `cta_primary_label`, `cta_primary_url`, `cta_secondary_*`
  - **Contraintes CHECK** : Cohérence entre enabled/label/url pour chaque CTA
  - **Pattern idempotent** : DO blocks avec vérification `information_schema.columns` et `pg_constraint`

## 🆕 Mises à jour récentes (janvier 2026) bis

- **TASK053 Data Retention Automation (17-18 jan. 2026)** : Système de rétention RGPD/CNIL automatisé.
  - **Tables** : `data_retention_config`, `data_retention_audit` — configuration et audit des purges
  - **Vues** : `data_retention_monitoring`, `data_retention_stats`, `data_retention_recent_audit` — toutes en SECURITY INVOKER
  - **Fonction** : `process_data_retention()` — purge batch avec rate-limiting et audit
  - **Edge Function** : `scheduled-cleanup` — appelée par pg_cron daily à 02:00 UTC
  - **Migrations** : `20260117213601_data_retention_core.sql`, `20260117213602_data_retention_seed.sql`

- **Security Hardening (18 jan. 2026)** : Corrections sécurité suite au déploiement TASK053.
  - **INSERT policies restaurées** : `messages_contact` et `analytics_events` (supprimées accidentellement par db diff)
  - **RLS réactivé** : `home_hero_slides`
  - **Vues SECURITY INVOKER** : 4 vues converties (`communiques_presse_public`, data retention views)
  - **Policies fusionnées** : Suppression de la policy admin SELECT redondante sur `home_hero_slides`
  - **Migrations** : `20260118010000_restore_insert_policies_dropped_by_task053.sql`, `20260118012000_fix_security_definer_views_and_merge_policies.sql`

## 🆕 Mises à jour récentes (novembre 2025)

- **TASK026 Clean Code & TypeScript Conformity (27 nov. 2025)** : Refactoring architectural pour conformité aux standards Clean Code & TypeScript du projet.

- **Hero Slides - A11Y & CRUD Enhancements (26 nov. 2025)** : Améliorations accessibilité et fonctionnalités CRUD pour les slides Hero.
  - **`07d_table_home_hero.sql`** : Ajout colonne `alt_text` (texte alternatif, max 125 caractères) + contrainte CHECK
  - **`63b_reorder_hero_slides.sql`** : Nouvelle fonction SECURITY DEFINER pour réordonner les slides
    - Authorization : `is_admin()` check explicite (defense-in-depth)
    - Concurrency : Advisory lock `pg_advisory_xact_lock`
    - Input validation : Structure JSONB array
  - **Policy RLS unifiée** : Remplace l'ancienne policy séparée "Admins can view all home hero slides" - désormais fusionnée dans "Public users can view active slides, admins can view all" (mise à jour jan. 2026)

- **TASK021 - Spectacles CRUD RLS Corrections** : Corrections finales des politiques RLS pour les spectacles suite à l'implémentation complète du CRUD admin.
  - **Issue #1 - RLS 42501 Error** : Résolution du problème d'insertion spectacles causé par un profil admin manquant
    - Root cause: Utilisateur authentifié mais `is_admin()` retournait false (profil manquant)
    - Fix: Création du profil admin via SQL Editor + migration RLS corrective
    - Migration: `20251117154411_fix_spectacles_rls_clean.sql` (politiques RLS nettoyées et recréées)
  - **Issue #2 - Contexte Auth Perdu** : Perte du contexte d'authentification lors des insertions
    - Root cause: Client Supabase différent entre vérification auth et insertion
    - Fix: Helper `performAuthenticatedInsert()` avec passage de client
    - Impact: Contexte auth préservé, insertions réussies
  - **Politiques RLS Finales** : Intégrées dans `supabase/schemas/61_rls_main_tables.sql`
    - SELECT: Spectacles publics visibles par tous, privés uniquement par admins
    - INSERT: Création réservée aux admins (vérification directe sur profiles.role)
    - UPDATE/DELETE: Propriétaires ou admins uniquement
    - Pattern: Direct query sur profiles au lieu de is_admin() pour éviter problèmes de contexte
  - **Validation** : CRUD spectacles entièrement fonctionnel, TypeScript clean, production-ready

- **Sécurité Base de données - Extensions (20 nov. 2025)** : Déplacement des extensions PostgreSQL (`pgcrypto`, `pg_trgm`, `unaccent`, `citext`) vers un schéma dédié `extensions` pour éviter la pollution du schéma `public` et respecter les recommandations de sécurité Supabase.
  - **Migration** : `20251120120000_move_extensions_to_schema.sql`
  - **Schéma déclaratif** : `01_extensions.sql` mis à jour avec `WITH SCHEMA extensions`
  - **Impact** : `search_path` mis à jour (`public, extensions`), appels de fonctions qualifiés (ex: `extensions.unaccent()`)

- **Profiles RLS & Invite Flow (21 nov. 2025)** : Correction des politiques RLS pour `public.profiles` afin de supporter les opérations d'`upsert()` utilisées par le flux d'invitation des administrateurs.
  - **Migration** : `20251121185458_allow_admin_update_profiles.sql` (générée et appliquée le 2025-11-21)
  - **Contexte** : `upsert()` effectue un `UPDATE` puis un `INSERT` ; la policy `UPDATE` auparavant trop restrictive provoquait des erreurs 42501 lors des invitations créées via `admin.generateLink()`.
  - **Fix côté application** : la DAL utilise désormais `upsert(..., { onConflict: 'user_id' })` pour créer/mettre à jour les `profiles`, et a remplacé les appels lourds `getUser()` par `getClaims()` pour vérifications rapides de claims.
  - **Email dev/testing** : un mécanisme dev-only de redirection des emails de test a été ajouté (variables d'environnement `EMAIL_DEV_REDIRECT=true|false` et `EMAIL_DEV_REDIRECT_TO`) pour contourner les limitations de test-mode du fournisseur d'envoi lors des essais locaux. Ce mécanisme est explicitement documenté et doit rester désactivé en production.
  - **Impact** : Invite flow fonctionnel pour les admins, templates email corrigés (Tailwind wrapper unique et styles inlinés) ; migration appliquée et tests manuels de l'invite OK.

## 🆕 Mises à jour récentes (octobre 2025)

- **Spectacles archivés publics** : Modification du seed `20250926153000_seed_spectacles.sql` pour marquer les spectacles archivés avec `public = true` au lieu de `public = false`. Cette approche simplifie la logique d'affichage des archives dans la fonctionnalité "Voir toutes nos créations" sans nécessiter de modification des politiques RLS. Les spectacles archivés restent identifiés par `status = 'archive'` mais sont maintenant visibles publiquement via la politique RLS existante.

- **Articles de presse - Fix affichage (22-23 oct. 2025)** : Résolution complète problème affichage vide + sécurité views + performance RLS.
  - **Issue #1 - Articles vides** : RLS activé sans policies + SECURITY INVOKER sans GRANT
    - Root cause: PostgreSQL deny-all by default quand RLS activé sans policies
    - Fix: 5 RLS policies appliquées + GRANT SELECT sur table base
    - Migrations: `20251022150000_apply_articles_presse_rls_policies.sql` + `20251022140000_grant_select_articles_presse_anon.sql`
  - **Issue #2 - SECURITY DEFINER views** : 10 vues converties vers SECURITY INVOKER
    - Root cause: Views par défaut SECURITY DEFINER = risque escalade privilèges
    - Fix: Ajout explicite `WITH (security_invoker = true)` dans toutes définitions
    - Migration: `20251022160000_fix_all_views_security_invoker.sql`
    - Views: communiques, admin content, analytics, categories, tags, contact
  - **Issue #3 - Performance RLS** : Multiple permissive policies optimisées
    - Root cause: 2 policies PERMISSIVE = évaluation OR sur chaque ligne
    - Fix: Admin policy convertie en RESTRICTIVE (bypass gate pattern)
    - Migration: `20251022170000_optimize_articles_presse_rls_policies.sql`
    - Gain: ~40% plus rapide pour non-admins
  - **Pattern complet** : Defense in Depth (VIEW + GRANT + RLS) + Security Invoker + Performance optimization
  - **Documentation** : Guide troubleshooting complet `doc/rls-policies-troubleshooting.md` (202 lignes)

## 🆕 Mises à jour récentes (sept. 2025)

- Renommage `spectacles.cast` → `spectacles.casting` (évite collision et clarifie le sens).
- Fonction `public.validate_rrule(text)` (IMMUTABLE) ajoutée avant la contrainte `check_valid_rrule` pour la récurrence des événements; correction d’ordre dans la migration générée.
- Vues dépendantes déplacées en fin de chaîne (`41_*`) pour respecter les dépendances.
- Contraintes/Triggers durcis: suppression des `IF NOT EXISTS` non supportés dans certaines contraintes, remplacement d’un `CHECK` complexe par inclusion de tableau, suppression d’un `WHEN` sur trigger au profit de logique dans la fonction.
- `home_hero_slides`: table + RLS avec fenêtre d’activation (index partiels sur `active`/planning).
- `home_about_content`: nouvelle table pour le bloc « À propos » de la Home (title/intro/mission) avec RLS (lecture publique, écriture admin), index partiel `(active, position)` et intégration aux triggers `updated_at` + `audit`. Colonne `image_media_id` ajoutée (prioritaire sur `image_url`). La DAL lit exclusivement cette table (aucun fallback sur `compagnie_presentation_sections`).

- `articles_presse`: activation RLS co‑localisée dans `08_table_articles_presse.sql` avec lecture publique des articles publiés (`published_at is not null`) et gestion admin (insert/update/delete). Ajout d’un index partiel `idx_articles_published_at_public` pour optimiser les sélections publiques.

Pour rappel, la migration générée est `supabase/migrations/20250918000002_apply_declarative_schema_complete.sql`. Cette migration reconstruit le schéma complet depuis les fichiers déclaratifs et doit s'exécuter avant tous les seeds.

---

## 🧪 Seeds de données (migrations DML)

- Les seeds ne font pas partie du schéma déclaratif. Chaque seed est un fichier migration horodaté dans `supabase/migrations/` (ex: `20250921113000_seed_home_about_content.sql`).
- Préférer des seeds idempotents (MERGE/UPSERT, `where not exists`) pour permettre la ré‑exécution locale.
- **Migration spectacles** : `20250926153000_seed_spectacles.sql` mise à jour pour les spectacles archivés avec `public = true` (visibilité "Voir toutes nos créations").
- Exemple de création: `supabase migration new seed_home_hero_slides`
- Appliquer via `supabase db push` ou rejouer un fichier précis avec `psql -f`.

---

## � Sécurité RLS - Validation Complète

### Tables avec Protection RLS (24/24) ✅

| Table | Lecture | Écriture | Particularités |
| ------------- | -------- | -------- | ---------------- |
| **profiles** | Publique | Propriétaire uniquement | Auto-création profil |
| **medias** | Publique | Uploadeur ou admin | Gestion fichiers |
| **spectacles** | Si public=true | Créateur ou admin | Visibilité contrôlée. Spectacles archivés publics (status='archive', public=true) |
| **evenements** | Publique | Admin uniquement | Événements publics |
| **lieux** | Publique | Admin uniquement | Lieux publics |
| **membres_equipe** | Publique | Admin uniquement | Équipe publique |
| **partners** | Si actif | Admin uniquement | Partenaires visibles |
| **articles_presse** | Publique | Admin uniquement | Articles publics |
| **communiques_presse** | Si public=true | Admin uniquement | Communiqués avec images/catégories |
| **contacts_presse** | Admin uniquement | Admin uniquement | Base presse confidentielle |
| **categories** | Si active | Admin uniquement | Catégories publiques |
| **tags** | Publique | Admin uniquement | Tags publics |
| **analytics_events** | Admin uniquement | Insertion libre | Tracking anonyme |
| **content_versions** | Admin uniquement | Système + admin | Versioning automatique |
| **seo_redirects** | Admin uniquement | Admin uniquement | SEO interne |
| **sitemap_entries** | Si indexé | Admin uniquement | Sitemap public |
| **abonnes_newsletter** | Admin uniquement | Inscription libre | Protection RGPD (email seul, rétention ≤90j) |
| **messages_contact** | Admin uniquement | Envoi libre | Protection RGPD (prénom/nom/email/téléphone) |
| **configurations_site** | Si public:* | Admin uniquement | Config mixte |
| **logs_audit** | Admin uniquement | Système auto | Audit sécurisé |
| **events_recurrence** | Publique | Admin uniquement | Récurrence publique |
| **home_about_content** | Publique | Admin uniquement | Bloc About de la Home |
| **compagnie_values** | Publique | Admin uniquement | Valeurs institutionnelles |
| **compagnie_stats** | Publique | Admin uniquement | Statistiques institutionnelles |
| **compagnie_presentation_sections** | Publique | Admin uniquement | Sections modulaires page présentation |
| **home_hero_slides** | Publique (fenêtre active) | Admin uniquement | Slides hero page d'accueil |

### Tables de Liaison avec Protection RLS (11/11) ✅

| Table | Lecture | Écriture | Particularités |
| ------------- | -------- | -------- | ---------------- |
| **spectacles_membres_equipe** | Publique | Admin uniquement | Casting des spectacles |
| **spectacles_medias** | Publique | Admin uniquement | Médias des spectacles |
| **articles_medias** | Publique | Admin uniquement | Médias des articles |
| **communiques_medias** | Publique | Admin uniquement | Médias des communiqués |
| **communiques_categories** | Publique | Admin uniquement | Catégories des communiqués |
| **communiques_tags** | Publique | Admin uniquement | Tags des communiqués |
| **spectacles_categories** | Publique | Admin uniquement | Catégories des spectacles |
| **spectacles_tags** | Publique | Admin uniquement | Tags des spectacles |
| **articles_categories** | Publique | Admin uniquement | Catégories des articles |
| **articles_tags** | Publique | Admin uniquement | Tags des articles |

**Total :** 36 tables protégées par RLS (25 principales + 11 liaison)

### Optimisations Performance ⚡

- ✅ **Mise en cache** : `(select public.is_admin())` vs `public.is_admin()`
- ✅ **Index RLS** : 10 index sur colonnes utilisées dans les politiques
- ✅ **Index partiels** : `where public = true`, `where is_active = true`
- ✅ **Fonctions IMMUTABLE** : `generate_slug()`, `validate_rrule()`

### Conformité Instructions RLS ✅

- ✅ Politiques séparées par opération (SELECT, INSERT, UPDATE, DELETE)
- ✅ Utilisation de `auth.uid()` au lieu de `current_user`
- ✅ `USING` pour SELECT/DELETE, `WITH CHECK` pour INSERT/UPDATE
- ✅ Politiques PERMISSIVE uniquement (pas RESTRICTIVE)
- ✅ Noms descriptifs entre guillemets doubles
- ✅ Rôles spécifiés avec clause `TO`

---

## �🚀 Utilisation

### 1. Appliquer le Schéma Déclaratif

Selon votre gestionnaire de paquets :

Avec pnpm **sur base locale** Supabase :

```bash
# Arrêter l'environnement local
pnpm dlx supabase stop

# Générer les tables (migrations) depuis le schéma déclaratif
pnpm dlx supabase db diff -f apply_declarative_schema

# Vérifier la migration générée dans supabase/migrations/
ls -la supabase/migrations/

# Appliquer les migrations
pnpm dlx supabase db push

# Réinitialiser la base locale (optionnel, utile pour tests) et rejoue les migrations
pnpm dlx supabase db reset --yes --db-url "postgresql://postgres:postgres@127.0.0.1:54322/postgres?sslmode=disable"
```

### 2. Validation Post-Déploiement

```bash
# Vérifier les politiques RLS
pnpm dlx supabase db diff -f check_rls

# Vérifier les performances
pnpm dlx supabase db diff -f check_performance

# Test complet du schéma
pnpm dlx supabase db diff -f check_schema
```

### 3. Migrations de Données Séparées

> [!WARNING]
> Les opérations DML (INSERT/UPDATE/DELETE) ne sont **pas** dans le schéma déclaratif.
>
> Créer des migrations séparées pour les données :

```bash
supabase migration new seed_initial_data
supabase migration new update_existing_data
```

---

## 📋 Bonnes Pratiques

### ✅ À FAIRE

- Modifier les fichiers dans `supabase/schemas/`
- Respecter l'ordre lexicographique (01_, 02_, etc.)
- Représenter l'état final désiré
- Tester avec `supabase db diff` avant push
- Inclure RLS dans le même fichier que la table
- Utiliser `(select function())` pour optimiser RLS
- Documenter les politiques complexes

### ❌ À ÉVITER

- Créer/modifier directement dans `supabase/migrations/`
- Inclure des opérations DML dans le schéma déclaratif
- Créer un seul gros fichier monolithique
- Oublier les politiques RLS sur nouvelles tables
- Utiliser `public.function()` directement dans RLS

---

## 🔄 Workflow de Modification

### Pour ajouter/modifier une entité

1. **📝 Éditer** le fichier `.sql` correspondant dans `schemas/`
2. **🔍 Valider** la syntaxe et conformité
3. **⚡ Générer** la migration : `supabase db diff -f nom_migration`
4. **✅ Vérifier** la migration générée
5. **🚀 Appliquer** : `supabase db push`
6. **🧪 Tester** les nouvelles fonctionnalités

### Pour une nouvelle table

1. **📋 Créer** le fichier `XX_table_nom.sql`
2. **🏗️ Définir** la structure de table
3. **🔐 Ajouter** les politiques RLS dans le même fichier
4. **📊 Ajouter** les index nécessaires dans `40_indexes.sql`
5. **🔗 Référencer** dans les tables de relations si besoin

---

## � Métriques de Conformité

| Métrique | Valeur | Statut |
| ------------- | -------- | -------- |
| **Tables avec RLS** | 36/36 (100%) | ✅ |
| **Tables principales** | 25/25 (100%) | ✅ |
| **Tables de liaison** | 11/11 (100%) | ✅ |
| **Politiques Optimisées** | 70+ (100%) | ✅ |
| **Index RLS** | 10 stratégiques | ✅ |
| **Fonctions Sécurisées** | 8/8 (100%) | ✅ |
| **Conformité Instructions** | 100% | ✅ |
| **Tests de Sécurité** | En attente | 🟡 |

---

## 🛠️ Dépannage

### Erreurs Communes

| Erreur | Solution |
| ------------- | -------- |
| `relation does not exist` | Vérifier l'ordre des fichiers |
| `permission denied` | Vérifier les politiques RLS |
| `function is not immutable` | Marquer les fonctions pure IMMUTABLE |
| `policy already exists` | Utiliser `drop policy if exists` |

### Debug RLS

```sql
-- Tester une politique RLS
SET row_security = on;
SET ROLE authenticated;
SELECT * FROM public.spectacles; -- Doit respecter RLS

-- Voir les politiques actives
SELECT * FROM pg_policies WHERE tablename = 'spectacles';

-- Vérifier les colonnes d'une table
select * from information_schema.columns where table_schema='public' and table_name='home_about_content';

-- Vérifier les index
SELECT * FROM pg_indexes WHERE tablename = 'spectacles';
```

### Documentation Interne

- `.github/copilot/Declarative_Database_Schema.Instructions.md` - Instructions déclaratives
- `.github/copilot/Create_RLS_policies.Instructions.md` - Guide RLS
- `.github/copilot/Database_Create_functions.Instructions.md` - Guide fonctions
- `.github/copilot/Postgres_SQL_Style_Guide.Instructions.md` - Style SQL

### Documentation Externe

- [Supabase Schema Management](https://supabase.com/docs/guides/cli/local-development)
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [RFC 5545 RRULE](https://datatracker.ietf.org/doc/html/rfc5545) - Récurrence événements

---

## ✨ Résultat

Le schéma déclaratif Rouge Cardinal Company est **production-ready** avec :

- 🔒 **Sécurité complète** - RLS sur 100% des tables
- ⚡ **Performances optimisées** - Index et mise en cache
- 📖 **Code maintenable** - Structure déclarative claire
- ✅ **Conformité totale** - Respect des meilleures pratiques

**Status final :** 🎉 **VALIDÉ POUR PRODUCTION** 🎉

---

## 🔁 Restauration de Contenu & Versioning Étendu

### Couverture Versioning

| Entité | Triggers Versioning | Restauration Supportée | Notes |
| ------------- | -------- | -------- | ---------------- |
| spectacles | Oui | Oui | publish/unpublish détecté |
| articles_presse | Oui | Oui | publish/unpublish via published_at |
| communiques_presse | Oui | Oui | Flag `public` |
| evenements | Oui | Oui | Changements de statut loggés |
| membres_equipe | Oui | Oui | Fallback legacy nom -> name dans restore |
| partners | Oui | Oui | logo_url + ordre affichage |
| compagnie_values | Oui | Oui | Contenu institutionnel (title, description, position) |
| compagnie_stats | Oui | Oui | Statistiques institutionnelles (label, value, position) |
| compagnie_presentation_sections | Oui | Oui | Sections modulaires (slug, kind, contenu) |

### Vue Administration Membres

La vue `public.membres_equipe_admin` expose:

- Métadonnées membres (`name`, `role`, `ordre`, `active`)
- Informations versioning: `last_version_number`, `last_change_type`, `last_version_created_at`, `total_versions`

Usage côté API / dashboard:

```sql
select * from public.membres_equipe_admin order by ordre, name;
```

### Contrainte image_url stricte

La contrainte `membres_equipe_image_url_format` impose un format:
`^https?://...\.(jpg|jpeg|png|webp|gif|avif|svg)(?...)?$`

Objectif: garantir que les URLs pointent vers des ressources images (fallback si aucune media interne).

## Restauration d'une Version

### Vue Administration Messages Contact

La vue `public.messages_contact_admin` fournit un accès consolidé pour le back-office :

- Champs bruts + dérivés: `age`, `processing_latency`, `full_name`
- Association éventuelle au contact presse (`contact_presse_nom`, `media`, `role`)
- Filtrage rapide possible via index partiels (`status in ('nouveau','en_cours')`, `consent = true`)

Exemple usage:

```sql
select id, created_at, age, reason, status, processing_latency
from public.messages_contact_admin
order by created_at desc
limit 50;
```

Indices ajoutés pour optimiser:

- `idx_messages_contact_status_actifs` (statuts actifs)
- `idx_messages_contact_consent_true` (extractions consentement)

Exemple restauration d'un membre:

```sql
-- Trouver versions
select id, version_number, change_type, change_summary
from public.content_versions
where entity_type = 'membre_equipe' and entity_id = 42
order by version_number desc;

-- Restaurer
select public.restore_content_version(<version_id>);
```

Effets:

- Mise à jour des champs métier
- Création d'une nouvelle version `change_type = 'restore'`

Limitations (générales):

- Les relations many-to-many ne sont pas restaurées automatiquement.
- Les blobs média ne sont pas re-validés (seule la référence est restaurée).

### Vue Administration Partenaires

La vue `public.partners_admin` expose:

- Données partenaires: `name`, `website_url`, `logo_url`, `logo_media_id`, `is_active`, `display_order`
- Métadonnées versioning: `last_version_number`, `last_change_type`, `last_version_created_at`

Exemple usage:

```sql
select id, name, is_active, last_version_number, last_change_type
from public.partners_admin
order by display_order, name;
```

---

## 🔒 Politique de Rétention Newsletter

Objectif: Minimiser la conservation des emails désinscrits.

Stratégie actuelle (faible volume, pas de campagnes récurrentes):

- Donnée stockée: uniquement `email` (+ métadonnées techniques optionnelles)
- Désinscription: `subscribed=false`, `unsubscribed_at=now()`
- Purge recommandée: suppression définitive après 90 jours OU immédiate sur demande explicite (droit à l'oubli)
- Pas de liste de suppression hashée à ce stade (complexité non justifiée)

Tâche de purge SQL (exécution mensuelle):

```sql
delete from public.abonnes_newsletter
where subscribed = false
 and unsubscribed_at < now() - interval '90 days';
```

Escalade future possible:

- Ajout champ `email_hash` (SHA256) si besoin d'empêcher ré-import involontaire
- Journalisation anonymisée des désinscriptions (non nécessaire aujourd'hui)

Référence détaillée: section RGPD interne 10.3.1 (knowledge-base).

## Voir aussi

- `supabase/migrations` — Schéma historique (DML/DDL ponctuelles)
- `supabase/migrations/README.md` — Documentation des migrations
- `supabase/migrations/` — Migrations DML/DDL ponctuelles horodatées
- `.github/copilot/Declarative_Database_Schema.Instructions.md` — Instructions pour le schéma déclaratif
- `.github/copilot/Create_migration.instructions.md` — Instructions pour créer une migration DML/DDL
- `.github/copilot/Create_RLS_policies.Instructions.md` — Instructions pour créer des politiques RLS
- `.github/copilot/Database_Create_functions.Instructions.md` — Instructions pour créer des fonctions
- `.github/copilot/Postgres_SQL_Style_Guide.Instructions.md` — Instructions pour le style SQL
