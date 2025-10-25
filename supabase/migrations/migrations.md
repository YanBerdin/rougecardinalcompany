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

## Security audit remediation (October 2025)

- `20251025181000_revoke_final_exposed_objects.sql` — **SECURITY : Revoke exposed grants (round 1)** : Révocation des grants à PUBLIC/authenticated sur 5 objets détectés par l'audit CI (content_versions, content_versions_detailed, evenements, home_about_content, information_schema.administrable_role_authorizations). Migration idempotente avec gestion d'erreur via blocs DO.
  - 🔐 **Root cause** : Table-level grants court-circuitent les politiques RLS
  - ✅ **Solution** : Utiliser RLS exclusivement pour le contrôle d'accès
  - 📊 **Impact** : 5 objets sécurisés (0 re-grant nécessaire, RLS policies suffisent)

- `20251025182000_revoke_new_exposed_objects.sql` — **SECURITY : Revoke exposed grants (round 2)** : Révocation des grants à authenticated sur 4 tables supplémentaires (home_hero_slides, lieux, logs_audit, medias). Migration idempotente avec gestion d'erreur.
  - 🔐 **Pattern** : Defense in depth - RLS policies only, no table-level grants
  - ✅ **Validated** : Schéma déclaratif ne contient aucun grant large
  - 📊 **Impact** : 4 objets sécurisés (logs_audit reste admin-only)

- `20251025183000_revoke_membres_messages_views.sql` — **SECURITY : Revoke exposed grants (round 3)** : Révocation des grants à authenticated sur membres_equipe, messages_contact et leurs vues admin associées. Migration idempotente avec gestion d'erreur.
  - 🔐 **Views security** : Toutes les vues admin utilisent SECURITY INVOKER (membres_equipe_admin, messages_contact_admin)
  - ✅ **Access control** : RLS policies + SECURITY INVOKER views = defense in depth
  - 📊 **Impact** : 4 objets sécurisés (2 tables + 2 vues admin)
  - 📝 **Documentation** : Voir `SECURITY_AUDIT_SUMMARY.md` pour détails complets

- `20251025184000_revoke_final_round_partners_profiles.sql` — **SECURITY : Revoke exposed grants (round 4)** : Révocation des grants à authenticated sur partners, profiles et leurs vues admin/tags. Migration idempotente avec gestion d'erreur.
  - 🔐 **Views security** : partners_admin et popular_tags utilisent SECURITY INVOKER
  - ✅ **Core tables** : partners (partenaires actifs) et profiles (profils utilisateurs) sécurisés via RLS uniquement
  - 📊 **Impact** : 4 objets sécurisés (2 tables + 2 vues)

- `20251025185000_revoke_seo_spectacles_final.sql` — **SECURITY : Revoke exposed grants (round 5 - FINAL)** : Révocation des grants à authenticated sur seo_redirects, sitemap_entries, spectacles et spectacles_categories. Re-tentative révocation information_schema. Migration idempotente avec gestion d'erreur.
  - 🔐 **SEO & Core content** : Tables SEO (redirects, sitemap) et spectacles (table principale + junction categories) sécurisées
  - ✅ **System view** : information_schema retry avec gestion warnings (objet système PostgreSQL)
  - 📊 **Impact** : 4 objets sécurisés (3 tables + 1 junction table) + retry info_schema
  - 🎯 **Final status** : 21 objets totaux sécurisés sur 5 rounds de migration

**Total sécurité audit** : 21 objets exposés détectés et corrigés (14 tables + 1 junction + 4 vues admin + 1 vue tags + 1 vue system). Toutes les migrations sont idempotentes et peuvent être rejouées sans effet de bord. Script d'audit : `supabase/scripts/audit_grants.sql` + `analyze_remaining_grants.sh`.

## Corrections et fixes critiques

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
