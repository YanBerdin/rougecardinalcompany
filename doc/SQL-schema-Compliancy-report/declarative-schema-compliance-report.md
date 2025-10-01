# Rapport de Conformité - Schéma Déclaratif Supabase

**Date** : 2 octobre 2025  
**Projet** : Rouge Cardinal Company  
**Référence** : `.github/copilot/Declarative_Database_Schema.Instructions.md`

---

## 📊 Résumé Exécutif

**Statut** : ✅ **100% CONFORME**

Le projet respecte intégralement les principes du schéma déclaratif Supabase après la correction d'une violation architecturale mineure.

### Métriques de Conformité

| Critère | Résultat | Conformité |
|---------|----------|------------|
| Tables via workflow déclaratif | 36/36 | ✅ 100% |
| Organisation lexicographique | 33/33 fichiers | ✅ 100% |
| DML seeds avec caveats | 11/11 | ✅ 100% |
| Migrations DDL manuelles | 0 violation | ✅ 100% |
| Triggers centralisés | 100% | ✅ 100% |
| **Score global** | **100%** | ✅ |

---

## 🎯 Instructions de Référence

### 1. Exclusive Use of Declarative Schema

> **All database schema modifications must be defined within `.sql` files located in the `supabase/schemas/` directory. Do not create or modify files directly in the `supabase/migrations/` directory unless the modification is about the known caveats below.**

**Conformité** : ✅ **100%**

- 36/36 tables définies dans `supabase/schemas/`
- Aucune création DDL manuelle dans `supabase/migrations/`
- Migration principale générée via `supabase db diff -f apply_declarative_schema`

### 2. Schema Declaration

> **For each database entity (e.g., tables, views, functions), create or update a corresponding `.sql` file in the `supabase/schemas/` directory**

**Conformité** : ✅ **100%**

Tous les fichiers schéma suivent la convention :

- `01_extensions.sql` : Extensions PostgreSQL
- `02_*` : Tables principales (profiles, medias, etc.)
- `07e_table_home_about.sql` : Table home_about_content
- `20-21_functions_*` : Fonctions métier
- `30_triggers.sql` : Triggers centralisés
- `40_indexes.sql`, `50_constraints.sql` : Optimisations
- `60-62_rls_*` : Politiques RLS

### 3. Migration Generation

> **Generate migration files by diffing the declared schema against the current database state**

**Conformité** : ✅ **100%**

- Migration principale : `20250918004849_apply_declarative_schema.sql` (générée)
- Processus : `supabase stop` → `supabase db diff -f <name>` → `supabase db push`

### 4. Schema File Organization

> **Schema files are executed in lexicographic order. To manage dependencies (e.g., foreign keys), name files to ensure correct execution order**

**Conformité** : ✅ **100%**

Ordre respecté :

```bash
01_extensions.sql
02_table_profiles.sql
02b_functions_core.sql
03_table_medias.sql
04_table_membres_equipe.sql
05_table_lieux.sql
06_table_spectacles.sql
07_table_evenements.sql
07b_table_compagnie_content.sql
07c_table_compagnie_presentation.sql
07d_table_home_hero.sql
07e_table_home_about.sql  ← Triggers définis dans 30_triggers.sql
08_table_articles_presse.sql
...
30_triggers.sql           ← Gestion centralisée des triggers
40_indexes.sql
50_constraints.sql
60-62_rls_*.sql
```

### 5. Known Caveats

> **If you need to use any of the entities below, remember to add them through versioned migrations instead.**

**Conformité** : ✅ **100%**

Caveats respectés :

- ✅ **DML** : 11 seeds horodatés dans `supabase/migrations/`
- ✅ **View ownership** : N/A (pas de cas spécifique)
- ✅ **RLS policies** : Gérées dans schéma déclaratif (60-62_rls_*.sql)

---

## 📋 Analyse Détaillée

### Architecture des Triggers (Cas d'Étude)

**Question initiale** : Faut-il ajouter les triggers dans `07e_table_home_about.sql` ?

**Réponse** : ❌ **NON**

**Justification** :

### 1. **Centralisation** : `30_triggers.sql` applique automatiquement les triggers via boucles dynamiques

```sql
-- Extrait de 30_triggers.sql
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN SELECT unnest(array[
    'public.profiles', 'public.medias', ..., 'public.home_about_content'
  ])
  LOOP
    EXECUTE format('drop trigger if exists trg_update_updated_at on %s;', tbl);
    EXECUTE format('create trigger trg_update_updated_at
      before update on %s
      for each row
      execute function public.update_updated_at_column();', tbl);
  END LOOP;
END;
$$;
```

### 2. **Ordre d'exécution**

- `07e_table_home_about.sql` s'exécute avant `30_triggers.sql` (ordre lexicographique)
- La table existe AVANT l'application des triggers ✅

### 3. **Avantages**

- **DRY** : Un seul endroit pour modifier les triggers
- **Maintenance** : Ajout d'une nouvelle table = une ligne dans le array
- **Cohérence** : Tous les triggers suivent le même pattern

### Violation Corrigée

**Fichier supprimé** : `20250921112000_add_home_about_content.sql`

**Nature de la violation** : Création DDL manuelle alors que le schéma déclaratif existe

**Chronologie** :

```bash
2025-09-20 : Création de supabase/schemas/07e_table_home_about.sql (✅ conforme)
2025-09-21 : Création de 20250921112000_add_home_about_content.sql (❌ violation)
             └─ Commentaire : "to match declarative schema 07e_table_home_about.sql"
2025-10-02 : Suppression de 20250921112000_add_home_about_content.sql (✅ correction)
```

**Conséquences corrigées** :

- ✅ Suppression de la duplication (table définie dans 2 endroits)
- ✅ Source de vérité unique (`07e_table_home_about.sql`)
- ✅ Documentation mise à jour (README-migrations.md : 13 fichiers au lieu de 14)

---

## 📈 Statistiques Finales

### Répartition des Fichiers

| Type | Nombre | Emplacement |
|------|--------|-------------|
| Schémas déclaratifs | 33 | `supabase/schemas/*.sql` |
| Migration DDL générée | 1 | `supabase/migrations/20250918004849_*.sql` |
| Seeds DML | 11 | `supabase/migrations/202509*.sql` |
| Migration manuelle | 1 | `supabase/migrations/sync_existing_profiles.sql` |
| **Total migrations** | **13** | - |

### Tables Couvertes

| Catégorie | Nombre | Exemples |
|-----------|--------|----------|
| Tables principales | 25 | profiles, spectacles, evenements, medias |
| Tables de liaison | 11 | spectacles_categories, articles_medias |
| **Total** | **36** | **100% via schéma déclaratif** |

### Triggers Centralisés

| Type | Tables | Fonction |
|------|--------|----------|
| updated_at | 14 | `update_updated_at_column()` |
| audit | 14 | `audit_trigger()` |
| Spécialisés | 3 | consent, slug, usage_count |

---

## ✅ Checklist de Conformité

- [x] Tous les DDL dans `supabase/schemas/`
- [x] Migration principale générée via `db diff`
- [x] Ordre lexicographique respecté
- [x] Triggers centralisés dans `30_triggers.sql`
- [x] DML seeds horodatés avec caveats
- [x] Documentation synchronisée
- [x] Aucune migration DDL manuelle
- [x] Source de vérité unique pour chaque entité

---

## 🔧 Maintenance Future

### Pour Ajouter une Nouvelle Table

```bash
# 1. Créer le fichier schéma déclaratif
vim supabase/schemas/08f_table_nouvelle_entite.sql

# 2. Ajouter la table dans le trigger centralisé (si besoin updated_at/audit)
vim supabase/schemas/30_triggers.sql
# Ajouter 'public.nouvelle_entite' dans le array

# 3. Générer la migration
supabase stop
supabase db diff -f add_nouvelle_entite

# 4. Vérifier le diff
cat supabase/migrations/<timestamp>_add_nouvelle_entite.sql

# 5. Appliquer
supabase db push
```

### Pour Modifier une Table Existante

```bash
# 1. Modifier le schéma déclaratif
vim supabase/schemas/07e_table_home_about.sql

# 2. Générer la migration
supabase stop
supabase db diff -f update_home_about_content

# 3. Vérifier et appliquer
cat supabase/migrations/<timestamp>_update_home_about_content.sql
supabase db push
```

### Checklist Pré-Migration

- [ ] Schéma déclaratif modifié dans `supabase/schemas/`
- [ ] `supabase stop` exécuté
- [ ] Migration générée via `db diff`
- [ ] Diff vérifié manuellement
- [ ] Testé en local avant production
- [ ] Documentation mise à jour

---

## 📚 Références

- [Instruction principale](.github/copilot/Declarative_Database_Schema.Instructions.md)
- [README Schémas](../supabase/schemas/README.md)
- [README Migrations](../supabase/migrations/README-migrations.md)
- [Knowledge Base](.github/copilot/knowledge-base-170825-0035.md)

---

**Dernière mise à jour** : 2 octobre 2025  
**Responsable** : Architecture Database  
**Statut** : ✅ Validé - 100% Conforme
