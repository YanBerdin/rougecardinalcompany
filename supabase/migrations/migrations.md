# Migrations - Rouge Cardinal Company

Ce dossier contient les migrations spécifiques (DML/DDL ponctuelles) exécutées en complément du schéma déclaratif.

## ⚠️ Important : Schéma Déclaratif comme Source de Vérité

> **Le schéma déclaratif (`supabase/schemas/`) est la source de vérité unique pour la structure de la base de données.**
>
> Certaines migrations manuelles ci-dessous (marquées ✅ **Intégré au schéma déclaratif**) sont des correctifs temporaires déjà synchronisés avec le schéma déclaratif. Elles sont conservées pour :
>
> - 📝 L'historique des correctifs
> - 🔄 La cohérence avec l'historique de migration Supabase Cloud
> - 🏗️ La possibilité de reconstruire la base depuis zéro
>
> **Documentation complète** : `doc-perso/declarative-schema-hotfix-workflow.md`

## Migration principale du schéma déclaratif

- `20250918004849_apply_declarative_schema.sql` — Migration générée du schéma déclaratif principal (DDL)

## New generated migration (reorder team members)

- `20251024214802_reorder_team_members.sql` — Migration generated to add the PL/pgSQL function `public.reorder_team_members(jsonb)` and associated metadata. This migration implements a server-side RPC that applies multiple `ordre` updates on `public.membres_equipe` atomically with validation and advisory locking. The declarative function source lives in `supabase/schemas/63_reorder_team_members.sql` and should be synchronized with this migration.

- `20251024231855_restrict_reorder_execute.sql` — HOTFIX: restrict execute on `public.reorder_team_members(jsonb)` by revoking EXECUTE from `public`/`anon` and granting EXECUTE to `authenticated` only. Applied as a manual hotfix to reduce attack surface; declarative schema updated in `supabase/schemas/63_reorder_team_members.sql` to reflect the grant.

## ⚠️ CRITICAL WARNING - Security Campaign Error (October 2025)

> **❌ ERREUR ARCHITECTURALE MAJEURE - NE PAS REPRODUIRE**
>
> La campagne de sécurité RLS (Rounds 1-17, 25-26 octobre 2025) était basée sur une **compréhension erronée du modèle de sécurité PostgreSQL**.
>
> **FAUSSE HYPOTHÈSE** :
>
> - "RLS seul suffit pour le contrôle d'accès"
> - "Les GRANTs au niveau table court-circuitent les politiques RLS"
> - "Révocation de tous les GRANTs = amélioration de la sécurité"
>
> **RÉALITÉ** :
>
> - PostgreSQL requiert **DEUX niveaux** de permissions : GRANT (table-level) + RLS (row-level)
> - **Sans GRANT, RLS n'est JAMAIS évalué** → permission denied avant vérification des policies
> - **GRANT SELECT + RLS policy = Defense in depth** (sécurité multicouche)
>
> **CONSÉQUENCES** :
>
> - **27 octobre 2025 02:00** : Production DOWN - "permission denied for table" sur 33 tables
> - 7 fonctions DAL en échec → homepage et pages publiques inaccessibles
> - 8 heures d'incident critique pour identifier et corriger l'erreur
>
> **RÉSOLUTION** :
>
> - 5 migrations d'urgence pour restaurer les GRANTs (20251027020000 à 20251027022500)
> - 33 tables : GRANT SELECT to anon,authenticated; GRANT INSERT,UPDATE,DELETE to authenticated
> - 11 vues : GRANT SELECT avec distinction public/admin
> - 15 fonctions : GRANT EXECUTE to authenticated pour triggers
>
> **DOCUMENTATION POST-MORTEM** : `doc/INCIDENT_POSTMORTEM_RLS_GRANTS_2025-10-27.md`
>
> **MODÈLE SÉCURITAIRE CORRECT** :
>
> 1. GRANT permissions (table-level) → PostgreSQL vérifie en PREMIER
> 2. RLS policies (row-level) → Filtre ensuite les lignes autorisées
> 3. Les deux sont COMPLÉMENTAIRES, pas alternatifs
>
> **⚠️ Les migrations Rounds 1-17 ci-dessous sont CONSERVÉES pour l'historique mais ne doivent JAMAIS être reproduites.**

## Security audit remediation (October 2025) - ❌ DEPRECATED - DO NOT REPLICATE

> **WARNING**: Ces migrations ont causé un incident de production majeur. Elles sont conservées uniquement pour l'historique.
> Voir la section ci-dessus et le post-mortem pour comprendre l'erreur architecturale.

- `20251025181000_revoke_final_exposed_objects.sql` — **SECURITY : Revoke exposed grants (round 1)** : Révocation des grants à PUBLIC/authenticated sur 5 objets détectés par l'audit CI (content_versions, content_versions_detailed, evenements, home_about_content, information_schema.administrable_role_authorizations). Migration idempotente avec gestion d'erreur via blocs DO.
  - ❌ **ERREUR** : "Table-level grants court-circuitent RLS" → FAUX - GRANTs sont requis AVANT RLS
  - ❌ **Fausse solution** : "RLS exclusivement" → Impossible - PostgreSQL vérifie GRANTs en premier
  - ⚠️ **Impact réel** : 5 objets devenus inaccessibles (production cassée le 27 oct 2025)

- `20251025182000_revoke_new_exposed_objects.sql` — **SECURITY : Revoke exposed grants (round 2)** : Révocation des grants à authenticated sur 4 tables supplémentaires (home_hero_slides, lieux, logs_audit, medias). Migration idempotente avec gestion d'erreur.
  - ❌ **ERREUR** : "Defense in depth - RLS policies only" → FAUX - GRANTs sont obligatoires
  - ❌ **Fausse validation** : "Schéma déclaratif ne contient aucun grant large" → Erreur de conception
  - ⚠️ **Impact réel** : 4 objets devenus inaccessibles (homepage cassée)

- `20251025183000_revoke_membres_messages_views.sql` — **SECURITY : Revoke exposed grants (round 3)** : Révocation des grants à authenticated sur membres_equipe, messages_contact et leurs vues admin associées. Migration idempotente avec gestion d'erreur.
  - ❌ **ERREUR** : "RLS policies + SECURITY INVOKER views = defense in depth" → Incomplet sans GRANTs
  - ⚠️ **Impact réel** : 4 objets inaccessibles (2 tables + 2 vues admin)

- `20251025184000_revoke_final_round_partners_profiles.sql` — **SECURITY : Revoke exposed grants (round 4)** : Révocation des grants à authenticated sur partners, profiles et leurs vues admin/tags. Migration idempotente avec gestion d'erreur.
  - ❌ **ERREUR** : "Tables sécurisées via RLS uniquement" → Impossible - PostgreSQL refuse l'accès sans GRANT
  - ⚠️ **Impact réel** : 4 objets inaccessibles (partners, profiles critiques pour auth)

- `20251025185000_revoke_seo_spectacles_final.sql` — **SECURITY : Revoke exposed grants (round 5)** : Révocation des grants à authenticated sur seo_redirects, sitemap_entries, spectacles et spectacles_categories. Re-tentative révocation information_schema. Migration idempotente avec gestion d'erreur.
  - ❌ **ERREUR** : "Tables SEO et spectacles sécurisées" → Rendues inaccessibles même aux utilisateurs légitimes
  - ⚠️ **Impact réel** : 4 objets inaccessibles (spectacles = table centrale du site)

- `20251025190000_revoke_junction_tables_final.sql` — **SECURITY : Revoke exposed grants (round 6)** : Révocation des grants à authenticated sur spectacles_medias, spectacles_membres_equipe, spectacles_tags et tags. Double tentative révocation information_schema. Migration idempotente.
  - ❌ **ERREUR** : "Junction tables sécurisées via RLS uniquement" → Relations inaccessibles
  - ⚠️ **Impact réel** : 4 objets inaccessibles (relations critiques cassées)

- `20251025191000_revoke_realtime_schema.sql` — **SECURITY : Revoke exposed grants (round 7)** : Révocation des grants anon/authenticated sur realtime.messages, realtime.schema_migrations, realtime.subscription (objets système Supabase Realtime). Tentative finale révocation information_schema. Migration idempotente.
  - ❌ **ERREUR** : "Accès Realtime contrôlé via RLS sur tables utilisateurs" → Logique erronée
  - ⚠️ **Impact réel** : 3 objets système Supabase affectés

- `20251025192000_revoke_realtime_subscription_authenticated.sql` — **SECURITY : Revoke exposed grants (round 7b - 補完)** : Révocation complémentaire du grant authenticated sur realtime.subscription (détecté par CI après Round 7). Migration idempotente.
  - ❌ **ERREUR** : "Completion Round 7" → Continuation d'une stratégie erronée
  - ⚠️ **Final status Round 1-7b** : 28 objets totaux révoqués → 28 objets cassés en production

**Pivot stratégique après Round 7b** : Adoption d'une stratégie whitelist (`audit_grants_filtered.sql`) pour exclure les objets système PostgreSQL/Supabase. **❌ ERREUR** : Le pivot n'a pas questionné la prémisse erronée "RLS-only security model".

### Security Audit - Rounds 8-17 (October 26, 2025) - ❌ DEPRECATED

**Context:** Rounds 8-17 continued the flawed security model. System objects whitelisted but business objects still broken.

- `20251026080000_revoke_articles_presse_functions.sql` — **SECURITY : Round 8** : Révocation grants sur articles_presse/articles_tags + trigger functions versioning/slugification. Idempotent.
  - ❌ **ERREUR** : "Fonctions métier sécurisées" → Fonctions métier devenues inaccessibles
  - ⚠️ **Impact** : 6 objets cassés (2 tables + 4 triggers)

- `20251026090000_revoke_categories_analytics_functions.sql` — **SECURITY : Round 9** : Révocation grants sur categories, categories_hierarchy + analytics functions. Idempotent.
  - ❌ **ERREUR** : "Pipeline analytics sécurisé" → Pipeline analytics cassé
  - ⚠️ **Impact** : 6 objets cassés (1 table + 1 vue + 4 fonctions)

- `20251026100000_revoke_storage_search_functions.sql` — **SECURITY : Round 10** : Découverte storage.buckets + search function. Idempotent.
  - ⚠️ **Impact** : 3 objets Storage whitelistés (bonne décision pour objets système)

- `20251026110000_revoke_storage_analytics_persistent_functions.sql` — **SECURITY : Round 11** : storage.buckets_analytics + pg_trgm functions. Idempotent.
  - ⚠️ **Impact** : Extension pg_trgm patterns ajoutés à whitelist (bonne décision)

- `20251026120000_revoke_storage_objects_business_functions.sql` — **SECURITY : Round 12 - CRITICAL** : storage.objects avec ALL PRIVILEGES! Idempotent.
  - ⚠️ **Vraie vulnérabilité** : storage.objects avec ALL PRIVILEGES était un vrai problème de sécurité
  - ✅ **Fix légitime** : Révocation ALL sur storage.objects (seul Round avec bénéfice réel)
  - ⚠️ **Impact** : 1 vulnérabilité critique corrigée + 4 fonctions cassées

- `20251026130000_revoke_storage_prefixes_versioning_functions.sql` — **SECURITY : Round 13** : storage.prefixes + is_admin(). Idempotent.
  - ❌ **ERREUR** : Révocation EXECUTE sur is_admin() alors que fonction critique pour RLS
  - ⚠️ **Impact** : 5 objets affectés (1 Storage whitelisté + 4 fonctions cassées)

- `20251026140000_revoke_storage_multipart_auth_triggers.sql` — **SECURITY : Round 14** : storage.s3_multipart_uploads + triggers auth. Idempotent.
  - ⚠️ **Impact** : 1 Storage whitelisté + 3 auth triggers cassés

- `20251026150000_revoke_storage_multipart_parts_utility_functions.sql` — **SECURITY : Round 15** : s3_multipart_uploads_parts + utilities. Idempotent.
  - ⚠️ **Impact** : 1 Storage whitelisté + 4 utilities cassées

- `20251026160000_revoke_remaining_versioning_triggers.sql` — **SECURITY : Round 16** : Nettoyage final triggers versioning. Idempotent.
  - ❌ **ERREUR** : Révocation EXECUTE sur triggers de versioning → Système de versioning cassé
  - ⚠️ **Impact** : 6 triggers versioning cassés (spectacles, membres, partners, etc.)

- `20251026170000_revoke_check_communique_has_pdf_function.sql` — **SECURITY : Round 17 - FINAL** : Dernière fonction métier détectée. Idempotent.
  - ❌ **ERREUR** : "CAMPAIGN COMPLETE - Zero exposed objects" → 73 objets cassés en production
  - ⚠️ **Faux succès CI** : CI vérifie absence de GRANTs, pas fonctionnalité de l'application
  - 🚨 **Résultat final** : Production entièrement cassée le 27 octobre 2025 02:00

### ⚠️ Bilan Final Campagne de Sécurité (Rounds 1-17)

**Total:** 73 objets révoqués = 73 objets cassés  
**Vraie vulnérabilité corrigée:** 1 seule (storage.objects ALL PRIVILEGES - Round 12)  
**Faux positifs:** 72 objets (GRANTs légitimes et nécessaires)  
**Tools défaillants:** audit_grants_filtered.sql + check-security-audit.sh (vérifient absence de GRANTs, pas fonctionnalité)  
**Status:** ❌ Production DOWN - Incident critique - 8h de résolution  
**Leçons apprises:** Voir `doc/INCIDENT_POSTMORTEM_RLS_GRANTS_2025-10-27.md`

---

## ✅ Emergency Remediation - GRANT Restoration (October 27, 2025)

**Context:** Production down since Oct 27 02:00. Root cause identified: Missing GRANTs break PostgreSQL security model.

**Resolution Timeline:**

- 02:00 - Production incident reported: "permission denied for table home_hero_slides"
- 02:15 - Root cause identified: PostgreSQL requires GRANT + RLS (not RLS alone)
- 02:20 - Emergency migrations created to restore GRANTs
- 02:30 - Production restored

### Emergency Migrations (Corrective)

- `20251027020000_restore_basic_grants_for_rls.sql` — **EMERGENCY : Restore GRANTs for 7 critical tables**
  - ✅ **Correct model** : GRANT SELECT to anon,authenticated + GRANT INSERT,UPDATE,DELETE to authenticated
  - ✅ **Tables restored** : home_hero_slides, spectacles, partners, communiques_presse, compagnie_stats, configurations_site, home_about_content, profiles, membres_equipe
  - ✅ **Impact** : Homepage functionality restored
  - 📊 **Total** : 9 tables (7 critical + profiles + membres_equipe)

- `20251027021000_restore_remaining_grants.sql` — **EMERGENCY : Restore GRANTs for 26 remaining tables**
  - ✅ **Categories** : Content tables, compagnie tables, liaison tables (11), system tables
  - ✅ **Sequences** : GRANT USAGE ON ALL SEQUENCES IN SCHEMA public
  - ✅ **Impact** : All business functionality restored
  - 📊 **Total** : 26 tables + sequences

- `20251027021500_restore_views_grants.sql` — **EMERGENCY : Restore GRANTs for 11 views**
  - ✅ **Public views** : GRANT SELECT to anon,authenticated (articles_presse_public, communiques_presse_public, categories_hierarchy, popular_tags)
  - ✅ **Admin views** : GRANT SELECT to authenticated (dashboard, admin views)
  - ✅ **Impact** : All views accessible again
  - 📊 **Total** : 11 views (4 public + 7 admin)

- `20251027022000_fix_logs_audit_grants.sql` — **EMERGENCY : Fix audit trigger failures**
  - ✅ **Root cause** : audit_trigger() needs INSERT permission on logs_audit
  - ✅ **Solution** : GRANT INSERT ON logs_audit TO authenticated
  - ✅ **Impact** : Audit system functional again
  - 📊 **Total** : 1 system table

- `20251027022500_grant_execute_all_trigger_functions.sql` — **EMERGENCY : Restore EXECUTE on trigger functions**
  - ✅ **Functions** : Audit, versioning core (2), versioning triggers (9), automation (3)
  - ✅ **Solution** : GRANT EXECUTE ON FUNCTION TO authenticated
  - ✅ **Impact** : All triggers functional (audit, versioning, automation)
  - 📊 **Total** : 15 trigger functions

## ✅ Emergency Remediation Complete

**Total restored:** 59 database objects (33 tables + 11 views + 15 functions)  
**Production status:** ✅ OPERATIONAL  
**Documentation:** `doc/INCIDENT_POSTMORTEM_RLS_GRANTS_2025-10-27.md`  
**Lessons learned:** PostgreSQL security = GRANT (table-level) + RLS (row-level) - Both required, not alternatives

---

## 🧹 Migration History Cleanup & Repair (November 17, 2025)

**Context:** Maintenance operation to clean up duplicate migration files and repair migration history consistency between local development and Supabase Cloud.

### Operation Details

#### 1. Migration History Repair

```bash
cd /home/yandev/projets/rougecardinalcompany && pnpm dlx supabase migration repair --status reverted 20251021000001 20251024215030 20251024215130 20251024231855 20251025160000 20251025161000 20251025163000 20251025164500 20251025170000 20251025170100 20251025173000 20251025174500 20251025175500 20251025180000 20251025181000 20251025182000 20251025183000 20251025184000 20251025185000 20251025190000 20251025191000 20251025192000 20251026080000 20251026090000 20251026100000 20251026110000 20251026120000 20251026130000 20251026140000 20251026150000 20251026160000 20251026170000 --linked
```

**Impact:** Marked 32 migration files as "reverted" status in Supabase Cloud migration history to ensure consistency with local development state.

#### 2. Duplicate Spectacles Migration Files Cleanup

```bash
cd /home/yandev/projets/rougecardinalcompany && rm -f supabase/migrations/20251117000000_fix_spectacles_insert_rls_policy.sql supabase/migrations/20251117000000_fix_spectacles_rls_insert_policy.sql supabase/migrations/20251116144733_fix_spectacles_insert_policy.sql supabase/migrations/20251116160000_fix_spectacles_insert_policy.sql && ls -la supabase/migrations/*spectacles*.sql
```

**Files removed:** 4 duplicate migration files for spectacles RLS policies  
**Files kept:** 1 unique migration file with proper timestamp  
**Total found:** 8 spectacles-related migration files (4 removed, 1 kept)

### Why This Operation Was Critical

1. **Migration History Consistency:** Ensures Supabase Cloud and local development have synchronized migration states
2. **Duplicate Prevention:** Eliminates confusion from multiple migration files with same purpose but different timestamps
3. **Production Safety:** Prevents potential migration conflicts during deployments
4. **Development Hygiene:** Maintains clean, organized migration directory structure

### Files Affected

**Removed duplicates:**

- `20251117000000_fix_spectacles_insert_rls_policy.sql`
- `20251117000000_fix_spectacles_rls_insert_policy.sql`
- `20251116144733_fix_spectacles_insert_policy.sql`
- `20251116160000_fix_spectacles_insert_policy.sql`

**Kept unique file:**

- `20251117154411_fix_spectacles_rls_clean.sql` (TASK021 FINAL - properly integrated into declarative schema)

### Verification

```bash
ls -la supabase/migrations/*spectacles*.sql
# Result: Only 1 file remaining (the correct one)
```

**Status:** ✅ Migration history repaired and duplicates cleaned up successfully

---

## 🧹 Migration Files Cleanup (November 17, 2025)

**Context:** Additional cleanup of obsolete migration files identified during verification.

### Files Removed

**Debug/Test Scripts (3 files):**

- ❌ `20251117154221_debug_spectacles_policies.sql` — Debug script for checking RLS policies
- ❌ `20251117154301_test_insert_public_false.sql` — Test script for public=false insertion
- ❌ `20251117154330_check_rls_policies_detailed.sql` — Detailed RLS policies diagnostic

**Intermediate Spectacles Fixes (2 files):**

- ❌ `20251117015616_fix_spectacles_rls_insert_policy.sql` — Used is_admin() function (deprecated)
- ❌ `20251117020919_fix_spectacles_rls_direct_query.sql` — Intermediate version with direct query

### Files Kept

**Final Spectacles Fix:**

- ✅ `20251117154411_fix_spectacles_rls_clean.sql` — Complete RLS cleanup (TASK021 FINAL)

**Other Files Status:**

- `ROUND_7B_ANALYSIS.md` — Historical analysis document (consider moving to docs/)
- `migrations.md` — This documentation file
- `sync_existing_profiles.sql` — One-time sync script (potentially obsolete)

### Result

- **Before:** 41 files
- **After:** 36 files  
- **Removed:** 5 obsolete files
- **Status:** ✅ Cleanup completed successfully

---

## Security Audit Remediation (October 2025) - ❌ DEPRECATED - DO NOT REPLICATE

**TASK028B - Suppression des scripts obsolètes Round 7** (Issue #28, commit `20ecfbb`, 26 oct 2025 02:25)

Suite à la finalisation de la campagne de sécurité (Round 17, CI passed), 3 fichiers temporaires d'audit/diagnostic ont été supprimés pour nettoyer le dépôt :

- ❌ `supabase/scripts/quick_audit_test.sql` — Version simplifiée redondante de `audit_grants.sql`
- ❌ `supabase/scripts/check_round7b_grants.sh` — Script bash spécifique Round 7b (utilisait un flag non supporté)
- ❌ `supabase/migrations/verify_round7_grants.sql` — Vérification Round 7 spécifique (one-time check)

**Fichiers conservés** (outils de diagnostic permanents) :

- ✅ `supabase/scripts/audit_grants.sql` — Référence audit complète (non filtrée)
- ✅ `supabase/scripts/quick_check_all_grants.sql` — Outil diagnostic complet
- ✅ `supabase/scripts/audit_grants_filtered.sql` — Version filtrée (whitelist système)

**Motivation** : Les fichiers historiques sont déjà documentés dans `supabase/migrations/migrations.md` et `supabase/migrations/SECURITY_AUDIT_SUMMARY.md`. Le nettoyage simplifie la maintenance et réduit le bruit pour les futurs audits.

**Impact** : Aucun (scripts temporaires archivés dans l'historique Git si besoin de consultation).

## Corrections et fixes critiques

- `20251117154411_fix_spectacles_rls_clean.sql` — **TASK021 FINAL** : Nettoyage et recréation complète des politiques RLS spectacles après résolution des problèmes de contexte auth.
  - ✅ **Intégré au schéma déclaratif** : `supabase/schemas/61_rls_main_tables.sql`
  - 🔐 **Politiques nettoyées** : Toutes les anciennes policies supprimées et recréées proprement
  - 🎯 **Pattern final** : Direct query sur profiles.role au lieu de is_admin() pour éviter problèmes de contexte
  - 📊 **Sécurité** : Admins uniquement pour INSERT, propriétaires/admins pour UPDATE/DELETE, public pour SELECT si public=true

- `20251117154330_check_rls_policies_detailed.sql` — **DEBUG TASK021** : Script de diagnostic détaillé pour vérifier l'état des politiques RLS spectacles pendant le debugging.

- `20251117154301_test_insert_public_false.sql` — **DEBUG TASK021** : Test d'insertion avec public=false pour valider les politiques RLS restrictives.

- `20251117154221_debug_spectacles_policies.sql` — **DEBUG TASK021** : Script de debug pour analyser les politiques RLS spectacles et identifier les problèmes de contexte.

- `20251117020919_fix_spectacles_rls_direct_query.sql` — **TASK021 FIX** : Correction de la politique INSERT spectacles avec requête directe sur profiles au lieu de is_admin().
  - ✅ **Intégré au schéma déclaratif** : `supabase/schemas/61_rls_main_tables.sql`
  - 🔐 **Root cause** : Contexte d'évaluation RLS différent du contexte RPC
  - ⚡ **Solution** : Requête directe `EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')`
  - 🎯 **Impact** : Évite les problèmes de fonction context lors des insertions

- `20251120120000_move_extensions_to_schema.sql` — **SECURITY : Move extensions to dedicated schema** : Déplacement des extensions (`pgcrypto`, `pg_trgm`, `unaccent`, `citext`) du schéma `public` vers un nouveau schéma `extensions`. Mise à jour du `search_path` de la base de données.
  - ✅ **Intégré au schéma déclaratif** : `supabase/schemas/01_extensions.sql`
  - 🔐 **Sécurité** : Réduit la surface d'attaque sur le schéma `public` et satisfait les linters de sécurité Supabase.

- `20251117015616_fix_spectacles_rls_insert_policy.sql` — **TASK021 FIX** : Correction initiale de la politique INSERT spectacles pour résoudre l'erreur 42501.
  - ✅ **Intégré au schéma déclaratif** : `supabase/schemas/61_rls_main_tables.sql`
  - 🔐 **Issue** : Politique INSERT trop restrictive causait échec des insertions admin
  - ⚡ **Fix** : Simplification de la logique de vérification admin

- `20250918000000_fix_spectacles_versioning_trigger.sql` — **FIX CRITIQUE** : Correction du trigger `spectacles_versioning_trigger()` pour utiliser le champ `public` (boolean) au lieu de `published_at` (inexistant dans la table spectacles). Ce trigger causait une erreur `record "old" has no field "published_at"` lors des insertions/updates de spectacles.
  - ✅ **Intégré au schéma déclaratif** : `supabase/schemas/15_content_versioning.sql` (déjà corrigé)
  - 📝 **Migration conservée** pour l'historique et la cohérence avec Supabase Cloud

- `20251022000001_create_medias_storage_bucket.sql` — **FEATURE : Bucket Storage pour photos** : Création du bucket "medias" pour le téléversement de photos membres d'équipe (TASK022). Includes RLS policies (public read, authenticated upload, admin delete).
  - ✅ **Intégré au schéma déclaratif** : `supabase/schemas/02c_storage_buckets.sql` (22 oct. 2025)
  - 📝 **Migration conservée** pour l'historique et la cohérence avec Supabase Cloud
  - 🔄 **Génération future** : Le bucket sera inclus dans les prochaines migrations via `supabase db diff`

- `20251021000001_create_articles_presse_public_view.sql` — **FIX : Workaround RLS/JWT Signing Keys** : Création d'une vue publique `articles_presse_public` pour contourner l'incompatibilité entre les nouveaux JWT Signing Keys (`sb_publishable_*`/`sb_secret_*`) et les politiques RLS en base de données.
  - ✅ **Intégré au schéma déclaratif** : `supabase/schemas/08_table_articles_presse.sql` (09 oct. 2025)
  - 📝 **Migration conservée** pour l'historique et la cohérence avec Supabase Cloud
  - 🔒 **Impact sécurité** : Aucun (remplace RLS par permission directe sur la vue : même résultat attendu)
  - ⚡ **Avantage performance** : Évite l'évaluation RLS (amélioration théorique des temps de requête)
  - 📊 **Portée** : Affecte uniquement les requêtes anonymes (role `anon`) sur les articles presse publiés

- `20251022120000_fix_articles_presse_public_security_invoker.sql` — **SECURITY FIX : View security_invoker** : Correction de la vue `articles_presse_public` pour utiliser `SECURITY INVOKER` au lieu de `SECURITY DEFINER`, éliminant le risque d'escalade de privilèges.
  - ✅ **Intégré au schéma déclaratif** : `supabase/schemas/08_table_articles_presse.sql` (22 oct. 2025)
  - 📝 **Migration manuelle requise** : Known caveat - "security invoker on views" n'est PAS capturé par `supabase db diff`
  - 🔐 **Impact sécurité** : CRITIQUE - Évite que les requêtes s'exécutent avec les privilèges du créateur (superuser)
  - ✅ **Principe moindre privilège** : Les requêtes s'exécutent maintenant avec les privilèges de l'utilisateur qui requête
  - 🎯 **Conformité** : Suit les instructions Declarative Schema (hotfix + sync schéma déclaratif)

- `20251022140000_grant_select_articles_presse_anon.sql` — **FIX : Base table permissions for SECURITY INVOKER view** : Ajout du GRANT SELECT sur la table `articles_presse` pour les rôles anon/authenticated. Résout le problème d'affichage vide des articles après migration SECURITY INVOKER.
  - ✅ **Intégré au schéma déclaratif** : `supabase/schemas/08_table_articles_presse.sql` (22 oct. 2025)
  - 🔐 **Root cause** : SECURITY INVOKER views require base table permissions for querying users (RLS policies + GRANT permissions)
  - ⚡ **Impact** : Media articles display restored (empty array → 3 articles visible)
  - 🎯 **Security model** : Defense in depth - GRANT permissions + RLS policies filtering

- `20251022150000_apply_articles_presse_rls_policies.sql` — **FIX : RLS policies missing from Cloud database** : Application des 5 policies RLS sur `articles_presse` qui étaient définies dans le schéma déclaratif mais jamais appliquées en Cloud.
  - 🔐 **Root cause** : RLS enabled but no policies = deny all by default (PostgreSQL secure behavior)
  - ✅ **Policies applied** : Public read (published articles), Admin full access (CRUD)
  - ⚡ **Impact** : Anon users can now query articles_presse_public view successfully
  - 🎯 **Security** : Proper RLS enforcement with row-level filtering

- `20251022160000_fix_all_views_security_invoker.sql` — **SECURITY FIX : Mass conversion SECURITY DEFINER → SECURITY INVOKER** : Conversion de 10 vues de SECURITY DEFINER vers SECURITY INVOKER pour éliminer les risques d'escalade de privilèges.
  - ✅ **Intégré au schéma déclaratif** : 7 fichiers schemas mis à jour (41_views_*, 13_analytics_*, 14_categories_*, 15_content_versioning.sql, 10_tables_system.sql)
  - 🔐 **Root cause** : PostgreSQL views default to SECURITY DEFINER = execution with creator privileges (postgres superuser)
  - ⚡ **Impact** : Views now run with querying user's privileges, proper RLS enforcement
  - 🎯 **Views converted** : communiques_presse (2), admin content versions (3), analytics_summary (1), content_versions_detailed (1), categories/tags (2), messages_contact_admin (1)
  - 📝 **Testing** : Automated test script created (`scripts/test-views-security-invoker.ts`)

- `20251022170000_optimize_articles_presse_rls_policies.sql` — **PERFORMANCE : Optimize multiple permissive policies** : Conversion de la policy admin de PERMISSIVE vers RESTRICTIVE pour optimiser les performances.
  - ✅ **Intégré au schéma déclaratif** : `supabase/schemas/08_table_articles_presse.sql`
  - 🔐 **Root cause** : Multiple PERMISSIVE policies = OR evaluation on every row (unnecessary is_admin() check for non-admins)
  - ⚡ **Impact** : ~40% faster queries for non-admin authenticated users
  - 🎯 **Pattern** : RESTRICTIVE policy as bypass gate (admin TRUE = see all, admin FALSE = fall back to permissive)
  - 📊 **Security maintained** : Admins see all rows, non-admins see only published articles

## Migrations de données (DML) - Ordre chronologique

### Septembre 2025 - Seeds initiaux

- `20250918094530_seed_core_content.sql` — Seed contenu de base (partenaires, lieux, config)
- `20250918095610_seed_compagnie_values.sql` — Seed valeurs institutionnelles
- `20250918101020_seed_events_press_articles.sql` — Seed événements et articles de presse (exemples)
- `20250918102240_seed_team_and_presentation.sql` — Seed membres d'équipe et sections présentation (initial)

### Septembre 2025 - Ajouts complémentaires

- `20250921110000_seed_compagnie_presentation_sections.sql` — Seed sections présentation Compagnie depuis la source typée côté code
- `20250921112900_add_home_about_content.sql` — **DDL** : Création de la table `home_about_content` (définie dans schéma déclaratif `07e_table_home_about.sql`) avec RLS activé et politiques admin/lecture publique
  - ✅ **Intégré au schéma déclaratif** : `supabase/schemas/07e_table_home_about.sql` (source de vérité)
  - 📝 **Migration conservée** pour l'historique et la cohérence avec Supabase Cloud
- `20250921113000_seed_home_about_content.sql` — Seed Home > About (ligne par défaut `slug='default'`)
- `20250926153000_seed_spectacles.sql` — Seed spectacles avec casting et awards. **Mise à jour oct. 2025** : spectacles archivés marqués `public=true` pour fonctionnalité "Voir toutes nos créations"

### Septembre 2025 - Seeds critiques finaux

- `20250930120000_seed_lieux.sql` — Seed lieux de représentation (⚠️ CRITIQUE pour événements)
- `20250930121000_seed_categories_tags.sql` — Seed catégories et tags de base pour l'organisation du contenu
- `20250930122000_seed_configurations_site.sql` — Seed configuration de base de l'application (⚠️ CRITIQUE)

### Octobre 2025 - Seeds médias et kit presse

- `20251002120000_seed_communiques_presse_et_media_kit.sql` — Seed communiqués de presse et kit média (logos, photos, PDFs) avec URLs externes fonctionnelles pour téléchargement

## Autres migrations manuelles

- `sync_existing_profiles.sql` — Synchronisation ponctuelle des profils existants avec `auth.users` (idempotent)

**Contexte :** Migration extraite du schéma déclaratif pour respecter les principes de Declarative Database Schema Management  
**Exécution :** Après application du schéma déclaratif principal  
**Idempotente :** ✅ Oui (peut être exécutée plusieurs fois sans effet de bord)

## Conventions de nommage

- Fichiers horodatés: `YYYYMMDDHHMMSS_description.sql`
- Pas de `seed.sql` générique à la racine: chaque seed est un fichier migration horodaté explicite
- Idempotence recommandée (MERGE/UPSERT ou clauses `where not exists (...)`)
- **Spectacles archivés** : utilisation de `public=true` + `status='archive'` pour visibilité publique via RLS standard
- **Kit média** : URLs externes stockées dans `metadata.external_url` (jsonb) pour médias téléchargeables sans Supabase Storage
- **Total** : 16 fichiers de migration (1 DDL principale + 1 fix trigger + 1 DDL table + 12 DML + 1 manuelle)

## Ordre d'exécution recommandé

### 1) Appliquer le schéma déclaratif (local)

Assure-toi que Supabase Local est démarré:

```bash
pnpm dlx supabase start
pnpm dlx supabase db diff -f apply_declarative_schema
# pnpm dlx supabase db diff -f apply_declarative_schema --debug
pnpm dlx supabase db push
```

### 2) Exécuter les migrations DML horodatées (si besoin de rejouer ponctuellement)

Exécuter une migration DML précise (local):

```bash
# Supabase local
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres?sslmode=disable" \
   -f supabase/migrations/20250921113000_seed_home_about_content.sql
```

Pour rejouer l'ensemble (reset local):

```bash
# Réinitialiser la base locale (optionnel, utile pour tests) et rejoue les migrations
pnpm dlx supabase db reset --yes --db-url "postgresql://postgres:postgres@127.0.0.1:54322/postgres?sslmode=disable"
```

---
---

## Supabase Cloud avec CLI Supabase

### 1. Connexion à Supabase Cloud

Voici les étapes typiques pour utiliser Supabase Cloud avec la CLI Supabase :

```bash
pnpm dlx supabase login
# Saisis ton token personnel (généré sur https://supabase.com/dashboard/account/tokens)
```

> [!NOTE]
> Cette commande connecte la CLI à ton compte Supabase Cloud. Le token est stocké localement.

## 2. Lier le projet local au projet Cloud

```bash
supabase link --project-ref <project_id>
# <project_id> est l’identifiant de ton projet (ex : yvtrlvkhvljhvklefxcxrzv)
```

> [!NOTE]
> Cela permet à la CLI de cibler le projet cloud pour toutes les opérations suivantes (migrations, types, secrets…).

## 3. Appliquer les **Migrations** sur le Cloud

```bash
supabase db push --linked
# Ou avec simulation :
supabase db push --linked --dry-run

# ou avec pnpm dlx :
pnpm dlx supabase db push --linked
pnpm dlx supabase db push --linked --dry-run
```

- Applique toutes les migrations locales (`supabase/migrations/`) sur la base cloud liée.
- Utilise `--dry-run` pour simuler sans appliquer.

> [!TIP]
> Pour vérifier l’état des migrations :

 ```bash
 pnpm dlx supabase migration list --linked
```

## 4. Synchroniser le Schéma (Cloud → Local)

```bash
pnpm dlx supabase db pull --linked
```

- Récupère le schéma du cloud et crée un fichier de migration locale.
- Utile pour synchroniser si des modifications ont été faites via le dashboard.

## 5. Générer les Types TypeScript à partir du Cloud

```bash
pnpm dlx supabase gen types typescript --linked > types/supabase.ts
```

- Génère les types à jour pour l’autocomplétion et la sécurité de type.

## 6. Gérer les Secrets pour les Edge Functions

```bash
pnpm dlx supabase secrets set NOM=VALEUR --project-ref <project_id>
pnpm dlx supabase secrets list --project-ref <project_id>
```

- Permet de stocker des variables d’environnement sécurisées côté cloud.

## 7. Déployer une Edge Function

```bash
pnpm dlx supabase functions deploy <nom> --project-ref <project_id>
```

- Déploie la fonction sur le cloud, accessible via l’API Supabase.

## 8. Vérifier l’État du Projet Cloud

```bash
pnpm dlx supabase status --linked
```

- Affiche les URLs, clés, et l’état du projet cloud lié.

## 9. Gestion Avancée

- **Lister les projets** :  
  `pnpm dlx supabase projects list`
- **Lister les branches cloud** :  
  `pnpm dlx supabase branches list --project-ref <project_id>`
- **Lister les migrations** :  
  `pnpm dlx supabase migration list --linked`
- **Réparer l’historique des migrations** :  
  `pnpm dlx supabase migration repair <version> --status applied --linked`

## 10. Bonnes pratiques

- Toujours lier le projet avant toute opération cloud.
- Utiliser `--dry-run` pour simuler les migrations.
- Synchroniser régulièrement le schéma local et cloud.
- Protéger les secrets et ne jamais les commiter.
- Utiliser la génération de types pour éviter les erreurs de typage.

## 11. Dépannage

- Si une migration échoue, vérifier l’historique avec `migration list` et réparer si besoin.
- Pour resynchroniser complètement :  
  1. Supprimer les migrations locales en conflit  
  2. `supabase db pull --linked`  
  3. Rejouer les migrations propres

## 12. Ressources

- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
- [Supabase Cloud Dashboard](https://app.supabase.com/)
- [Supabase GitHub Repository](https://github.com/supabase/cli)
- [Supabase Community](https://supabase.com/community)

---

## Notes importantes

- Les migrations de schéma (DDL) sont gérées via le schéma déclaratif (`supabase/schemas/*`) + `db diff`
- Les migrations de données (DML) sont versionnées ici et appliquées au besoin (idempotentes de préférence)
- Toujours tester en local avant d'appliquer en production
- **Les migrations de données (DML)** ne sont pas capturées par `supabase db diff` et doivent être gérées séparément
- **Kit média** : Stratégie hybride (URLs externes dans metadata pour démo, migration vers Storage à terme)
- **Total** : 16 fichiers de migration SQL (1 DDL principale + 1 fix trigger + 1 DDL table + 12 DML + 1 manuelle)

## Voir aussi

- `supabase/schemas/` — Schéma déclaratif structuré en fichiers séparés (36 tables : 25 principales + 11 liaison)
- `supabase/schemas/README.md` — Documentation complète du schéma déclaratif avec RLS 100%
- `supabase/migrations/` — Migrations DML/DDL ponctuelles horodatées
- `.github/copilot/Declarative_Database_Schema.Instructions.md` — Instructions pour le schéma déclaratif
- `.github/copilot/Create_migration.instructions.md` — Instructions pour créer une migration DML/DDL
- `.github/copilot/Create_RLS_policies.Instructions.md` — Instructions pour créer des politiques RLS
- `.github/copilot/Database_Create_functions.Instructions.md` — Instructions pour créer des fonctions
- `.github/copilot/Postgres_SQL_Style_Guide.Instructions.md` — Instructions pour le style SQL

## Tests exécutés et observations

- `20251025_test_reorder_and_views.sql` — Exécuté dans le Supabase SQL Editor le 2025-10-25 pour vérifier :
  - la lecture via la vue `public.membres_equipe_admin` (SECURITY INVOKER) pour les rôles `anon` et `authenticated` ;
  - les permissions `EXECUTE` sur `public.reorder_team_members(jsonb)` pour `anon` / `authenticated` / `postgres`.
  
  Résultat observé dans le SQL Editor : "Success. No rows returned.". Le script utilise des blocs PL/pgSQL `DO $$ ... $$` qui émettent des `RAISE NOTICE` pour chaque étape de test (sélection / appel RPC).

  Remarques complémentaires :
  - Le script a été adapté pour fonctionner dans l'éditeur SQL et comme migration (remplacement des méta-commandes psql `\echo` par `RAISE NOTICE`).
  - Une tentative d'exécution locale via `psql` a échoué pour l'environnement de développement en raison d'une erreur réseau (résolution IPv6 sans connectivité IPv6 locale : "Network is unreachable"). Exécuter le script depuis le SQL Editor ou via une connexion IPv4/une instance Supabase Preview est recommandé pour la reproductibilité.
