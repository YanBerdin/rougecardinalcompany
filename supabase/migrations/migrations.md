# Migrations - Rouge Cardinal Company

Ce dossier contient les migrations spécifiques (DML/DDL ponctuelles) exécutées en complément du schéma déclaratif.

## 📋 Dernières Migrations

### 2026-01-17 - FEAT: Analytics Summary 90 Days View (TASK031)

**Migration**: `20260116232648_analytics_summary_90days.sql`

**Sévérité**: 🟢 **LOW RISK** - Nouvelle vue (pas de modification de données existantes)

**Source**: TASK031 - Analytics Dashboard

**Ajouts**:

1. **Vue `analytics_summary_90d`**:
   - Extension de la rétention à 90 jours (vs 30 jours pour `analytics_summary`)
   - SECURITY INVOKER pour respecter RLS
   - Agrégation par event_type, entity_type, date

2. **Permissions**:
   - Owner: `admin_views_owner`
   - REVOKE: anon, authenticated
   - GRANT: service_role uniquement

**Validation**:

- ✅ Migration appliquée localement: 2026-01-17
- ✅ Migration appliquée sur cloud: 2026-01-17
- ✅ Schema déclaratif synchronisé: `supabase/schemas/13_analytics_events.sql`

**Fichiers Associés**:

- Migration: `20260116232648_analytics_summary_90days.sql`
- Schema: `supabase/schemas/13_analytics_events.sql`
- Task: `memory-bank/tasks/TASK031-analytics-dashboard.md`
- Plan: `.github/prompts/plan-TASK031-analyticsDashboard.prompt.md`

---

### 2026-01-16 - PERF: Partial Index on spectacles.slug (TASK034)

**Migration**: `20260116145628_optimize_spectacles_slug_index.sql`

**Sévérité**: 🟢 **LOW RISK** - Performance (nouvel index partiel, pas de modification de données)

**Source**: TASK034 Phase 4 - Performance Optimization

**Changements**:

1. **Drop ancien index complet**:

   ```sql
   drop index if exists public.idx_spectacles_slug;
   ```

2. **Création index partiel optimisé**:

   ```sql
   create index if not exists idx_spectacles_slug_published
   on public.spectacles(slug)
   where status = 'published';
   ```

**Raison**: L'index complet sur `spectacles.slug` indexait toutes les lignes (draft, archived, published). L'index partiel ne couvre que les spectacles publiés, réduisant la taille de l'index et accélérant les requêtes publiques les plus fréquentes.

**Validation**:

- ✅ Migration appliquée localement: 2026-01-16
- ✅ Migration appliquée sur cloud: 2026-01-16
- ✅ Schema déclaratif synchronisé: `supabase/schemas/06_table_spectacles.sql`

**Fichiers Associés**:

- Migration: `20260116145628_optimize_spectacles_slug_index.sql`
- Schema: `supabase/schemas/06_table_spectacles.sql`
- Task: `memory-bank/tasks/TASK034-performance-optimization.md`
- Plan: `.github/prompts/plan-TASK034-performanceOptimization.prompt.md`

---

### 2026-01-14 - FEAT: Add Backups Storage Bucket (TASK050)

**Migration**: `20260114152153_add_backups_storage_bucket.sql`

**Sévérité**: 🟢 **LOW RISK** - Nouvelle fonctionnalité (pas de modification existante)

**Source**: TASK050 - Database Backup & Recovery Strategy

**Ajouts**:

1. **Bucket Storage `backups`**:
   - Bucket privé (public = false)
   - Limite: 500 MB par fichier
   - Accès: service_role uniquement

2. **3 Politiques RLS Storage**:
   - `service_role can upload backups` (INSERT)
   - `service_role can read backups` (SELECT)
   - `service_role can delete backups` (DELETE)

**Validation**:

- ✅ Migration appliquée sur production: 2026-01-14
- ✅ Workflow GitHub Actions testé avec succès
- ✅ Premier backup créé et uploadé

**Fichiers Associés**:

- Script: `scripts/backup-database.ts`
- Workflow: `.github/workflows/backup-database.yml`
- Schema déclaratif: `supabase/schemas/02c_storage_buckets.sql`
- Runbook: `memory-bank/tasks/TASK050_RUNBOOK_PITR_restore.md`

---

### 2026-01-11 - FIX: Restore medias.folder_id After Accidental Drop

**Migration**: `20260111120000_restore_medias_folder_id_final.sql`

**Sévérité**: 🔴 **CRITICAL** - Colonne requise pour Media Library (TASK029)

**Source**: Erreur `column medias.folder_id does not exist` après `db reset` (local ou cloud).

**Problème Détecté**:

La migration `20260103183217_audit_logs_retention_and_rpc.sql` (générée par `db pull`) contenait un `DROP COLUMN folder_id` :

```sql
-- ❌ Code problématique (20260103183217)
alter table "public"."medias" drop column "folder_id";
```

**Impact**:

- ❌ Page `/admin/media/library` cassée après tout `db reset`
- ❌ Colonne `folder_id` supprimée après les migrations qui l'ajoutaient
- ❌ FK et index également supprimés

**Solution Appliquée**:

Nouvelle migration finale + mise à jour du schéma déclaratif :

```sql
-- ✅ Migration 20260111120000
alter table public.medias
  add column if not exists folder_id bigint;

alter table public.medias
  add constraint medias_folder_id_fkey
  foreign key (folder_id) references public.media_folders(id)
  on delete set null not valid;

create index if not exists medias_folder_id_idx on public.medias(folder_id);

-- Auto-assign folder_id from storage_path prefix
update public.medias m
set folder_id = (
  select f.id from public.media_folders f
  where f.slug = split_part(m.storage_path, '/', 1)
)
where m.folder_id is null;
```

**Validation**:

- ✅ `db reset` local : folder_id présent après reset
- ✅ Schéma déclaratif mis à jour : `03_table_medias.sql` + `04_table_media_tags_folders.sql`
- ✅ FK et index recréés
- ✅ Auto-assignment folder_id basé sur storage_path prefix

**Déploiement**:

- Date : 2026-01-11
- Environnement : Local (cloud à pousser via `db push`)
- Rollback : Aucun nécessaire

**Fichiers Modifiés**:

- Migration : `20260111120000_restore_medias_folder_id_final.sql`
- Schema déclaratif : `supabase/schemas/03_table_medias.sql` (ajout folder_id column)
- Schema déclaratif : `supabase/schemas/04_table_media_tags_folders.sql` (ajout FK + index)
- Documentation : `migrations.md`, `schemas/README.md`, `memory-bank/`

**Leçons Apprises**:

- ⚠️ Les migrations générées par `db pull` peuvent contenir des `DROP COLUMN` inattendus
- ✅ Toujours vérifier les diffs avant de committer une migration générée
- ✅ Le schéma déclaratif doit refléter l'état final souhaité pour que `db reset` fonctionne

---

### 2026-01-10 - FIX: Audit Trigger Support for Tables Without `id` Column

**Migration**: `20260110011128_fix_audit_trigger_no_id_column.sql`

**Sévérité**: 🟠 **MEDIUM** - Bug critique affectant tous les display toggles

**Source**: Erreur `[ERR_CONFIG_003] record "new" has no field "id"` rapportée sur tous les toggles de configuration.

**Problème Détecté**:

La fonction `audit_trigger()` (utilisée par 14 tables) accédait directement au champ `new.id` :

```sql
-- ❌ Code problématique (ligne ~119 de 02b_functions_core.sql)
record_id_text := coalesce(new.id::text, null);
```

**Impact**:

- ❌ Table `configurations_site` utilise `key` (text) comme PK, pas `id`
- ❌ Toute opération INSERT/UPDATE/DELETE sur toggles échouait avec erreur PostgreSQL
- ❌ Admin incapable de modifier les configurations du site

**Solution Appliquée**:

Utilisation de l'opérateur JSON avec fallback chain pour supporter tous les types de PK :

```sql
-- ✅ Code corrigé
record_id_text := coalesce(
  (to_json(new) ->> 'id'),    -- Tables avec id column
  (to_json(new) ->> 'key'),   -- Tables comme configurations_site
  (to_json(new) ->> 'uuid'),  -- Tables avec uuid
  null
);
```

**Validation**:

- ✅ Toggles testés sur cloud : WORKING (10 toggles across 5 categories)
- ✅ Schema déclaratif synchronisé : `supabase/schemas/02b_functions_core.sql`
- ✅ Admin user recréé après reset accidentel
- ✅ Vérification data integrity : 16 spectacles, 2 hero slides, 3 partners, 5 team members
- ✅ Script créé : `check-cloud-data.ts` pour validation post-reset

**Déploiement**:

- Date : 2026-01-10 01:11 UTC
- Environnement : ~~Local~~ + Cloud (accidental `db reset --linked` on production)
- Rollback : Aucun rollback nécessaire (fix validé)

**Pattern Appliqué**: JSON operator safe field access pour fonctions génériques

**Fichiers Modifiés**:

- Migration : `20260110011128_fix_audit_trigger_no_id_column.sql`
- Schema déclaratif : `supabase/schemas/02b_functions_core.sql` (line ~119)
- Nouveau script : `scripts/check-cloud-data.ts`
- Documentation : `migrations.md`, `scripts/README.md`, `memory-bank/`

**Leçons Apprises**:

- ⚠️ `db reset --linked` affecte la production - utiliser avec extrême prudence
- ✅ JSON operators (`to_json(record) ->> 'field'`) permettent l'accès sécurisé aux champs dynamiques
- ✅ Scripts de vérification data integrity critiques après opérations destructrices

---

### 2026-01-07 - PERF: Fix Duplicate RLS Policies on Categories

**Migration**: `20260107140000_fix_categories_duplicate_select_policies.sql`

**Sévérité**: 🟢 **LOW RISK** - Performance (réduction overhead RLS)

**Source**: Audit post-déploiement de `20260107123000` - table `categories` détectée avec 2 politiques SELECT permissives pour le même rôle.

**Problème Détecté**:

La table `public.categories` avait **2 politiques SELECT permissives** évaluées à chaque requête :

```sql
-- Policy 1
create policy "Active categories are viewable by everyone"
on public.categories for select
to anon, authenticated
using ( is_active = true );

-- Policy 2  
create policy "Admins can view all categories"
on public.categories for select
to authenticated
using ( (select public.is_admin()) );
```

**Impact**:

- CPU overhead : PostgreSQL évalue les 2 politiques pour chaque SELECT (même si l'une suffit)
- Ambiguïté : Logique de permission répartie entre 2 règles
- Maintenance : Modifications nécessitent 2 changements synchronisés

**Solution Appliquée**:

Fusion des 2 politiques en **1 seule avec logique OR** :

```sql
drop policy if exists "Active categories are viewable by everyone" on public.categories;
drop policy if exists "Admins can view all categories" on public.categories;

create policy "View categories (active OR admin)"
on public.categories
for select
to anon, authenticated
using ( is_active = true or (select public.is_admin()) );
```

**Validation**:

- ✅ **26/26 tests sécurité** (13 vues + 13 RLS WITH CHECK)
- ✅ Tests locaux PASSED
- ✅ Tests cloud PASSED

**Déploiement**:

- Date : 2026-01-07 14:00 UTC
- Environnement : Local + Cloud
- Rollback : Aucun problème détecté

**Pattern Appliqué**: Suit Phase 3 de l'optimisation performance (6 autres tables optimisées de la même manière).

**Fichiers Modifiés**:

- Schema déclaratif : `supabase/schemas/62_rls_advanced_tables.sql`
- Migration : `20260107140000_fix_categories_duplicate_select_policies.sql`
- Documentation : `migrations.md`, `schemas/README.md`

---

### 2026-01-07 - PERF: Optimisation Index FK + RLS Policies

**Migration**: `20260107123000_performance_indexes_rls_policies.sql` (267 lignes)

**Sévérité**: 🟢 **LOW RISK** - Performance + Optimisation (pas de changement logique)

**Source**: Rapport Supabase Advisors du 2026-01-07 identifiant 4 catégories de problèmes de performance.

**Problèmes Résolus**:

| Catégorie | Problème | Solution | Impact |
| ----------- | ---------- | ---------- | -------- |
| FK sans index | 24 colonnes FK sans index couvrant | Ajout 24 index B-tree | ✅ JOINs 10-100x plus rapides |
| RLS initPlan | `auth.uid()` évalué per-row | `(select auth.uid())` pour initPlan | ✅ Évaluation 1x par query |
| Policies redondantes | 12+ tables avec policies OR multiples | Fusion policies permissives | ✅ Réduction overhead évaluation |
| Index inutilisés | ~30 index jamais utilisés | Script détection créé | ⏳ DROP après validation stats |

**Optimisations Appliquées**:

#### 1. Index FK Couvrants (24 index)

```sql
-- Relations Media (10 index)
create index if not exists idx_articles_presse_og_image_media_id 
  on articles_presse(og_image_media_id);
create index if not exists idx_spectacles_og_image_media_id 
  on spectacles(og_image_media_id);
-- ... 8 autres index media

-- Relations Category/Tag (6 index)
create index if not exists idx_articles_categories_category_id 
  on articles_categories(category_id);
-- ... 5 autres index categories/tags

-- Relations User/Admin (5 index)
create index if not exists idx_categories_created_by 
  on categories(created_by);
-- ... 4 autres index audit

-- Relations Event/Team (3 index)
create index if not exists idx_communiques_presse_evenement_id 
  on communiques_presse(evenement_id);
-- ... 2 autres index
```

**Raison**: Les JOINs sur colonnes FK sans index forcent des sequential scans complets (O(n)). Les index B-tree permettent des lookups directs (O(log n)).

#### 2. RLS initPlan Optimization

**Avant** (évaluation per-row):

```sql
create policy "View spectacles" on spectacles
for select using (
  (status = 'published' and public = true) 
  or exists (
    select 1 from profiles 
    where user_id = auth.uid()  -- ❌ Évalué pour chaque row
    and role = 'admin'
  )
);
```

**Après** (évaluation initPlan - 1x par query):

```sql
create policy "View spectacles" on spectacles
for select using (
  (status = 'published' and public = true) 
  or exists (
    select 1 from profiles 
    where user_id = (select auth.uid())  -- ✅ Évalué 1 fois
    and role = 'admin'
  )
);
```

**Raison**: Wrapping `auth.uid()` avec `(select ...)` force PostgreSQL à évaluer le subquery comme initPlan, résultat mis en cache pour toute la query.

#### 3. Fusion Policies Permissives

**Avant** (2 policies évaluées séparément):

```sql
create policy "View published spectacles" on spectacles
for select to anon, authenticated
using (status = 'published' and public = true);

create policy "Admin view all spectacles" on spectacles
for select to authenticated
using ((select public.is_admin()));
```

**Après** (1 policy combinée avec OR):

```sql
create policy "View spectacles (public OR admin)" on spectacles
for select to anon, authenticated
using (
  (status = 'published' and public = true) 
  or (select public.is_admin())
);
```

**Raison**: PostgreSQL évalue toutes les policies applicables avec OR entre elles. Combiner les policies permissives réduit l'overhead d'évaluation.

**Tables Optimisées**: spectacles, home_hero_slides, compagnie_presentation_sections, membres_equipe, communiques_presse, partners (6 tables).

#### 4. Script Détection Index Inutilisés

**Fichier**: `scripts/check_unused_indexes.sql`

```sql
select schemaname, tablename, indexname, idx_scan
from pg_stat_user_indexes
where schemaname = 'public' and idx_scan = 0
order by tablename, indexname;
```

**Usage**: Exécuter sur production après 7-14 jours pour statistiques représentatives, puis DROP les index confirmés inutilisés.

**Validation Post-Migration**:

✅ **Tests Sécurité** (26/26 passed):

- `pnpm exec tsx scripts/check-views-security.ts` → 13/13 tests (isolation admin)
- `pnpm exec tsx scripts/test-rls-cloud.ts` → 13/13 tests (RLS WITH CHECK)

✅ **Application Locale**:

- Migration testée sur DB locale (Supabase 15.x)
- Tous les 24 index créés sans erreur
- Toutes les policies modifiées sans régression

✅ **Déploiement Production**:

- `pnpm dlx supabase db push --linked --include-all`
- Migration appliquée: 2026-01-07 13:30 UTC
- Aucune erreur (1 NOTICE pour policy inexistante - attendu)

**Intégré au schéma déclaratif**: ✅

- `supabase/schemas/40_indexes.sql` — Section "FK Covering Indexes" ajoutée
- `supabase/schemas/61_rls_main_tables.sql` — Policies optimisées
- `supabase/schemas/01_extensions.sql` — Role `admin_views_owner` ajouté

**Documentation**: `doc/PERFORMANCE_OPTIMIZATION_2026-01-07.md`

**Prochaines Étapes**:

1. ⏳ Exécuter benchmarks EXPLAIN ANALYZE (doc disponible)
2. ⏳ Valider index inutilisés après 7-14 jours de prod
3. ⏳ DROP index confirmés inutilisés (statements commentés dans migration)

---

### 2026-01-07 - PERF: Fusion Policies RLS Dupliquées (Categories)

**Migration**: `20260107140000_fix_categories_duplicate_select_policies.sql` (36 lignes)

**Sévérité**: 🟢 **LOW RISK** - Performance (optimisation RLS)

**Statut**: ✅ **DÉPLOYÉ** (2026-01-07 14:00 UTC)

**Validation**: ✅ 26/26 tests sécurité (13 vues + 13 RLS)

**Source**: Audit post-optimisation identifiant politiques RLS dupliquées sur `categories` causant overhead CPU.

**Problème Identifié**:

La table `public.categories` avait **2 politiques SELECT permissives** pour le même rôle `authenticated`:

1. `"Active categories are viewable by everyone"` - `using (is_active = true)`
2. `"Admins can view all categories"` - `using ((select public.is_admin()))`

**Impact Performance**:

- PostgreSQL évalue **les deux politiques** pour chaque SELECT sur `categories`
- Overhead CPU inutile : les politiques permissives sont combinées avec OR (toutes deux sont évaluées)
- Ambiguïté : règles qui se chevauchent peuvent accorder un accès plus large que prévu
- Complexité maintenance : modifications nécessitent updates sur 2 politiques

**Solution Appliquée**:

**Avant** (2 politiques évaluées):

```sql
-- Politique 1 : Utilisateurs anonymes et authentifiés
create policy "Active categories are viewable by everyone"
on public.categories for select
to anon, authenticated
using ( is_active = true );

-- Politique 2 : Admins seulement
create policy "Admins can view all categories"
on public.categories for select
to authenticated
using ( (select public.is_admin()) );
```

**Après** (1 seule politique avec logique OR combinée):

```sql
drop policy if exists "Active categories are viewable by everyone" on public.categories;
drop policy if exists "Admins can view all categories" on public.categories;

create policy "View categories (active OR admin)"
on public.categories
for select
to anon, authenticated
using ( is_active = true or (select public.is_admin()) );
```

**Bénéfices**:

- ✅ Réduction overhead : 1 seule évaluation RLS au lieu de 2 par requête SELECT
- ✅ Logique plus claire : condition explicite `(active OR admin)` au lieu de 2 politiques implicites
- ✅ Maintenance simplifiée : modifications en un seul endroit
- ✅ Cohérence : suit le même pattern que Phase 3 de l'optimisation globale (6 autres tables)

**Tests de Validation**:

```bash
# Vérification locale
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" \
  -c "\d+ public.categories" | grep "Policies:" -A 10

# Tests sécurité
pnpm exec tsx scripts/check-views-security.ts  # ✅ 13/13 passed
pnpm exec tsx scripts/test-rls-cloud.ts        # ✅ 13/13 passed
```

**Fichiers Modifiés**:

- `supabase/schemas/62_rls_advanced_tables.sql` — Politique fusionnée dans schéma déclaratif
- `supabase/migrations/20260107140000_fix_categories_duplicate_select_policies.sql` — Migration DDL

**Documentation Complète**: Cette entrée

---

### 2026-01-06 - FIX: RLS Policy WITH CHECK (true) Vulnerabilities

**Migration** : `20260106190617_fix_rls_policy_with_check_true_vulnerabilities.sql` (304 lignes)

**Sévérité** : 🟡 **MEDIUM** - Sécurité + Conformité RGPD + Data Integrity

**Problème Détecté** : 4 tables publiques autorisaient des INSERT sans validation grâce à `WITH CHECK (true)`, exposant l'application à du spam, des données invalides et une falsification potentielle des logs d'audit.

**Tables Affectées** :

| Table | Vulnérabilité | Risque |
| ------- | --------------- | -------- |
| `abonnes_newsletter` | Pas de validation email | Spam + données invalides + RGPD |
| `messages_contact` | Pas de validation RGPD | Spam + données personnelles sans consent |
| `logs_audit` | INSERT direct possible | Falsification audit trail |
| `analytics_events` | Pas de validation types | Pollution données analytics |

**Solution Appliquée** :

#### 1. Newsletter - Validation Email + Anti-Duplicate

```sql
create policy "Validated newsletter subscription"
on public.abonnes_newsletter for insert
with check (
  email ~* '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$'
  and not exists (
    select 1 from public.abonnes_newsletter 
    where lower(email) = lower(abonnes_newsletter.email)
  )
);
```

**Défense en profondeur** : App layer (Zod + rate limiting 3 req/h) + DB layer (regex + duplicate check)

#### 2. Contact - Validation RGPD + Champs Requis

```sql
create policy "Validated contact submission"
on public.messages_contact for insert
with check (
  firstname is not null and firstname <> ''
  and lastname is not null and lastname <> ''
  and email is not null and email <> ''
  and consent = true  -- RGPD mandatory
  and email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  and (phone is null or phone ~* '^\+?[0-9\s\-\(\)]{10,}$')
  and length(message) between 10 and 5000
);
```

**Défense en profondeur** : App layer (Zod + rate limiting 5 req/15min/IP) + DB layer (validation complète)

#### 3. Audit Logs - SECURITY DEFINER Trigger (CRITICAL)

**Changement majeur** : Conversion de `audit_trigger()` de `SECURITY INVOKER` → `SECURITY DEFINER`

```sql
-- Trigger SECURITY DEFINER (bypass RLS pour INSERT logs)
create or replace function public.audit_trigger()
security definer  -- ✅ CHANGED
```

**Impact** :

- ✅ Fonction trigger bypasse RLS pour INSERT dans `logs_audit`
- ✅ Revoke INSERT direct pour `authenticated` et `anon`
- ✅ Seuls les triggers système peuvent écrire les logs
- ✅ Audit trail integrity garantie (zéro risque falsification)

**14 tables avec trigger d'audit** : profiles, medias, membres_equipe, lieux, spectacles, evenements, articles_presse, partners, abonnes_newsletter, messages_contact, configurations_site, communiques_presse, contacts_presse, home_about_content

#### 4. Analytics - Validation Types

```sql
create policy "Validated analytics events INSERT"
on public.analytics_events for insert
with check (
  event_type in ('view', 'click', 'share', 'download')
  and entity_type in ('spectacle', 'article', 'communique', 'evenement')
  -- Note: created_at uses default now() automatically
);
```

**Validation Post-Migration** :

Script de test : `scripts/test-rls-policy-with-check-validation.ts`

```bash
pnpm exec tsx scripts/test-rls-policy-with-check-validation.ts
# Résultat attendu : 13/13 tests passed
```

**Tests automatisés** :

- Newsletter (4 tests) : email invalide, vide, duplicate, valide
- Contact (5 tests) : sans consent, email invalide, message court, téléphone invalide, valide
- Audit logs (1 test) : INSERT direct bloqué (42501)
- Analytics (3 tests) : event type invalide, entity type invalide, valide

**Schémas Déclaratifs Synchronisés** :

- ✅ `supabase/schemas/10_tables_system.sql` (newsletter + contact + audit)
- ✅ `supabase/schemas/02b_functions_core.sql` (audit_trigger SECURITY DEFINER)
- ✅ `supabase/schemas/62_rls_advanced_tables.sql` (analytics)

**Statut** : ✅ Appliqué localement + cloud (2026-01-06), validé 13/13 tests  
**Référence** : `.github/prompts/plan-fix-rls-policy-vulnerabilities.prompt.md`  
**Note** : Bug `event_date` corrigé - voir `doc/fix-analytics-event-date-bug.md`

---

### 2026-01-07 - FINAL FIX: Newsletter Infinite Recursion (Complete Solution)

**Migrations** :

- `20260107120000_fix_newsletter_remove_duplicate_select_policy.sql` (28 lignes)
- `20260107130000_fix_newsletter_remove_not_exists_from_policy.sql` (36 lignes)

**Sévérité** : 🔴 **CRITICAL** - Production Broken

**Problème Détecté** : Malgré les fixes précédents (20260106232619 + 20260106235000), l'erreur `infinite recursion detected in policy for relation "abonnes_newsletter"` persistait.

**Root Cause Analysis** :
Le `NOT EXISTS` subquery dans la policy INSERT cause une récursion infinie car :

1. INSERT déclenche l'évaluation de la policy INSERT
2. La policy INSERT contient `NOT EXISTS (SELECT 1 FROM abonnes_newsletter ...)`
3. Ce SELECT déclenche l'évaluation des policies SELECT sur la même table
4. PostgreSQL entre en boucle infinie lors de l'évaluation des policies

**Solution Finale** :

```sql
-- Migration 20260107120000: Supprimer la policy SELECT admin-only redondante
drop policy if exists "Admins can view full newsletter subscriber details" on public.abonnes_newsletter;

-- Migration 20260107130000: Simplifier la policy INSERT (sans NOT EXISTS)
drop policy if exists "Validated newsletter subscription" on public.abonnes_newsletter;
create policy "Validated newsletter subscription"
on public.abonnes_newsletter for insert
to anon, authenticated
with check (
  email ~* '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$'
);
```

**Defense in Depth** :

- **Database layer** : Contrainte UNIQUE sur email (`abonnes_email_unique`) pour bloquer les doublons
- **Database layer** : Validation regex du format email dans la policy RLS
- **Application layer** : Rate limiting (3 req/h) via TASK046
- **Application layer** : Validation Zod côté serveur

**Validation** :

```bash
pnpm exec tsx scripts/test-rls-cloud.ts
# Résultat: 13/13 tests passed ✅
```

**Schéma Déclaratif Mis à Jour** : `supabase/schemas/10_tables_system.sql`

**Status** : ✅ Appliqué Cloud + Local (2026-01-07)

---

### 2026-01-06 - SUPERSEDED: Newsletter Infinite Recursion Fixes (Parts 1 & 2)

> ⚠️ **SUPERSEDED** : Ces migrations ont été remplacées par les fixes du 2026-01-07.
> Conservées pour l'historique des migrations Cloud.

**Migration Part 1** : `20260106232619_fix_newsletter_infinite_recursion.sql`

- Tentative : Ajout d'alias `existing` dans le NOT EXISTS
- Résultat : Insuffisant - récursion persistait

**Migration Part 2** : `20260106235000_fix_newsletter_select_for_duplicate_check.sql`

- Tentative : Split des policies SELECT (permissive + admin-only)
- Résultat : Insuffisant - récursion persistait

**Leçon apprise** : Les subqueries dans les policies RLS qui référencent la même table peuvent causer des récursions infinies. Utiliser des contraintes UNIQUE au lieu de checks RLS pour la déduplication.

---

### 2026-01-05 - CRITICAL: Fix SECURITY DEFINER Views

**Migration** : `20260105130000_fix_security_definer_views.sql` (170 lignes)

**Sévérité** : 🔴 **CRITIQUE** - Vulnérabilité RLS Bypass

**Problème Détecté** : Deux vues critiques fonctionnaient en mode `SECURITY DEFINER`, exécutant les requêtes avec les privilèges du propriétaire de la vue (postgres/admin_views_owner) au lieu de l'utilisateur appelant, **contournant ainsi les politiques Row-Level Security**.

**Vues Affectées** :

1. ❌ `communiques_presse_public` (vue publique)
2. ❌ `communiques_presse_dashboard` (vue admin)

**Risques de Sécurité** :

- **Bypass RLS** : Les utilisateurs pouvaient voir des lignes non autorisées car les vérifications RLS s'exécutaient avec les droits du propriétaire (large accès)
- **Escalade de privilèges** : Accès indirect à des lectures/écritures normalement interdites
- **Violation principe du moindre privilège** : La vue exposait plus de données que prévu
- **Comportement inattendu** : Les développeurs supposaient que les policies RLS étaient appliquées par utilisateur

**Solution Appliquée** :

```sql
-- Force SECURITY INVOKER mode on both views
create or replace view public.communiques_presse_public
with (security_invoker = true)  -- ✅ Run with caller privileges
as
-- ... (view definition)

create or replace view public.communiques_presse_dashboard
with (security_invoker = true)  -- ✅ Run with caller privileges
as
-- ... (admin guard: where (select public.is_admin()) = true)
```

**Validation Post-Migration** :

```sql
-- Both views now show SECURITY INVOKER ✅
✅ communiques_presse_dashboard (admin_views_owner)
✅ communiques_presse_public (postgres)
```

**Schémas Déclaratifs Synchronisés** : ✅ `supabase/schemas/41_views_communiques.sql`

**Statut** : ✅ Appliqué localement + cloud, validé  
**Détection** : Analyse Supabase Security Advisor + user report  
**Impact** : Rétablit l'isolation sécurisée des données par utilisateur

---

### 2026-01-05 - Admin Views Security Hardening

**Migration** : `20260105120000_admin_views_security_hardening.sql` (97 lignes)

**Objectif** : Sécuriser strictement les vues admin en créant un rôle dédié `admin_views_owner` pour isoler les vues du système de DEFAULT PRIVILEGES de Supabase qui accorde automatiquement des privilèges à `anon` et `authenticated`.

**Problème Identifié** : Le test `test-views-security-authenticated.ts` révélait que la vue `communiques_presse_dashboard` retournait un tableau vide `[]` au lieu d'une erreur `permission denied` pour les utilisateurs authentifiés non-admin. La cause : les DEFAULT PRIVILEGES de Supabase accordent automatiquement `ALL` aux rôles `anon`/`authenticated` lors de la création de vues dans le schéma `public`.

**Solution** :

1. **Rôle Dédié** : Création du rôle `admin_views_owner` (nologin) pour propriété des vues admin
2. **Transfer Ownership** : 7 vues admin transférées à `admin_views_owner`
3. **Revoke Explicit** : `REVOKE ALL` sur les 7 vues pour `anon` et `authenticated`
4. **Grant Service Role** : `GRANT SELECT` uniquement à `service_role` (admin backend)
5. **DEFAULT PRIVILEGES** : Modification pour que les futures vues créées par `admin_views_owner` ne reçoivent PAS de grants automatiques

**Vues Concernées** (7) :

- `communiques_presse_dashboard` (41_views_communiques.sql)
- `membres_equipe_admin` (41_views_admin_content_versions.sql)
- `compagnie_presentation_sections_admin` (41_views_admin_content_versions.sql)
- `partners_admin` (41_views_admin_content_versions.sql)
- `content_versions_detailed` (15_content_versioning.sql)
- `messages_contact_admin` (10_tables_system.sql)
- `analytics_summary` (13_analytics_events.sql)

**Schémas Déclaratifs Mis à Jour** (5 fichiers) :

Chaque vue admin a maintenant ces lignes après sa définition :

```sql
alter view public.<view_name> owner to admin_views_owner;
revoke all on public.<view_name> from anon, authenticated;
grant select on public.<view_name> to service_role;
```

**Scripts de Validation** :

- `scripts/test-views-security-authenticated.ts` — Teste les 7 vues avec assertion stricte `permission denied`

**Tests Automatisés** :

```bash
# Test sécurité authenticated (7 vues bloquées)
# Test utilisateur authentifié non-admin
pnpm exec tsx scripts/test-views-security-authenticated.ts

# Test sécurité anon existant
pnpm exec tsx scripts/check-views-security.ts
```

**Vérification Ownership (Optionnelle)** :

```sql
-- Exécuter dans Supabase SQL Editor
SELECT 
  v.schemaname,
  v.viewname,
  v.viewowner,
  CASE 
    WHEN c.reloptions::text LIKE '%security_invoker=true%' 
    THEN '✅ SECURITY INVOKER' 
    ELSE '❌ SECURITY DEFINER' 
  END as security_mode
FROM pg_views v
JOIN pg_class c ON c.relname = v.viewname
WHERE v.schemaname = 'public'
AND (v.viewname LIKE '%_admin' OR v.viewname LIKE '%_dashboard')
ORDER BY v.viewname;
```

**Statut** : ✅ Migration créée, schémas mis à jour, scripts créés  
**Référence** : `.github/prompts/plan-adminViewsSecurityHardening.prompt.md`  
**Décision** : Architecture rôle dédié pour isolation permanente des vues admin

#### ✅ Validation Manuelle (Alternative)

Pour vérifier l'ownership et SECURITY INVOKER des vues admin, exécutez dans Supabase SQL Editor :

```bash
-- Vérification manuelle dans Supabase SQL Editor
SELECT schemaname, viewname, viewowner,
  CASE WHEN c.reloptions::text LIKE '%security_invoker=true%' 
  THEN '✅ SECURITY INVOKER' ELSE '❌ SECURITY DEFINER' END as security_mode
FROM pg_views v
JOIN pg_class c ON c.relname = v.viewname
WHERE v.schemaname = 'public'
AND (v.viewname LIKE '%_admin' OR v.viewname LIKE '%_dashboard')
ORDER BY v.viewname;
```

> [!NOTE]
> Résultat attendu :
> Toutes les vues doivent afficher admin_views_owner + ✅ SECURITY INVOKER

---

### 2026-01-03 - TASK033 Audit Logs Viewer

**Migration** : `20260103183217_audit_logs_retention_and_rpc.sql` (192 lignes)

**Objectif** : Système complet d'audit logs avec rétention automatique, résolution email et filtres avancés.

**Composants** :

- Colonne `expires_at` sur `logs_audit` avec valeur par défaut `now() + interval '90 days'`
- Index `idx_audit_logs_expires_at` pour cleanup efficace
- Fonction `cleanup_expired_audit_logs()` pour purge automatique (cron job)
- Fonction RPC `get_audit_logs_with_email()` pour filtres avancés + résolution email
- RLS policies admin-only avec `is_admin()` guard

**Statut** : ✅ Appliqué localement + cloud  
**Tests** : 3/3 passed (expires_at, RPC, cleanup)  
**Documentation** : `doc/TASK033-AUDIT-LOGS-IMPLEMENTATION-SUMMARY.md`

---

## �🔐 Sécurité : Vérification des vulnérabilités

### Procédure de vérification

```bash
# 1. Vérifier les vulnérabilités des dépendances npm
pnpm audit

# 2. Si des vulnérabilités sont trouvées, mettre à jour les packages
pnpm update <package-name>@<version-corrigée>

# 3. Vérifier que les vulnérabilités sont corrigées
pnpm audit
# Attendu : "No known vulnerabilities found"
```

### Alertes résolues

#### CodeQL js/request-forgery — SSRF in validateImageUrl (5 décembre 2025)

| Champ | Valeur |
| ------- | -------- |
| **Sévérité** | 🔴 CRITICAL |
| **Fichier** | `lib/utils/validate-image-url.ts` |
| **Règle** | CodeQL `js/request-forgery` |
| **CWE** | [CWE-918](https://cwe.mitre.org/data/definitions/918.html) |

**Problème** : L'URL fournie par l'utilisateur était directement utilisée dans `fetch()`, permettant une attaque SSRF vers des services internes. CodeQL exige que le hostname utilisé dans une requête HTTP provienne de valeurs contrôlées par le serveur, pas de l'input utilisateur.

**Résolution** (3 commits itératifs) :

1. **`4e0715d`** — Validation initiale : allowlist hostname + blocage IPs privées
2. **`b290d03`** — Reconstruction URL depuis composants validés
3. **`072b68a`** — Refonte complète avec `getCanonicalHostname()` :
   - Le hostname utilisé dans `fetch()` provient exclusivement de valeurs serveur-contrôlées
   - Sources autorisées : `ALLOWED_HOSTNAMES` Map, `NEXT_PUBLIC_SUPABASE_URL`, pattern `*.supabase.co`
   - Blocage IPs privées/internes (10.x, 172.16-31.x, 192.168.x)
   - Enforcement HTTPS (HTTP uniquement en développement)
   - Blocage des redirections (`redirect: 'error'`)

**Pattern CodeQL-compliant** :

```typescript
// Le hostname vient d'une source serveur-contrôlée
const canonicalHostname = getCanonicalHostname(parsedUrl.hostname);
if (!canonicalHostname) return { valid: false, error: "Hostname not allowed" };

// URL construite avec hostname serveur-contrôlé
const safeUrl = `${parsedUrl.protocol}//${canonicalHostname}${parsedUrl.pathname}${parsedUrl.search}`;
const response = await fetch(safeUrl, { redirect: "error" });
```

---

#### CVE-2025-66478 — Next.js RCE via React Flight Protocol (5 décembre 2025)

| Champ | Valeur |
| ------- | -------- |
| **Sévérité** | 🔴 CRITICAL |
| **Package** | `next` |
| **Versions vulnérables** | `>=16.0.0-canary.0 <16.0.7` |
| **Version corrigée** | `16.0.7` |
| **Advisory** | [GHSA-9qr9-h5gf-34mp](https://github.com/advisories/GHSA-9qr9-h5gf-34mp) |
| **Blog** | [nextjs.org/blog/CVE-2025-66478](https://nextjs.org/blog/CVE-2025-66478) |

**Résolution** :

```bash
pnpm add next@16.0.7
```

**Commit** : `7a11b96` — fix(security): update next.js 16.0.6→16.0.7 (CVE-2025-66478)

---

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

## Migrations récentes (décembre 2025)

- `20251217100000_cleanup_spectacles_backup.sql` — **CLEANUP : Remove spectacles backup table**
  - 🗑️ **Suppression** : Table `spectacles_backup_20251209120000` (backup normalization status)
  - ✅ **Vérification préalable** : Contrainte `chk_spectacles_status_allowed` présente sur `spectacles`
  - 📝 **Notes** : Backup conservé 8 jours après migration, Time Travel Supabase disponible pour recovery

- `20251209120000_normalize_spectacles_status_to_english.sql` — **DATA MIGRATION : Normalize spectacles.status to English tokens**
  - ⚠️ **MODIFIES DATA IN PLACE** — Backup table created: `spectacles_backup_20251209120000` (supprimée le 2025-12-17)
  - 🎯 **Objectif** : Normaliser les valeurs de statut vers des tokens anglais canoniques
  - 📊 **Valeurs canoniques** : `'draft'`, `'published'`, `'archived'` (exclusivement)
  - 🔄 **Mapping appliqué** :
    - `brouillon`, `projet` → `draft`
    - `actuellement`, `a l'affiche`, `en cours`, `en_tournee` → `published`
    - `archive`, `archivé`, `terminé`, `annulé` → `archived`
  - ✅ **Contrainte CHECK** : `chk_spectacles_status_allowed` ajoutée post-migration
  - 📝 **Trigger** : Désactivé pendant migration (`trg_spectacles_versioning`) puis réactivé
  - ✅ **Intégré au schéma déclaratif** : `supabase/schemas/06_table_spectacles.sql`

- `20251205220000_refactor_hero_slides_cta_dual_buttons.sql` — **DDL + DML : Hero Slides CTA refactoring**
  - 🎯 **Objectif** : Remplacer single CTA par dual buttons (primary + secondary)
  - 📊 **Nouvelles colonnes** : `cta_primary_enabled`, `cta_primary_label`, `cta_primary_url`, `cta_secondary_*`
  - 🔄 **Migration données** : `cta_label`/`cta_url` → `cta_primary_*` (idempotente via DO block)
  - ✅ **Contraintes CHECK** : 4 contraintes de cohérence (length + enabled/label/url)
  - 🛡️ **Idempotence** : STEP 2 et STEP 3 utilisent des DO blocks avec vérification `information_schema`/`pg_constraint`
  - ✅ **Intégré au schéma déclaratif** : `supabase/schemas/07d_table_home_hero.sql`

---

## Migrations récentes (novembre 2025)

- **Refactoring architectural (27 nov. 2025)** — **Clean Code & TypeScript Conformity pour TASK026** : Ce refactoring n'a pas généré de migration base de données car il concerne uniquement la couche application.

- `20251204133540_create_reorder_hero_slides_function.sql` — **HOTFIX : Create missing reorder_hero_slides function**
  - 🎯 **Root cause** : Migration `20251126001251` marquée appliquée mais fonction non créée
  - 📝 **Explication** : La ligne `create extension pg_net` en début de migration a échoué silencieusement, interrompant l'exécution avant la création de la fonction
  - 🛠️ **Résolution** : Fonction créée via Supabase MCP `apply_migration`
  - ✅ **Intégré au schéma déclaratif** : `supabase/schemas/63b_reorder_hero_slides.sql`
  - 📝 **Migration conservée** pour l'historique et la cohérence avec Supabase Cloud

- `20251126215129_fix_hero_slides_admin_select_policy.sql` — **RLS FIX : Admins can view ALL hero slides**
  - Ajout policy `Admins can view all home hero slides` sur `home_hero_slides`
  - Permet aux admins de voir les slides inactifs pour les gérer via toggle
  - ✅ **Intégré au schéma déclaratif** : `supabase/schemas/07d_table_home_hero.sql`

- `20251126001251_add_alt_text_to_home_hero_slides.sql` — **A11Y + CRUD : Hero Slides enhancements**

---

## Migrations récentes (janvier 2026)

- `20260101220000_fix_presse_toggles.sql` — **TASK030 Phase 11 : Split presse toggle into 2 independent toggles**
  - 🎯 **Objectif** : Créer 2 toggles indépendants pour Presse (Media Kit + Communiqués)
  - **Root cause** : Migration 20260101210000 échouée (toggle original n'existait pas)
  - **Legacy keys transformées** :
    - `public:presse:media_kit_enabled` → `display_toggle_media_kit`
    - `public:presse:communiques_enabled` → `display_toggle_presse_articles`
  - **Pattern** : DO blocks avec existence checks (idempotent)
  - **Composants** : PresseServerGate (dual toggles), PresseView (conditional sections)
  - **Scripts** : check-presse-toggles.ts + toggle-presse.ts (4 modes)
  - ✅ **Intégré au schéma déclaratif** : Toggles system complete (10 toggles)
  - 📝 **Documentation** : `.github/prompts/plan-task030DisplayTogglesEpicAlignment.prompt.md`
  - 📦 **Commit** : b27059f — "feat(presse): separate Media Kit and Press Releases toggles + hide disabled sections"
  - **Colonne `alt_text`** : texte alternatif pour accessibilité (max 125 caractères, contrainte CHECK)
  - **Fonction `reorder_hero_slides(jsonb)`** : ⚠️ **PARTIELLEMENT ÉCHOUÉE** - voir `20251204133540`
    - Authorization : `is_admin()` check explicite
    - Concurrency : Advisory lock `pg_advisory_xact_lock`
    - Input validation : JSONB array structure
  - **Fonction `restore_content_version`** : Mise à jour pour support `home_hero_slides`
  - ✅ **Intégré aux schémas déclaratifs** : `07d_table_home_hero.sql` + `63b_reorder_hero_slides.sql`

- `20260103120000_fix_communiques_presse_dashboard_admin_access.sql` — **SECURITY HOTFIX: restreindre l'accès admin à la vue `communiques_presse_dashboard`**
  - 🎯 **Objectif** : empêcher les utilisateurs authentifiés non-admin d'interroger la vue dashboard admin en ajoutant un garde explicite `WHERE (select public.is_admin()) = true` lors de la recréation de la vue. La vue reste `security_invoker = true`.
  - 🔐 **Motif** : test automatisé a révélé qu'un utilisateur authentifié avec `app_metadata.role = 'user'` pouvait interroger la vue (regression). Correction appliquée localement via migration hotfix et synchronisée dans le schéma déclaratif (`supabase/schemas/41_views_communiques.sql`).
  - ⚠️ **Destructive** : la migration utilise `drop view ... cascade` suivi d'une recréation. Avant d'appliquer en production, prendre un backup / snapshot et vérifier les objets dépendants.
  - ✅ **Statut local** : appliquée localement avec `pnpm dlx supabase db push --local` lors de la vérification; tests authentifiés doivent être relancés côté Cloud après push.
  - ▶️ **Étapes recommandées pour Cloud** :
    1. Commit & push les changements (migration + schéma déclaratif) dans le repo.
    2. Prendre un backup ou plan de restauration sur Supabase Cloud.
    3. Exécuter `pnpm dlx supabase db push` depuis le repo (le CLI poussera les migrations non appliquées vers le projet lié).
    4. Relancer la suite de tests (notamment `scripts/test-views-security-authenticated.ts`) contre l'environnement Cloud.
  - 📝 **Notes** : la condition `public.is_admin()` est gardée pour compatibilité avec les autres RLS; surveiller la performance si la fonction est appelée sur de larges scans.

- `20260103123000_revoke_authenticated_on_communiques_dashboard.sql` — **SECURITY: revoke grant on admin view**
  - 🎯 **Objectif** : supprimer un `grant select` historique sur la vue admin `communiques_presse_dashboard` qui permettait au rôle `authenticated` d'interroger la vue directement, contournant certaines RLS.
  - 🔐 **Motif** : après application du hotfix de recréation de la vue, des tests automatisés ont montré qu'un utilisateur authentifié non-admin pouvait encore accéder à la vue en raison d'un `GRANT` antérieur. Cette migration révoque explicitement ce droit.
  - ✅ **Opération** : `revoke select on public.communiques_presse_dashboard from authenticated;` (non-destructive)
  - ✅ **Statut Cloud** : appliquée sur Supabase Cloud; tests authentifiés ré-exécutés et validés (admin view denied to non-admin).
  - ▶️ **Remarque opérationnelle** : les droits (GRANT/REVOKE) sont gérés via migrations historiques; vérifier les anciens commits/migrations qui réintroduiraient un `GRANT` lors de futurs rollbacks ou snapshot restores.

- `20251123170231_create_messages_contact_admin_view.sql` — **SECURITY FIX : Deploy missing messages_contact_admin view** : Création de la vue `messages_contact_admin` définie dans le schéma déclaratif mais absente de la base de données. Résout l'alerte Security Advisor "SECURITY DEFINER view" (faux positif - vue configurée avec `security_invoker = true`).
  - ✅ **Intégré au schéma déclaratif** : `supabase/schemas/10_tables_system.sql`
  - 🔐 **Sécurité** : Vue avec `security_invoker = true` (pas de privilèges élevés)
  - 📝 **Migration conservée** pour l'historique et la cohérence avec Supabase Cloud
  - 🎯 **Root cause** : Vue définie dans schéma mais non déployée en base (advisor détecte absence comme SECURITY DEFINER)
  - ⚡ **Résolution** : Migration manuelle appliquée, alerte Security Advisor résolue

- `20251123143116_fix_restore_content_version_published_at.sql` — **ARCHIVE** : fichier de correctif temporaire contenant la recréation de la vue `messages_contact_admin` et la fonction `restore_content_version`.
  - ℹ️ **Remarque** : Le même code est présent et géré par le schéma déclaratif (`supabase/schemas/15_content_versioning.sql` et `supabase/schemas/10_tables_system.sql`).
  - 📦 **Action** : Ce fichier a été déplacé vers `supabase/migrations/archived/` le 2025-11-23 pour clarifier qu'il s'agit d'un hotfix historisé déjà synchronisé dans le schéma déclaratif.
  - ✅ **Raison** : Conserver l'historique sans créer de duplication active dans le répertoire principal `supabase/migrations/`.

- `20251121185458_allow_admin_update_profiles.sql` — **RLS & invite flow fix (2025-11-21)** : migration générée par `supabase db diff` pour remplacer la policy `update` trop restrictive sur `public.profiles`. Contexte : `upsert` côté application effectue d'abord un `update` puis un `insert`, et la policy UPDATE bloquait les invites administrateurs (erreur 42501). Cette migration permet aux administrateurs d'atteindre la phase UPDATE lors d'un UPSERT tout en conservant les vérifications `with check` pour les INSERTs.
  - Statut : ✅ appliquée sur la branche `feature/backoffice` et poussée au remote via `pnpm dlx supabase db push` (2025-11-21).
  - Impact : Permet l'utilisation d'`upsert()` côté serveur pour créer/mettre à jour les `profiles` lors de l'invitation d'utilisateurs sans déclencher d'erreur RLS.
  - Remarques opérationnelles : vérifier qu'un index existe sur `profiles(user_id)` si des requêtes massives d'upsert sont attendues.

- `20251123150000_remote_schema.sql` — **REMOTE WARNING: pg_net extension** : migration minimale exécutant `drop extension if exists "pg_net"`.
  - 📊 Diff Local vs Cloud : la base locale ne contient jamais `pg_net`, mais le projet Cloud a renvoyé un warning lié à cette extension (spécifique à Supabase Cloud pour webhooks).
  - 🛠️ Impact local : aucune action requise — la suppression est idempotente et la base locale est propre.
  - 🔎 Action recommandée : garder la migration pour tracer le contrôle cloud-local ; si vous voulez forcer l'état sur le cloud, appliquez la migration via la CLI/SQL Editor. Voir `scripts/check-extension.ts` pour un contrôle programmatique.

- ~~`20251231000000_fix_communiques_presse_public_security_invoker.sql`~~ — **\[SUPPRIMÉE]** Migration obsolète en conflit avec schéma déclaratif
  - **Raison de suppression**: Le schéma déclaratif (`supabase/schemas/41_*.sql`) contient déjà `with (security_invoker = true)` pour toutes les vues
  - **Problème**: Cette migration recréait les vues SANS la directive `security_invoker`, annulant le schéma déclaratif
  - **Solution**: Migration supprimée le 2025-12-31, schéma déclaratif seule source de vérité
  - **Note**: Les vues sont correctement définies en SECURITY INVOKER dans les fichiers de schéma déclaratif depuis octobre 2025

- `20251231010000_fix_base_tables_rls_revoke_admin_views_anon.sql` — **SECURITY FIX: Restrict base tables RLS for admin views**
  - **Contexte**: Les vues admin SECURITY INVOKER exposent les données si les tables de base ont `using(true)`
  - **Problème**: `anon` peut accéder aux données via les vues admin car `membres_equipe` et `compagnie_presentation_sections` sont publiquement lisibles
  - **Solution**:
    - Politiques SELECT tables de base : `using (active = true)` pour public
    - Politiques SELECT admin séparées : `using (is_admin())` pour voir les inactifs
    - REVOKE SELECT sur vues `*_admin` pour rôle `anon`
  - ✅ **Intégré au schéma déclaratif** : `04_table_membres_equipe.sql`, `07c_table_compagnie_presentation.sql`
  - 📝 **Known Caveat** : RLS policies changes non détectées par migra diff

- `20251231020000_enforce_security_invoker_all_views_final.sql` — **SECURITY FIX: Force SECURITY INVOKER on all views**
  - **Contexte**: Supabase Security Advisor signale `SECURITY DEFINER` sur `communiques_presse_dashboard` et autres vues
  - **Problème**: Migration snapshot `20250918000002_apply_declarative_schema_complete.sql` (septembre 2025) recrée les vues SANS `security_invoker`, annulant le schéma déclaratif
  - **Solution**:
    - Utilise `ALTER VIEW ... SET (security_invoker = true)` sur toutes les vues publiques
    - Migration exécutée EN DERNIER (timestamp `20251231020000`) pour override la snapshot
    - Schéma déclaratif reste la source de vérité pour les définitions de vues
  - **Vues mises à jour** (11 total):
    - `communiques_presse_dashboard`, `communiques_presse_public`, `articles_presse_public`
    - `spectacles_public`, `spectacles_admin`
    - `membres_equipe_admin`, `compagnie_presentation_sections_admin`, `partners_admin`
    - `messages_contact_admin`, `content_versions_detailed`, `analytics_summary`
    - `popular_tags`, `categories_hierarchy`
  - ✅ **Intégré au schéma déclaratif** : Tous les fichiers `supabase/schemas/*.sql` contiennent déjà `WITH (security_invoker = true)`
  - 📝 **Migration conservée** pour :
    - Historique de correctif
    - Cohérence avec Supabase Cloud
    - Garantir SECURITY INVOKER même après la snapshot de septembre 2025
  - ✅ **Tests** : 13/13 tests passés (local + cloud) - toutes les vues en SECURITY INVOKER
  - 📝 **Known Caveat** : `security_invoker` attribute changes non détectées par migra diff

## 📌 Post-Mortem : Incident pg_net (Décembre 2025)

> **Résumé** : L'extension `pg_net` a causé une exécution partielle de migration, laissant la fonction `reorder_hero_slides` non créée.

### Chronologie

| Date | Événement |
| ------ | ----------- |
| 23 nov. 2025 | Migration `20251123150000` appliquée (drop pg_net - idempotent) |
| 26 nov. 2025 | Migration `20251126001251` appliquée - **ÉCHEC SILENCIEUX** |
| 4 déc. 2025 | Découverte : fonction `reorder_hero_slides` manquante → erreur 42883 |
| 4 déc. 2025 | Hotfix `20251204133540` appliqué via Supabase MCP |

### Root Cause

La migration `20251126001251` contenait initialement :

```sql
create extension if not exists "pg_net" with schema "extensions";
```

Cette ligne a échoué silencieusement sur Supabase Cloud car :

1. `pg_net` est une extension **gérée par Supabase** (webhooks/edge functions)
2. Les utilisateurs ne peuvent pas la créer/modifier directement
3. L'échec a interrompu l'exécution **avant** la création de `reorder_hero_slides`
4. La migration a été marquée "applied" malgré l'exécution partielle

### Résolution appliquée

1. ✅ **Suppression de la ligne pg_net** dans `20251126001251` (commit ce79f87)
2. ✅ **Hotfix migration** `20251204133540` pour recréer la fonction manquante
3. ✅ **Schéma déclaratif** mis à jour : `supabase/schemas/63b_reorder_hero_slides.sql`
4. ✅ **Script de diagnostic** : `scripts/check-extension.ts`

### Leçons apprises

> ⚠️ **NE JAMAIS inclure `create extension pg_net`** dans les migrations utilisateur.
>
> - `pg_net` est géré automatiquement par Supabase Cloud
> - Les migrations locales n'en ont pas besoin (l'extension n'existe pas en local)
> - Utiliser `scripts/check-extension.ts` pour diagnostiquer

### Fichiers concernés (état final)

| Fichier | État |
| --------- | ------ |
| `20251123150000_remote_schema.sql` | ✅ `drop extension if exists "pg_net"` (idempotent) |
| `20251126001251_add_alt_text...sql` | ✅ Ligne pg_net supprimée + commentaire explicatif |
| `20251204133540_create_reorder...sql` | ✅ Hotfix - fonction créée |
| `supabase/schemas/63b_reorder_hero_slides.sql` | ✅ Source de vérité déclarative |

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

- ~~`20251022120000_fix_articles_presse_public_security_invoker.sql`~~ — **\[SUPPRIMÉE]** Migration obsolète
  - **Raison**: Schéma déclaratif déjà correct avec `security_invoker = true` depuis oct. 2025
  - **Supprimée**: 2025-12-31
  - **Note**: Vue déjà correctement définie dans `supabase/schemas/08_table_articles_presse.sql`

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

- ~~`20251022160000_fix_all_views_security_invoker.sql`~~ — **\[SUPPRIMÉE]** Migration obsolète
  - **Raison**: Schéma déclaratif déjà correct avec `security_invoker = true` pour toutes les vues
  - **Supprimée**: 2025-12-31
  - **Note**: Vues déjà correctement définies dans `supabase/schemas/41_*.sql`
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
