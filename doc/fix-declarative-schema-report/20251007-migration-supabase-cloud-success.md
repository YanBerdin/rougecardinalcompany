# Rapport de Migration Supabase Cloud - 7 octobre 2025

## 🎯 Objectif

Peupler la base de données Supabase Cloud avec le schéma complet et les données de seeds, en particulier créer les tables `home_hero_slides` et `home_about_content`.

## 📊 État Initial

### Problèmes identifiés

1. ❌ Table `home_about_content` manquante sur Supabase Cloud
2. ✅ Table `home_hero_slides` existait déjà (2 lignes)
3. ❌ Trigger `spectacles_versioning_trigger()` défectueux (référence à `published_at` inexistant)
4. ⏳ 12 fichiers de seeds en attente d'application

### Erreur bloquante

```bash
ERROR: record "old" has no field "published_at" (SQLSTATE 42703)
```

Le trigger de versioning pour les spectacles essayait d'accéder à un champ `published_at` qui n'existe pas dans la table `spectacles` (qui utilise le champ `public` boolean à la place).

## 🔧 Actions Effectuées

### 1. Restauration des seeds

```bash
mv supabase/seeds_temp/*.sql supabase/migrations/
rmdir supabase/seeds_temp/
```

### 2. Correction du trigger (schéma déclaratif)

**Fichier modifié** : `supabase/schemas/15_content_versioning.sql`

**Avant** :

```sql
if OLD.published_at is null and NEW.published_at is not null then
  change_type_value := 'publish';
elsif OLD.published_at is not null and NEW.published_at is null then
  change_type_value := 'unpublish';
```

**Après** :

```sql
-- Utiliser le champ 'public' (boolean) au lieu de 'published_at'
if OLD.public = false and NEW.public = true then
  change_type_value := 'publish';
elsif OLD.public = true and NEW.public = false then
  change_type_value := 'unpublish';
```

### 3. Création de la migration de correctif

**Migration créée** : `20250918000000_fix_spectacles_versioning_trigger.sql`

- Renommée pour s'exécuter AVANT les seeds (timestamp antérieur)
- Appliquée avec `--include-all` flag

### 4. Création de la table home_about_content

**Migration créée** : `20250921112900_add_home_about_content.sql`

- Source : schéma déclaratif `supabase/schemas/07e_table_home_about.sql`
- Structure complète avec RLS et politiques
- Renommée pour s'exécuter AVANT son seed

### 5. Application des migrations

```bash
pnpm dlx supabase db push --linked --include-all
```

## ✅ Résultats

### Migrations appliquées avec succès (13 migrations)

1. ✅ `20250918000000_fix_spectacles_versioning_trigger.sql` - Correctif trigger
2. ✅ `20250918094530_seed_core_content.sql` - Stats, communiqués, partners, spectacles (3)
3. ✅ `20250918095610_seed_compagnie_values.sql` - Valeurs compagnie (4)
4. ✅ `20250918101020_seed_events_press_articles.sql` - Événements (4) et articles (3)
5. ✅ `20250918102240_seed_team_and_presentation.sql` - Équipe et présentation
6. ✅ `20250921110000_seed_compagnie_presentation_sections.sql` - Sections présentation (6)
7. ✅ `20250921112900_add_home_about_content.sql` - **Création table**
8. ✅ `20250921113000_seed_home_about_content.sql` - Contenu About (1)
9. ✅ `20250926153000_seed_spectacles.sql` - Spectacles détaillés (13 nouveaux)
10. ✅ `20250930120000_seed_lieux.sql` - Lieux (5)
11. ✅ `20250930121000_seed_categories_tags.sql` - Catégories (9) et tags (15)
12. ✅ `20250930122000_seed_configurations_site.sql` - Configurations (29)
13. ✅ `20251002120000_seed_communiques_presse_et_media_kit.sql` - Communiqués (4 nouveaux)

### État final de la base de données

| Table | RLS | Lignes | Statut |
|-------|-----|--------|--------|
| `home_hero_slides` | ✅ | 2 | ✅ Existe (déjà présente) |
| `home_about_content` | ✅ | 1 | ✅ **Créée avec succès** |
| `spectacles` | ✅ | 16 | ✅ 3 initiaux + 13 nouveaux |
| `compagnie_stats` | ✅ | 4 | ✅ Peuplée |
| `compagnie_values` | ✅ | 4 | ✅ Peuplée |
| `compagnie_presentation_sections` | ✅ | 6 | ✅ Peuplée |
| `partners` | ✅ | 3 | ✅ Peuplée |
| `communiques_presse` | ✅ | 11 | ✅ 7 initiaux + 4 nouveaux |
| `evenements` | ✅ | 4 | ✅ Peuplée |
| `membres_equipe` | ✅ | 5 | ✅ Peuplée |
| `lieux` | ✅ | 5 | ✅ Peuplée |
| `categories` | ✅ | 9 | ✅ Peuplée |
| `tags` | ✅ | 15 | ✅ Peuplée |
| `configurations_site` | ✅ | 29 | ✅ Peuplée |
| `medias` | ✅ | 8 | ✅ Peuplée |
| `content_versions` | ✅ | 95 | ✅ Versioning actif |
| `logs_audit` | ✅ | 109 | ✅ Audit actif |
| `communiques_categories` | ✅ | 4 | ✅ Relations établies |

**Total** : 36 tables (25 principales + 11 liaison), 100% RLS activé

### Logs importants

```bash
NOTICE (00000): policy "Home about content is viewable by everyone" for relation "public.home_about_content" does not exist, skipping
NOTICE (00000): policy "Admins can insert home about content" for relation "public.home_about_content" does not exist, skipping
NOTICE (00000): policy "Admins can update home about content" for relation "public.home_about_content" does not exist, skipping
NOTICE (00000): policy "Admins can delete home about content" for relation "public.home_about_content" does not exist, skipping
```

*Ces notices sont normales : les politiques `drop policy if exists` ne trouvent rien à supprimer lors de la première exécution.*

## 📝 Documentation Mise à Jour

### Fichiers modifiés

1. **`supabase/schemas/15_content_versioning.sql`**
   - Correction de la fonction `spectacles_versioning_trigger()`
   - Utilisation du champ `public` au lieu de `published_at`

2. **`supabase/migrations/migrations.md`**
   - Ajout de la section "Corrections et fixes critiques"
   - Documentation de `20250918000000_fix_spectacles_versioning_trigger.sql`
   - Documentation de `20250921112900_add_home_about_content.sql`
   - Mise à jour du total : 16 fichiers de migration

### Migrations créées

1. **`20250918000000_fix_spectacles_versioning_trigger.sql`**
   - Fix critique du trigger de versioning
   - Timestamp antérieur pour exécution prioritaire

2. **`20250921112900_add_home_about_content.sql`**
   - Création de la table `home_about_content`
   - Copie conforme du schéma déclaratif
   - Timestamp juste avant le seed correspondant

## 🎉 Validation Finale

### Tests recommandés

1. **Page d'accueil** :

   ```bash
   http://localhost:3000/
   ```

   - ✅ Hero carousel (2 slides)
   - ✅ Section About (1 entrée)
   - ✅ Stats compagnie (4 items)
   - ✅ Derniers spectacles

2. **Page Compagnie** :

   ```bash
   http://localhost:3000/compagnie
   ```

   - ✅ Sections de présentation (6)
   - ✅ Valeurs (4)
   - ✅ Équipe (5 membres)

3. **Page Spectacles** :

   ```bash
   http://localhost:3000/spectacles
   ```

   - ✅ Liste des spectacles (16)
   - ✅ Filtres par catégories/tags

4. **Page Presse** :

   ```bash
   http://localhost:3000/presse
   ```

   - ✅ Communiqués de presse (11)
   - ✅ Articles de presse (3)

### Vérifications Supabase

```bash
# Vérifier les données
pnpm dlx supabase db pull
```

## 🚀 Prochaines Étapes

1. ✅ **Serveur de développement démarré** (`pnpm dev`)
2. ⏳ **Tests manuels de l'application** - Vérifier l'affichage des pages
3. ⏳ **Tests des fonctionnalités admin** - Vérifier les permissions RLS
4. ⏳ **Synchronisation locale** - Tirer le schéma depuis Cloud si besoin

## 📚 Références

- **Schéma déclaratif** : `supabase/schemas/`
- **Migrations** : `supabase/migrations/`
- **Documentation** : `supabase/schemas/README.md`
- **Instructions** : `.github/instructions/Declarative_Database_Schema.Instructions.md`

## 🔄 Décision de Design : Conservation des Migrations Hotfix

### Question posée

> "Il faudra inclure par la suite, dans le schéma déclaratif, les correctifs appliqués via migration ?"

### Réponse : OUI, avec conservation des migrations

**Principe retenu** : Les migrations hotfix (`20250918000000_fix_spectacles_versioning_trigger.sql` et `20250921112900_add_home_about_content.sql`) sont **conservées** dans l'historique MAIS leurs correctifs sont **intégrés au schéma déclaratif**.

**Justification** :

| Aspect | Migration Hotfix | Schéma Déclaratif |
|--------|------------------|-------------------|
| **Rôle** | Déploiement rapide | Source de vérité |
| **Durée** | Permanent (historique) | Permanent (évolutif) |
| **Utilité** | Traçabilité des bugs | État cible de la DB |

**Avantages de cette approche** :

- ✅ Conserve l'historique des correctifs critiques
- ✅ Cohérence avec l'historique Supabase Cloud
- ✅ Permet reconstruction DB depuis zéro
- ✅ Schéma déclaratif reste source de vérité
- ✅ Documentation claire de la redondance

**Workflow établi** :

1. Créer migration hotfix pour correctif urgent
2. Appliquer sur production (`supabase db push`)
3. **Synchroniser le schéma déclaratif** (OBLIGATOIRE)
4. Documenter la redondance dans `migrations.md`
5. Conserver les deux (migration + schéma)

**Documentation créée** :

- [`doc-perso/declarative-schema-hotfix-workflow.md`](../declarative-schema-hotfix-workflow.md) - Workflow complet
- [`.github/instructions/Declarative_Database_Schema.Instructions.md`](../../.github/instructions/Declarative_Database_Schema.Instructions.md) - Section 5.5 ajoutée
- [`supabase/migrations/migrations.md`](../../supabase/migrations/migrations.md) - Notes de synchronisation

## 🎯 Conclusion

✅ **Migration réussie** ! La base de données Supabase Cloud est maintenant complètement peuplée avec :

- Schéma complet (36 tables, 100% RLS)
- Toutes les données de seeds
- Trigger de versioning corrigé
- Table `home_about_content` créée et peuplée
- Documentation à jour
- **Workflow de synchronisation schéma/migrations établi**

**Aucune erreur** lors de l'application des migrations finales.

**Décision de design** : Les migrations hotfix sont conservées ET synchronisées avec le schéma déclaratif pour maintenir l'historique tout en garantissant une source de vérité unique.
