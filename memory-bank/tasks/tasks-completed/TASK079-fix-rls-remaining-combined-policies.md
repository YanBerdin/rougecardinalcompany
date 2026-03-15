# TASK079 : Fix Remaining RLS Policies `to anon, authenticated` — Batch 2

**Status:** Completed
**Added:** 2026-03-15
**Updated:** 2026-03-15
**Depends on:** TASK077 (Completed — batch 1, 13 tables, migration `20260315001500`)

## Original Request

Suite de TASK077. Séparer les policies RLS restantes qui combinent `to anon, authenticated` en policies distinctes par rôle.

**Instruction** Create_migration.instructions.md :
> **"RLS Policies should be granular: one policy for select, one for insert etc and for each supabase role (anon and authenticated). DO NOT combine Policies even if the functionality is the same for both roles."**

---

## Inventaire des violations (21 policies dans 17 tables — 10 fichiers schema)

### Fichier `10_tables_system.sql` — 5 policies (3 tables)

| Table | Ligne | Policy | Type |
| ------- | ------- | -------- | ------ |
| `abonnes_newsletter` | 139 | `Anyone can check email existence for duplicates` | SELECT |
| `abonnes_newsletter` | 151 | `Subscribers can unsubscribe or admins can delete` | DELETE |
| `abonnes_newsletter` | 199 | `Validated newsletter subscription` | INSERT |
| `messages_contact` | 173 | `Validated contact submission` | INSERT |
| `configurations_site` | 266 | `Public site configurations are viewable by everyone` | SELECT |

> Note : ligne 301 est un `GRANT SELECT` — les GRANTs avec rôles combinés sont acceptables en PostgreSQL, seules les policies doivent être séparées.

### Fichier `11_tables_relations.sql` — 4 policies (4 tables)

| Table | Ligne | Policy | Type |
| ------- | ------- | -------- | ------ |
| `spectacles_medias` | 62 | `Spectacle media relations are viewable by everyone` | SELECT |
| `articles_medias` | 95 | `Article media relations are viewable by everyone` | SELECT |
| `spectacles_membres_equipe` | 128 | `Spectacle member relations are viewable by everyone` | SELECT |
| `communiques_medias` | 161 | `Press release media relations follow parent visibility` | SELECT |

### Fichier `14_categories_tags.sql` — 2 policies (2 tables)

| Table | Ligne | Policy | Type |
| ------- | ------- | -------- | ------ |
| `communiques_categories` | 149 | `Press release categories follow parent visibility` | SELECT |
| `communiques_tags` | 187 | `Press release tags follow parent visibility` | SELECT |

### Fichier `07b_table_compagnie_content.sql` — 2 policies (2 tables)

| Table | Ligne | Policy | Type |
| ------- | ------- | -------- | ------ |
| `compagnie_values` | 54 | `Compagnie values are viewable by everyone` | SELECT |
| `compagnie_stats` | 81 | `Compagnie stats are viewable by everyone` | SELECT |

### Fichier `07c_table_compagnie_presentation.sql` — 1 policy

| Table | Ligne | Policy | Type |
| ------- | ------- | -------- | ------ |
| `compagnie_presentation_sections` | 48 | SELECT combinée | SELECT |

### Fichier `07d_table_home_hero.sql` — 1 policy

| Table | Ligne | Policy | Type |
| ------- | ------- | -------- | ------ |
| `home_hero_slides` | 94 | SELECT combinée | SELECT |

### Fichier `07e_table_home_about.sql` — 1 policy

| Table | Ligne | Policy | Type |
| ------- | ------- | -------- | ------ |
| `home_about_content` | 38 | SELECT combinée | SELECT |

### Fichier `08b_communiques_presse.sql` — 1 policy

| Table | Ligne | Policy | Type |
| ------- | ------- | -------- | ------ |
| `communiques_presse` | 83 | SELECT combinée | SELECT |

### Fichier `04_table_membres_equipe.sql` — 1 policy

| Table | Ligne | Policy | Type |
| ------- | ------- | -------- | ------ |
| `membres_equipe` | 31 | SELECT combinée | SELECT |

### Fichier `05_table_lieux.sql` — 1 policy

| Table | Ligne | Policy | Type |
| ------- | ------- | -------- | ------ |
| `lieux` | 30 | SELECT combinée | SELECT |

### Fichier `12_evenements_recurrence.sql` — 1 policy

| Table | Ligne | Policy | Type |
| ------- | ------- | -------- | ------ |
| (table récurrence) | 74 | SELECT combinée | SELECT |

---

## Problèmes additionnels détectés

### Duplicate policies (TASK076 rename sans drop)

Détectées lors de la tentative `supabase db diff` de TASK077 :

| Table | Policy ancienne (en DB) | Policy nouvelle (en DB) | Action requise |
| ------- | ------------------------ | ------------------------ | --------------- |
| `communiques_presse` | `View press releases (public OR admin all)` | `View press releases (public OR editor+ all)` | Drop ancienne |
| `compagnie_presentation_sections` | `View presentation sections (public active OR admin all)` | `View presentation sections (public active OR editor+ all)` | Drop ancienne |

Ces duplicates viennent de TASK076 (rename `admin` → `editor+`) où la migration n'a pas drop l'ancienne policy.

### GRANT SELECT combinés (informatif — pas de violation)

Les fichiers suivants contiennent des `GRANT SELECT ... TO anon, authenticated` qui sont acceptables :

- `10_tables_system.sql:301` (configurations_site)
- `41_views_spectacle_photos.sql:58-60, 63` (views)
- `42_views_spectacle_gallery.sql:58` (view)

---

## Contexte technique

### Leçons de TASK077

- `supabase db diff` génère des changements parasites (drops de policies gérées par hotfix, rebuild de views, recreate de fonctions). **Préférer une migration manuelle ciblée**.
- Vérifier l'output complet du diff avant application.
- Les policies `analytics_events INSERT` sont gérées par hotfix migration et ne sont PAS dans le schema déclaratif — NE PAS toucher.

### Pattern de migration recommandé

```sql
-- Drop combinée
drop policy if exists "Old combined policy name" on public.table_name;

-- Create séparée anon
create policy "Anon can view table_name"
on public.table_name
for select
to anon
using ( ... );

-- Creat séparée authenticated
create policy "Authenticated can view table_name"
on public.table_name
for select
to authenticated
using ( ... );
```

---

## Implementation Plan

### Phase 1 — Modifier les 10 fichiers schema (P1 : perf + P2 : conformité)

1. `10_tables_system.sql` — abonnes_newsletter (3), messages_contact (1), configurations_site (1)
2. `11_tables_relations.sql` — 4 junction tables
3. `14_categories_tags.sql` — communiques_categories, communiques_tags
4. `07b_table_compagnie_content.sql` — compagnie_values, compagnie_stats
5. `07c_table_compagnie_presentation.sql` — presentation_sections
6. `07d_table_home_hero.sql` — home_hero_slides
7. `07e_table_home_about.sql` — home_about_content
8. `08b_communiques_presse.sql` — communiques_presse
9. `04_table_membres_equipe.sql` — membres_equipe
10. `05_table_lieux.sql` — lieux
11. `12_evenements_recurrence.sql` — table récurrence

### Phase 2 — Corriger duplicates TASK076

12. Drop les anciennes policies dupliquées (communiques_presse, compagnie_presentation_sections)

### Phase 3 — Migration manuelle ciblée

13. Écrire migration manuelle (pas `supabase db diff`) — comme TASK077
14. Tester avec `supabase db reset`
15. Vérifier avec requête pg_policies

---

## Progress Tracking

**Overall Status:** Completed — 100%

### Subtasks

| ID | Description | Status | Updated | Notes |
| ---- | ------------- | -------- | --------- | ------- |
| 1 | Modifier schemas 10_tables_system.sql | Complete | 2026-03-15 | 5 policies (3 tables) |
| 2 | Modifier schemas 11_tables_relations.sql | Complete | 2026-03-15 | 4 policies (4 tables) |
| 3 | Modifier schemas 14_categories_tags.sql | Complete | 2026-03-15 | 2 policies |
| 4 | Modifier schemas 07b/07c/07d/07e | Complete | 2026-03-15 | 5 policies (5 tables) |
| 5 | Modifier schemas 04/05/08b/12 | Complete | 2026-03-15 | 4 policies (4 tables) |
| 6 | Corriger duplicates TASK076 | Complete | 2026-03-15 | 2 policies droppées dans schemas + migration |
| 7 | Écrire migration manuelle | Complete | 2026-03-15 | `20260315000238_fix_rls_separate_anon_authenticated_batch2.sql` |
| 8 | Tester db reset + vérifier pg_policies | Complete | 2026-03-15 | 0 rows combinées, 40 anon + 162 authenticated |

## Progress Log

### 2026-03-15

- Création de la tâche suite à TASK077 batch 1
- Inventaire complet : 21 policies dans 17 tables (10 fichiers schema)
- Détection de 2 duplicates TASK076 (communiques_presse + compagnie_presentation_sections)
- Leçon TASK077 : préférer migration manuelle au `supabase db diff`

### 2026-03-15 (exécution)

- Modifié 11 fichiers schema (20 replacements en 3 batches, tous réussis)
- Vérifié grep : zéro `to anon, authenticated` restant dans CREATE POLICY (seuls les GRANT restent)
- Migration manuelle écrite : `20260315000238_fix_rls_separate_anon_authenticated_batch2.sql`
  - 21 vieilles policies DROP + 42 nouvelles CREATE (2 par violation)
  - Cleanup TASK076 duplicates inclus
  - DO $$ block conditionnel pour events_recurrence
- `supabase db reset` : succès, aucune erreur
- Vérification pg_policies : `SELECT ... WHERE roles::text LIKE '%{anon,authenticated}%'` → **0 rows**
- Distribution finale : 40 policies anon + 162 policies authenticated
- Design decisions :
  - Policies simples (using true) : identiques pour anon et authenticated
  - Policies complexes : anon reçoit la version simplifiée (sans fonctions de rôle qui retournent toujours false pour anon)
  - Exception : abonnes_newsletter DELETE garde `is_admin()` pour anon (parité comportementale)
