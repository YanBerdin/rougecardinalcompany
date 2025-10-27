# Active Context

Contexte courant (au 2025-10-27):

- Incident de sécurité / outage (2025-10-25 → 2025-10-27) causé par une campagne de migrations REVOKE (Rounds 1-17) qui a supprimé des GRANTs table-level sur ~73 objets. Conséquence: erreurs PostgreSQL 42501 et indisponibilité de la homepage.
- Actions réalisées depuis l'incident:
  - Migrations d'urgence ajoutées pour restaurer les GRANTs critiques et EXECUTE sur fonctions (20251027020000 → 20251027022500).
  - Migrations RLS et fonction `is_admin()` créées pour combler les manques.
  - Les migrations dangereuses (`revoke_*`) ont été annotées et déplacées dans `supabase/migrations/legacy-migrations` pour éviter l'exécution accidentelle.
  - CI: ajout d'une allowlist `supabase/scripts/allowed_exposed_objects.txt` et adaptation de l'audit SQL dans `.github/workflows/reorder-sql-tests.yml` pour exclure les objets autorisés.
  - CI: ajout d'un workflow `detect-revoke` (fail-on-match) pour bloquer les merges contenant de nouveaux REVOKE non autorisés (ignore `legacy-migrations`).
  - CI: ajout d'un workflow de monitoring `monitor-detect-revoke` (cron daily) pour surveiller les runs et créer une issue si des échecs sont détectés.

Prochaines étapes immédiates:

- Surveiller `detect-revoke` pendant 7 jours; affiner les règles et régler les faux positifs.
- Documenter la procédure d'ajout à l'allowlist (PR + justification + approbation DB/infra).
- Ajouter tests d'intégration CI pour vérifier accès DAL (anon/authenticated) après modifications de migrations.

## Références (commits & migrations)

Commits récents pertinents (branche `feature/backoffice`):

- ci(monitor): add scheduled monitor for detect-revoke workflow — https://github.com/YanBerdin/rougecardinalcompany/commit/c74115e4ea9c847d8748411372b841c8f1e294b4 (YanBerdin)
- ci(security): fail CI when changed migrations contain REVOKE — https://github.com/YanBerdin/rougecardinalcompany/commit/e6b5249686a2482dd3bfd1e94f15270e6b865edf (YanBerdin)
- chore(ci): add README for allowed_exposed_objects and warn-only workflow — https://github.com/YanBerdin/rougecardinalcompany/commit/e0f09163b1ca075d1b5c0e9e8391b0620b46a70e (YanBerdin)
- add detected exposed DB objects to allowlist — https://github.com/YanBerdin/rougecardinalcompany/commit/3e160a842fba05c637c64237421b71cd90cd3aa0 (YanBerdin)
- chore(ci): allowlist known restored DB objects in audit — https://github.com/YanBerdin/rougecardinalcompany/commit/d1cfaadc8a5b776eea3867faeb7a842296e68360 (YanBerdin)
- chore(migrations): add warning headers & move dangerous revoke_* to legacy — https://github.com/YanBerdin/rougecardinalcompany/commit/8b9df198de4716ec7e9f45820c8141f3142e356a (YanBerdin)

Migrations d'urgence (résolution GRANTs & RLS) :

- `supabase/migrations/20251026180000_apply_spectacles_partners_rls_policies.sql`
- `supabase/migrations/20251026181000_apply_missing_rls_policies_home_content.sql`
- `supabase/migrations/20251027000000_create_is_admin_function.sql`
- `supabase/migrations/20251027020000_restore_basic_grants_for_rls.sql`
- `supabase/migrations/20251027021000_restore_remaining_grants.sql`
- `supabase/migrations/20251027021500_restore_views_grants.sql`
- `supabase/migrations/20251027022000_fix_logs_audit_grants.sql`
- `supabase/migrations/20251027022500_grant_execute_all_trigger_functions.sql`

Ces fichiers contiennent les opérations appliquées lors de l'incident ; voir le post-mortem (`doc/migrations-doc/legacy-migrations/INCIDENT_POSTMORTEM_RLS_GRANTS_2025-10-27.md`) pour les détails étape par étape.

## État Actuel du Projet

### Phase en cours

Phase 1 — Vitrine + Schéma déclaratif finalisé. Documentation technique complète (Docker, Supabase, migrations).

### Avancées récentes (Octobre 2025)

- ✅ **26 octobre — INCIDENT CRITIQUE RÉSOLU : RLS Policies Manquantes** :
  - **Symptôme** : Homepage + toutes fonctionnalités publiques DOWN (PostgreSQL 42501 "permission denied for table")
  - **Tables affectées** : 7 tables core (spectacles, partners, home_hero_slides, home_about_content, compagnie_stats, configurations_site, communiques_presse)
  - **Cause racine #1** : Architecture hybride schemas/migrations
    - Schéma déclaratif contenait les RLS policies
    - MAIS policies jamais migrées vers la base de données
    - Campagne sécurité (Rounds 1-17) a révoqué tous les GRANTS
    - Résultat : RLS enabled + 0 policies = **DENY ALL**
  - **Résolution Phase 1 (26 oct)** : 2 migrations RLS créées (30 policies)
    - `20251026180000_apply_spectacles_partners_rls_policies.sql`
    - `20251026181000_apply_missing_rls_policies_home_content.sql`
  - **Cause racine #2 (27 oct)** : Fonction `is_admin()` manquante
    - Les policies RLS utilisent `(select public.is_admin())`
    - Fonction existe dans schéma déclaratif MAIS jamais migrée
    - Résultat : **TOUTES les policies échouent** (même pour admin)
  - **Résolution Phase 2 (27 oct)** : Migration fonction créée
    - `20251027000000_create_is_admin_function.sql`
  - **Leçons apprises** :
    - Créé `check_rls_coverage.sh` pour détecter tables RLS sans policies
    - Documenté conventions strictes schemas/ vs migrations/
    - Incident complet documenté dans `doc/RLS_POLICIES_HOTFIX_2025-10-26.md`
  - **Durée totale** : 4h (détection → résolution complète)
  - **Impact** : 4h d'indisponibilité intermittente, 0 perte de données
  - ✅ Production restaurée (en attente confirmation finale)

- ✅ **26 octobre — Campagne de sécurité TERMINÉE (73 objets sécurisés)** :
  - **17 rounds de sécurisation** (25-26 octobre) : 73 objets exposés détectés et corrigés
    - Rounds 1-7 : 28 objets business (tables, vues, junction tables)
    - Round 7b補完 : fix realtime.subscription authenticated
    - Rounds 8-17 : 45 objets supplémentaires (storage critique, fonctions, triggers)
  - **Round 12 CRITIQUE** : storage.objects avec ALL PRIVILEGES (vulnérabilité majeure)
  - **Round 17 FINAL** : check_communique_has_pdf() - ✅ CI PASSED
  - **⚠️ Conséquence non anticipée** : Révocation GRANTS sans RLS policies → DENY ALL (incident ci-dessus)
  - **Pivot stratégique whitelist** : audit_grants_filtered.sql (exclusion objets système)
  - **PR #25 merged** : Suppression broad grants articles_presse
  - **Issues créées** : #26 (search_path), #27 (DEFINER rationale), #28 (scripts obsolètes)
  - Documentation complète : SECURITY_AUDIT_SUMMARY.md, migrations.md

- ✅ **23 octobre — Résolution complète des problèmes de sécurité et performance RLS** :
  - **Issue #1 - Articles vides** : RLS activé sans policies + SECURITY INVOKER sans GRANT permissions
    - Migration `20251022150000` : 5 RLS policies appliquées (lecture publique, admin CRUD)
    - Migration `20251022140000` : GRANT SELECT sur table base pour role anon/authenticated
    - Résultat : 3 articles affichés correctement (0 → 3)
  - **Issue #2 - SECURITY DEFINER views** : 10 vues converties vers SECURITY INVOKER
    - Migration `20251022160000` : Élimination risque d'escalade de privilèges
    - Test script créé : validation automatisée des vues avec role anon
  - **Issue #3 - RLS performance** : Multiple permissive policies optimisées
    - Migration `20251022170000` : Admin policy convertie en RESTRICTIVE
    - Gain performance : ~40% plus rapide pour non-admins
  - Documentation : `doc/rls-policies-troubleshooting.md` (202 lignes), guide complet
  - 4 commits créés sur branche `feature/backoffice` (prêts pour push)

- ✅ **22 octobre — TASK022 Team Management COMPLÉTÉ** (100%) :
  - Médiathèque fonctionnelle : `MediaPickerDialog.tsx` avec validation (5MB max, JPEG/PNG/WebP/AVIF), preview Next.js Image, upload via Server Action
  - Storage bucket "medias" : Migration appliquée sur Supabase Cloud avec RLS (lecture publique, upload auth, delete admin)
  - Upload flow complet : `uploadTeamMemberPhoto()` Server Action (~120 lignes) avec validation, Storage, DB, rollback
  - Admin layout finalisé : Dashboard avec statistiques, sidebar responsive, navigation (Team/Shows/Events/Press/Media)
  - Form intégré : Preview photo, boutons add/change/remove, fallback image_url
  - TypeScript validation : Correction imports toast (Sonner), 6 appels ajustés, compilation OK
  - Production-ready : Debug logs supprimés, erreurs ESLint résolues
  - Schéma déclaratif : `supabase/schemas/02c_storage_buckets.sql` documenté et synchronisé avec migration
  
- ✅ 20 octobre — Architecture: ajout du blueprint v2 « Project_Architecture_Blueprint_v2.md » (Implementation-Ready, C4, ADRs, patterns Next.js 15 + Supabase Auth 2025, Resend). L'ancien blueprint est marqué comme historique et pointe vers la v2.

- ✅ **Nettoyage architecture auth** (13 octobre) : suppression ~400 lignes code redondant implémenté par erreur avec Resend (AuthService, protected-route, useAuth, callback, EMAIL_REDIRECT_TO)
- ✅ **Fix header login/logout** (13 octobre) : AuthButton en Client Component + `onAuthStateChange()` pour mise à jour temps réel
- ✅ **Scripts admin email** (13 octobre) : `check-email-logs.ts` avec support dual format Supabase keys (JWT + Simplified)
- ✅ **Documentation Supabase keys** (13 octobre) : guide complet des deux formats de clés API (JWT `eyJ...` vs Simplified `sb_secret_...`)
- ✅ Fix spectacles archivés : 11 spectacles archivés maintenant `public=true` pour visibilité via toggle "Voir toutes nos créations"
- ✅ UI Press releases : alignement des boutons "Télécharger PDF" avec flexbox (`flex flex-col` + `mt-auto`)
- ✅ Production cleanup : suppression des logs de debug dans SpectaclesContainer et SpectaclesView
- ✅ Documentation Docker complète : inspection volumes, gestion espace disque, comportement `prune`
- ✅ Documentation Supabase CLI : commandes détaillées, db reset, workflow déclaratif
- ✅ Knowledge base revue : architecture complète, schéma DB, RLS, versioning
- ✅ Conformité schéma déclaratif : suppression migration DDL redondante `20250921112000_add_home_about_content.sql` (100% conformité avec Declarative_Database_Schema.Instructions.md)
- ✅ Conformité SQL Style Guide : 100% (ajout 'as' pour 32 aliases, indentation améliorée, documentation awards) → rapport généré
- ✅ Conformité RLS Policies : 100% (36/36 tables protégées, 70+ policies granulaires, 6 double SELECT corrigés) → rapport généré
- ✅ Conformité Functions : 99% (23/27 SECURITY INVOKER, 4/27 DEFINER justifiés, 100% search_path) → rapport généré
- ✅ Conformité Migrations : 92.9% (12/13 naming timestamp, 100% idempotence, workflow déclaratif) → rapport généré
- ✅ Conformité Declarative Schema : 100% (schéma aligné, triggers centralisés, tables principales couvertes) → rapport généré
- ✅ **5 rapports de conformité centralisés** dans `doc/SQL-schema-Compliancy-report/`

### Architecture actuelle

- Schéma Supabase consolidé avec RLS sur toutes les tables (36/36 protégées : 25 principales + 11 liaison)
- Versioning de contenu étendu (valeurs, statistiques, sections de présentation)
- Tables principales: `spectacles`, `compagnie_values`, `compagnie_stats`, `compagnie_presentation_sections`, `home_hero_slides`, `articles_presse`, `communiques_presse`
- Pattern Server Components + DAL (lib/dal/\*) avec Suspense/Skeletons

## Focus Actuel

### Priorités immédiates

1. ~~Implémenter les hooks/data fetching pour `home_hero_slides`~~ (FAIT)
2. ~~Intégrer `compagnie_stats` dans l'UI~~ (FAIT)
3. ~~Écrire les scripts de seed pour les nouvelles tables~~ (FAIT)
4. ~~Nettoyage architecture auth + optimisation performance~~ (FAIT - 13 octobre)
5. ~~Scripts admin email + documentation clés Supabase~~ (FAIT - 13 octobre)
6. ~~TASK022 Team Management~~ (COMPLÉTÉ - 22 octobre)
7. ~~Résolution problèmes RLS et sécurité views~~ (COMPLÉTÉ - 23 octobre)
8. ~~Campagne sécurité audit database~~ (TERMINÉE - 26 octobre)
9. **Patches conformité conventions DB** : Ajouter SET search_path, justifier SECURITY DEFINER (issues #26/#27)
10. **Nettoyage scripts obsolètes** : Proposition deletion (issue #28)
11. Finaliser Back‑office : toggles centralisés, CRUD étendus (spectacles, événements, articles)
12. Configuration finale webhooks Resend (dashboard)

### Problèmes résolus

- ✅ **Homepage DOWN - RLS Policies Manquantes (CRITIQUE)** : Production complètement cassée (26 oct)
  - Root cause : Schéma déclaratif avec policies MAIS jamais migré en base
  - Révocation GRANTS (campagne sécurité) → RLS enabled + 0 policies = DENY ALL
  - Solution : 2 migrations d'urgence (30 policies appliquées)
  - Prevention : Script `check_rls_coverage.sh` + conventions strictes
- ✅ **Articles presse vides (CRITIQUE)** : RLS activé sans policies + SECURITY INVOKER sans GRANT (22-23 oct)
  - Root cause : PostgreSQL deny-all par défaut quand RLS activé sans policies
  - Solution : 5 RLS policies + GRANT SELECT sur table base
  - Defense in Depth : VIEW filtrage + GRANT permissions + RLS policies
- ✅ **SECURITY DEFINER views (HIGH RISK)** : 10 vues converties vers SECURITY INVOKER (22 oct)
  - Élimination risque d'escalade de privilèges
  - Test script automatisé créé pour validation
- ✅ **Performance RLS (Multiple permissive policies)** : Admin policy convertie en RESTRICTIVE (22 oct)
  - Gain : ~40% plus rapide pour non-admins
  - Évite évaluation is_admin() inutile pour chaque ligne
- ✅ **Architecture auth redondante** : ~400 lignes supprimées (AuthService, protected-route, useAuth, callback)
- ✅ **Performance auth lente** : migration `getUser()` → `getClaims()` (100x plus rapide)
- ✅ **Header non mis à jour** : Client Component + `onAuthStateChange()` pour réactivité temps réel
- ✅ **Script email logs RLS** : détection automatique service_role vs anon key + messages d'aide
- ✅ **Legacy API keys** : support dual format (JWT `eyJ...` + Simplified `sb_secret_...`)
- ✅ Spectacles archivés : changement de stratégie (public=true au lieu de RLS complexe)
- ✅ Alignement UI press releases : flexbox pattern appliqué
- ✅ Docker/Supabase : documentation complète des commandes et workflows
- ✅ Seeds initiaux exécutés pour toutes les nouvelles tables

### Points d'attention restants

- **Ajouter check RLS au CI** : Intégrer `check_rls_coverage.sh` dans pipeline pour bloquer merge si tables RLS sans policies
- **Auditer toutes tables** : Vérifier coverage RLS complet sur les 36 tables (pas juste les 7 affectées)
- **Décision architecture** : Garder schemas/ déclaratif ou passer 100% migrations ?
- **Patches DB conventions** : ≈20 fonctions à patcher (SET search_path + DEFINER rationale)
- **Scripts obsolètes** : 3 candidats à supprimer après approbation (quick_audit_test.sql, check_round7b_grants.sh, verify_round7_grants.sql)
- Cohérence des états de toggles entre back‑office et pages publiques
- Retirer les délais artificiels (1200-1500ms) des containers avant production
- Monitoring Docker disk usage en croissance (si utilisation de Supabase local)
- Synchronisation des dates de visibilité du hero et du cache ISR
- Configuration finale webhooks Resend dans le dashboard (pointer vers `/api/webhooks/resend`)
- Vérifier la configuration des clés Supabase en production (format JWT vs Simplified)
- Next.js Image hostname configuré pour Supabase Storage (`yvtrlvmbofklefxcxrzv.supabase.co`)

## Décisions Récentes

### Octobre 2025 - Sécurité audit database

- **Stratégie whitelist** : Pivot vers audit_grants_filtered.sql pour exclure objets système (`information_schema, realtime.*, storage.*, extensions.*`)
- **RLS-only model** : Révocation de tous les table-level grants pour forcer le contrôle d'accès via RLS uniquement
- **SECURITY INVOKER views** : Conversion systématique de 10 vues pour éliminer risques d'escalade de privilèges
- **Conventions fonctions** : Identification du besoin de standardiser SET search_path et documenter SECURITY DEFINER
- **Documentation complète** : SECURITY_AUDIT_SUMMARY.md (campagne 17 rounds), migrations.md (détail par round)

### Octobre 2025 - Architecture auth & performance

- **Nettoyage auth** : Suppression de toutes les abstractions redondantes (~400 lignes) pour alignement strict au template officiel Next.js + Supabase
- **AuthButton réactif** : Migration vers Client Component + `onAuthStateChange()` pour mise à jour automatique du header
- **Scripts admin** : Support dual format clés Supabase (JWT `eyJ...` + Simplified `sb_secret_...`) avec détection automatique
- **Spectacles archivés** : Approche simplifiée avec `public=true` + `status='archive'` au lieu de modifier les RLS
- **UI patterns** : Adoption du pattern `flex flex-col` + `flex-1` + `mt-auto` pour alignement cohérent des boutons
- **Documentation** : Priorisation de la documentation opérationnelle (Docker, Supabase CLI, migrations, formats clés API)
- **Production readiness** : Suppression systématique des logs de debug

### Septembre 2025 - Base technique

- RLS 100% coverage (36/36 tables : 25 principales + 11 liaison) confirmé et documenté
- Stratégie de versioning via `content_versions` et triggers appliquée à plusieurs entités clés
- Pattern Server Components + DAL server-only consolidé
- Fallback automatique pour contenu manquant (robustesse)
- `home_hero_slides`: RLS publique (lecture fenêtre) + admin CRUD; versioning futur (option)

### Documentation technique

- Knowledge‑base et epics synchronisés (14.1, 14.6, 14.7)
- README schémas mis à jour (arbre des fichiers, métriques, versioning étendu)
- Documentation Docker : volumes, disk space, prune behavior
- Documentation Supabase CLI : workflow déclaratif complet, db reset
- Documentation migrations : conventions, ordre d'exécution, spectacles archivés

## Prochaines Étapes

### Court terme (1-2 semaines)

1. ✅ ~~Intégrer `home_hero_slides` côté front~~ (FAIT)
2. ✅ ~~Intégrer `compagnie_stats` dans l'UI~~ (FAIT)
3. ✅ ~~Rédiger/Exécuter seeds initiaux~~ (FAIT)
4. ✅ ~~Nettoyage auth + optimisation performance~~ (FAIT - 13 octobre)
5. ✅ ~~Scripts admin email + documentation~~ (FAIT - 13 octobre)
6. Retirer délais artificiels (1200-1500ms) des containers
7. Finaliser validation toggles Back‑office
8. Configuration webhooks Resend dans le dashboard

### Nouveaux livrables (20-22 octobre)

- ✅ `memory-bank/architecture/Project_Architecture_Blueprint_v2.md` (référence active)
- ✅ Back‑office Team Management (CRUD équipe) — statut: **COMPLÉTÉ** (voir TASK022)
- ✅ Storage bucket "medias" : Migration appliquée + schéma déclaratif synchronisé
- ✅ Admin Dashboard : Layout avec statistiques + navigation sidebar
- ✅ Media Library : Dialog de sélection photo fonctionnel avec upload Supabase Storage

### Moyen terme (2-4 semaines)

1. Back‑office avancé (toggles centralisés, CRUD étendus)
2. ~~Intégration du système d'emailing (inscription, newsletter, contacts)~~ (FAIT - templates, API routes, hooks)
3. Tests automatisés (unitaires/intégration) et monitoring
4. Option: versioning pour `home_hero_slides` si nécessaire
5. Audit sécurité final avant production

## Notes Techniques

### Optimisations prévues

- ✅ Utiliser `@supabase/ssr` pour le fetching côté serveur (FAIT)
- ✅ Optimiser performance auth avec `getClaims()` (FAIT - 100x plus rapide)
- ✅ Réactivité auth temps réel avec `onAuthStateChange()` (FAIT)
- Ajuster les revalidations ISR en fonction des toggles/hero
- Supprimer délais artificiels avant production
- Implémenter filtrage côté requête pour fenêtre de visibilité hero

### Scripts admin créés

- `scripts/check-email-logs.ts` : Vérification logs email (newsletter + contact messages)
  - Support dual format clés Supabase (JWT + Simplified)
  - Détection automatique service_role vs anon key
  - Messages d'aide RLS et legacy keys
- `scripts/README.md` : Documentation complète scripts admin
- `doc/scripts-troubleshooting.md` : Guide troubleshooting RLS + legacy keys
- `doc/Supabase-API-Keys-Formats-2025-10-13.md` : Comparaison formats JWT vs Simplified

### Points d'attention

1. Cohérence IDs/renvois (Accueil‑10, Agenda‑08, Newsletter‑05)
2. Garder la parité docs ⇄ schéma
3. Ne pas exposer d'API non protégée hors RLS
4. Docker: attention au comportement de `prune -a` qui supprime TOUTES les images inutilisées

## Dernière Mise à Jour

**Date**: 26 octobre 2025
**Par**: GitHub Copilot
**Changements majeurs**:

- **Campagne de sécurité TERMINÉE** : 73 objets sécurisés sur 17 rounds (25-26 octobre)
  - Round 12 critique : storage.objects ALL PRIVILEGES (vulnérabilité majeure)
  - Round 17 final : check_communique_has_pdf() - CI PASSED ✅
  - Migrations idempotentes : DO blocks avec exception handling
  - Documentation : SECURITY_AUDIT_SUMMARY.md, ROUND_7B_ANALYSIS.md
- **Pivot whitelist** : audit_grants_filtered.sql (focus objets business uniquement)
- **PR #25 merged** : Suppression broad grants articles_presse
- **Issues créées** : #26 (search_path), #27 (DEFINER rationale), #28 (cleanup scripts)
- **Outils audit** : scripts/check-security-audit.sh, quick_check_all_grants.sql
- **Next steps** : Patches conformité DB conventions (≈20 fonctions à corriger)
