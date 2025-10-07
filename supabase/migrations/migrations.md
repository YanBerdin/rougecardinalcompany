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
> **Documentation complète** : [`doc-perso/declarative-schema-hotfix-workflow.md`](../../doc-perso/declarative-schema-hotfix-workflow.md)

## Migration principale du schéma déclaratif

- `20250918004849_apply_declarative_schema.sql` — Migration générée du schéma déclaratif principal (DDL)

## Corrections et fixes critiques

- `20250918000000_fix_spectacles_versioning_trigger.sql` — **FIX CRITIQUE** : Correction du trigger `spectacles_versioning_trigger()` pour utiliser le champ `public` (boolean) au lieu de `published_at` (inexistant dans la table spectacles). Ce trigger causait une erreur `record "old" has no field "published_at"` lors des insertions/updates de spectacles.
  - ✅ **Intégré au schéma déclaratif** : `supabase/schemas/15_content_versioning.sql` (déjà corrigé)
  - 📝 **Migration conservée** pour l'historique et la cohérence avec Supabase Cloud

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

### 1) Appliquer le schéma déclaratif

Assure-toi que Supabase Local est démarré:

```bash
pnpm dlx supabase start
pnpm dlx supabase db diff -f apply_declarative_schema
# pnpm dlx supabase db diff -f apply_declarative_schema --debug
pnpm dlx supabase db push
```

### 2) Exécuter les migrations DML horodatées (si besoin de rejouer ponctuellement)

Exécuter une migration DML précise:

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
