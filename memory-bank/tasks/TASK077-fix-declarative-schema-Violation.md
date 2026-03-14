# TASK077 : Fix Violation MIG-005 : `to anon, authenticated` combiné (Majeure)

**Status:** Pending
**Added:** 2026-03-09
**Updated:** 2026-03-14

## Original Request

Séparer les policies RLS qui combinent `to anon, authenticated` en policies distinctes par rôle, conformément aux instructions du projet.

**Instruction** Create_migration.instructions.md :
> **"RLS Policies should be granular: one policy for select, one for insert etc and for **each supabase role** (anon and authenticated). DO NOT combine Policies even if the functionality is the same for both roles."**

---

## Audit complet (révisé 2026-03-14)

### Tables en violation — Total : 13

#### P1 — Impact performance réel (function évaluée inutilement pour `anon`)

| Table | Fichier | Policy SELECT actuelle | Fonction évaluée pour anon |
| ------- | --------- | ---------------------- | --------------------------- |
| `spectacles` | 61_rls_main_tables.sql | `to anon, authenticated` | `has_min_role('editor')` |
| `partners` | 61_rls_main_tables.sql | `to anon, authenticated` | `is_admin()` |
| `categories` | 62_rls_advanced_tables.sql | `to anon, authenticated` | `has_min_role('editor')` |

> Séparer les policies permet à PostgreSQL de sauter l'évaluation des fonctions pour les requêtes `anon`, conformément à la recommandation Supabase :
> **"This prevents the policy from running for any anon users, since the execution stops at the to authenticated step."**

#### P2 — Conformité standards uniquement (condition triviale `using ( true )` ou simple)

| Table | Fichier | Policy SELECT actuelle |
| ------- | --------- | ---------------------- |
| `medias` | 61_rls_main_tables.sql | `to anon, authenticated` + `using ( true )` |
| `evenements` | 61_rls_main_tables.sql | `to anon, authenticated` + `using ( true )` |
| `profiles` | 60_rls_profiles.sql | `to anon, authenticated` + `using ( true )` |
| `tags` | 62_rls_advanced_tables.sql | `to anon, authenticated` + `using ( true )` |
| `spectacles_categories` | 62_rls_advanced_tables.sql | `to anon, authenticated` + `using ( true )` |
| `spectacles_tags` | 62_rls_advanced_tables.sql | `to anon, authenticated` + `using ( true )` |
| `articles_categories` | 62_rls_advanced_tables.sql | `to anon, authenticated` + `using ( true )` |
| `articles_tags` | 62_rls_advanced_tables.sql | `to anon, authenticated` + `using ( true )` |
| `sitemap_entries` | 62_rls_advanced_tables.sql | `to anon, authenticated` + `using ( is_indexed = true )` |
| `articles_presse` | 08_table_articles_presse.sql | `to anon, authenticated` + `using ( published_at is not null )` |

### Tables déjà conformes (référence)

- `media_tags` : 61_rls_main_tables.sql — policies `anon` et `authenticated` séparées
- `media_folders` : 61_rls_main_tables.sql — idem
- `media_item_tags` : 61_rls_main_tables.sql — idem

---

## Exemples de correction

### `spectacles` (P1 — impact perf)

```sql
-- anon: seulement publié/archivé (pas d'évaluation has_min_role)
create policy "Anon can view public spectacles"
on public.spectacles
for select
to anon
using (
  public = true
  and status in ('published', 'archived')
);

-- authenticated: publié/archivé OU editor+
create policy "Authenticated can view spectacles"
on public.spectacles
for select
to authenticated
using (
  (
    public = true
    and status in ('published', 'archived')
  )
  or (select public.has_min_role('editor'))
);
```

### `medias` (P2 — conformité, condition triviale)

```sql
create policy "Anon can view medias"
on public.medias
for select
to anon
using ( true );

create policy "Authenticated can view medias"
on public.medias
for select
to authenticated
using ( true );
```

---

## Observation mineure : GRANT SELECT retiré sur `articles_presse_public`

Le fichier `08_table_articles_presse.sql` contient deux NOTE indiquant que `GRANT SELECT` a été retiré pour le CI audit. La vue `articles_presse_public` est `SECURITY INVOKER` — elle nécessite que le rôle appelant ait accès à la table de base via RLS policy. Vérifier que les policies RLS sur `articles_presse` suffisent pour que `anon` accède aux articles publiés via la vue.

---

## Actions recommandées

| Priorité | Action | Fichiers | Effort |
| ---------- | -------- | ---------- | -------- |
| P1 | Séparer policies `to anon, authenticated` avec impact perf (3 tables) | 61_rls_main_tables.sql + 62_rls_advanced_tables.sql | 15 min |
| P2 | Séparer policies `to anon, authenticated` conformité seule (10 tables) | 60_rls_profiles.sql + 61_rls_main_tables.sql + 62_rls_advanced_tables.sql + 08_table_articles_presse.sql | 25 min |
| P3 | Vérifier que les grants par défaut couvrent la vue `articles_presse_public` | Schema ou migration | 5 min |

## Progress Log

### 2026-03-09

- Création initiale de la task avec 5 tables identifiées

### 2026-03-14

- Re-audit complet des fichiers schema (60, 61, 62, 08)
- Correction : `spectacles` utilise `has_min_role('editor')` et non `is_admin()` — exemple mis à jour
- Ajout de 8 tables manquantes dans l'audit initial (total : 13 tables)
- Ajout de `categories` (62_rls_advanced_tables.sql) en P1 (impact perf, fn évaluée pour anon)
- Séparation P1 (impact perf : 3 tables) vs P2 (conformité seule : 10 tables)
