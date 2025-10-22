# Contexte Actif

## État Actuel du Projet

### Phase en cours

Phase 1 — Vitrine + Schéma déclaratif finalisé. Documentation technique complète (Docker, Supabase, migrations).

### Avancées récentes (Octobre 2025)

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
7. Finaliser Back‑office : toggles centralisés, CRUD étendus (spectacles, événements, articles)
8. Configuration finale webhooks Resend (dashboard)

### Problèmes résolus

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

- Cohérence des états de toggles entre back‑office et pages publiques
- Retirer les délais artificiels (1200-1500ms) des containers avant production
- Monitoring Docker disk usage en croissance (si utilisation de Supabase local)
- Synchronisation des dates de visibilité du hero et du cache ISR
- Configuration finale webhooks Resend dans le dashboard (pointer vers `/api/webhooks/resend`)
- Vérifier la configuration des clés Supabase en production (format JWT vs Simplified)
- **NOUVEAU (22 octobre)** : Next.js Image hostname configuré pour Supabase Storage (`yvtrlvmbofklefxcxrzv.supabase.co`) - requiert restart serveur

## Décisions Récentes

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

**Date**: 22 octobre 2025
**Par**: GitHub Copilot
**Changements majeurs**:

- TASK022 Team Management complété à 100% (Médiathèque fonctionnelle, Storage bucket déployé)
- Migration Supabase Cloud appliquée avec succès (`20251022000001_create_medias_storage_bucket.sql`)
- Schéma déclaratif synchronisé (`supabase/schemas/02c_storage_buckets.sql`)
- Admin Dashboard opérationnel (layout, statistiques, navigation)
- Upload photos membres équipe avec validation, Storage, preview, rollback
- Next.js Image hostname configuré pour Supabase Storage
- Production-ready : TypeScript OK, ESLint clean, debug logs supprimés
