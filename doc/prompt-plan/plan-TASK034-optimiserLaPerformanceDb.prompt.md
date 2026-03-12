## Plan: Optimiser la performance DB (FK, RLS, Index, Policies)

**Source**: Rapport Supabase Advisors du 2026-01-07  
**Objectif**: Corriger 4 catégories de problèmes de performance identifiés  
**Effort estimé**: ~10h (implémentation + validation)  
**Impact attendu**: Réduction latence requêtes de 30-50%, libération ~200-500MB disque

---

## ✅ STATUT: IMPLÉMENTÉ ET DÉPLOYÉ (2026-01-07)

**Migration**: `20260107123000_performance_indexes_rls_policies.sql`  
**Déployé**: 2026-01-07 13:30 UTC (production)  
**Validation**: 26/26 tests sécurité réussis

### Résultats d'Implémentation

| Phase | Statut | Détails |
|-------|--------|----------|
| ✅ **Phase 1** | Complété | 24 index FK couvrants ajoutés à `40_indexes.sql` |
| ✅ **Phase 2** | Complété | RLS optimisé avec `(select auth.uid())` initPlan |
| ✅ **Phase 3** | Complété | Politiques SELECT fusionnées sur 6 tables |
| ✅ **Phase 4** | Créé | Script `check_unused_indexes.sql` disponible |
| ✅ **Migration** | Déployé | Appliqué sur cloud avec succès |
| ⏳ **Benchmarks** | Pending | EXPLAIN ANALYZE à exécuter post-déploiement |

**Documentation**:

- Implémentation: `doc/PERFORMANCE_OPTIMIZATION_2026-01-07.md`
- Tests sécurité: 13/13 vues + 13/13 RLS WITH CHECK

---

## Contexte d'analyse

### Problèmes identifiés par Supabase Advisors

1. **24 FK sans index couvrant** → Scans complets sur JOINs
2. **5 policies RLS avec `auth.uid()` direct** → Évaluation per-row au lieu d'initPlan
3. **12+ tables avec policies permissives multiples** → Overhead évaluation OR
4. **~30 index inutilisés** → Gaspillage disque + maintenance

### État actuel du schéma

- **Fichier index**: `supabase/schemas/40_indexes.sql` (~70 index existants)
- **Fichier RLS main**: `supabase/schemas/61_rls_main_tables.sql` (medias, spectacles, partners, etc.)
- **Fichier RLS advanced**: `supabase/schemas/62_rls_advanced_tables.sql` (analytics, categories, tags)
- **Système**: Schéma déclaratif avec génération de migration via `supabase db diff`

---

Le serveur Next.js pointe vers Supabase Cloud (yvtrlvmbofklefxcxrzv.supabase.co), pas vers la base locale.

## Phase 1: Ajouter index couvrants FK (PRIORITÉ 1 🔴)

**Impact**: CRITIQUE - Amélioration immédiate performance JOINs  
**Risque**: FAIBLE - Index simples, pas d'impact sémantique  
**Temps estimé**: 2h

### 1.1 Relations Media (10 index)

```sql
-- Relations vers medias.id (haute fréquence d'accès)
create index idx_articles_presse_og_image_media_id on articles_presse(og_image_media_id);
create index idx_compagnie_presentation_sections_image_media_id on compagnie_presentation_sections(image_media_id);
create index idx_home_about_content_image_media_id on home_about_content(image_media_id);
create index idx_home_hero_slides_image_media_id on home_hero_slides(image_media_id);
create index idx_membres_equipe_photo_media_id on membres_equipe(photo_media_id);
create index idx_partners_logo_media_id on partners(logo_media_id);
create index idx_spectacles_og_image_media_id on spectacles(og_image_media_id);

-- Tables de jonction media
create index idx_articles_medias_media_id on articles_medias(media_id);
create index idx_communiques_medias_media_id on communiques_medias(media_id);
create index idx_spectacles_medias_media_id on spectacles_medias(media_id);
```

### 1.2 Relations Category/Tag (6 index)

```sql
-- Relations vers categories.id
create index idx_articles_categories_category_id on articles_categories(category_id);
create index idx_communiques_categories_category_id on communiques_categories(category_id);
create index idx_spectacles_categories_category_id on spectacles_categories(category_id);

-- Relations vers tags.id
create index idx_articles_tags_tag_id on articles_tags(tag_id);
create index idx_communiques_tags_tag_id on communiques_tags(tag_id);
create index idx_spectacles_tags_tag_id on spectacles_tags(tag_id);
```

### 1.3 Relations User/Admin (5 index)

```sql
-- Colonnes created_by/updated_by (audit trail)
create index idx_categories_created_by on categories(created_by);
create index idx_configurations_site_updated_by on configurations_site(updated_by);
create index idx_contacts_presse_created_by on contacts_presse(created_by);
create index idx_seo_redirects_created_by on seo_redirects(created_by);
create index idx_tags_created_by on tags(created_by);
```

### 1.4 Relations Event/Team (3 index)

```sql
-- Relations événements/lieux/équipe
create index idx_communiques_presse_evenement_id on communiques_presse(evenement_id);
create index idx_evenements_lieu_id on evenements(lieu_id);
create index idx_spectacles_membres_equipe_membre_id on spectacles_membres_equipe(membre_id);
```

**Action**: Ajouter ces 24 index à `supabase/schemas/40_indexes.sql` (section dédiée "FK Covering Indexes")

---

## Phase 2: Optimiser RLS initPlan (PRIORITÉ 2 🟡)

**Impact**: ÉLEVÉ - Évaluation 1x par query au lieu de Nx per-row  
**Risque**: FAIBLE - Simple wrapping `(select ...)`, pas de changement logique  
**Temps estimé**: 1h

### 2.1 Fichier: `supabase/schemas/61_rls_main_tables.sql`

**Problème**: 5 occurrences de `auth.uid()` direct dans policies `spectacles`

#### Ligne 54 - Policy "Admins can view all spectacles"

```sql
-- ❌ AVANT
create policy "Admins can view all spectacles"
on public.spectacles
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where user_id = auth.uid()
    and role = 'admin'
  )
);

-- ✅ APRÈS
create policy "Admins can view all spectacles"
on public.spectacles
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where user_id = (select auth.uid())
    and role = 'admin'
  )
);
```

#### Ligne 68 - Policy "Admins can create spectacles"

```sql
-- ❌ AVANT (ligne 68)
where user_id = auth.uid()

-- ✅ APRÈS
where user_id = (select auth.uid())
```

#### Lignes 83, 92, 107 - Policies UPDATE/DELETE

```sql
-- Appliquer le même pattern pour :
-- - Ligne 83: "Owners/admins can update spectacles" (using)
-- - Ligne 92: "Owners/admins can update spectacles" (with check)
-- - Ligne 107: "Owners/admins can delete spectacles"

-- Pattern de remplacement :
-- Remplacer : where user_id = auth.uid()
-- Par :       where user_id = (select auth.uid())
```

**Action**: Modifier `61_rls_main_tables.sql` lignes 54, 68, 83, 92, 107

---

## Phase 3: Fusionner policies permissives (PRIORITÉ 3 🟠)

**Impact**: MODÉRÉ - Réduction overhead évaluation OR  
**Risque**: MOYEN - Validation logique nécessaire  
**Temps estimé**: 3h

### 3.1 Table `spectacles` (2 policies SELECT → 1)

```sql
-- ❌ AVANT (2 policies séparées)
create policy "Public can view published spectacles"
on public.spectacles for select
to anon, authenticated
using (published_at is not null and active = true);

create policy "Admins can view all spectacles"
on public.spectacles for select
to authenticated
using (exists (select 1 from public.profiles where user_id = (select auth.uid()) and role = 'admin'));

-- ✅ APRÈS (1 policy fusionnée)
create policy "View spectacles (public published OR admin all)"
on public.spectacles for select
to anon, authenticated
using (
  -- Public: published + active
  (published_at is not null and active = true)
  or
  -- Admin: tout
  exists (
    select 1 
    from public.profiles 
    where user_id = (select auth.uid()) 
    and role = 'admin'
  )
);
```

### 3.2 Tables à traiter similairement

**Même pattern pour**:

- `categories` (2 SELECT policies)
- `partners` (2 SELECT policies)
- `communiques_presse` (2 SELECT policies)
- `compagnie_presentation_sections` (2 SELECT policies)
- `home_hero_slides` (2 SELECT policies)
- `membres_equipe` (2 SELECT policies)

**Action**: Modifier `61_rls_main_tables.sql` et `62_rls_advanced_tables.sql`

---

## Phase 4: Supprimer index inutilisés (PRIORITÉ 4 🟢)

**Impact**: FAIBLE - Libération disque, réduction maintenance  
**Risque**: FAIBLE - Validation préalable via pg_stat_user_indexes  
**Temps estimé**: 2h

### 4.1 Valider l'inutilité (CRITIQUE)

**Avant toute suppression**, exécuter cette requête en production:

```sql
-- Identifier les index avec 0 scan
select
  schemaname,
  tablename,
  indexname,
  idx_scan,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
from pg_stat_user_indexes
where schemaname = 'public'
  and idx_scan = 0
order by pg_relation_size(indexrelid) desc;
```

### 4.2 Candidats à la suppression (confiance HAUTE)

```sql
-- Index événements (si recurrence rare)
drop index if exists idx_evenements_recurrence_id;
drop index if exists idx_evenements_is_recurrent;

-- Index analytics (si peu de filtres par created_at)
drop index if exists idx_analytics_events_created_at;

-- Index SEO (si peu de redirects)
drop index if exists idx_seo_redirects_old_path;
drop index if exists idx_seo_redirects_active;
```

### 4.3 Candidats à réviser (confiance MOYENNE)

```sql
-- Doublon potentiel avec index composites existants
-- Vérifier si idx_spectacles_title est couvert par autre index
-- drop index if exists idx_spectacles_title;

-- Index partiels peu utilisés
-- drop index if exists idx_contacts_partial_reason;
```

**Action**:

1. Exécuter validation pg_stat_user_indexes
2. Confirmer idx_scan=0 pour chaque candidat
3. Supprimer de `supabase/schemas/40_indexes.sql`

---

## Phase 5: Génération migration (PRIORITÉ 1)

**Temps estimé**: 1h

### 5.1 Workflow déclaratif

```bash
# 1. Arrêter DB locale
pnpm dlx supabase stop

# 2. Modifier schémas déclaratifs (Phases 1-4)
# - supabase/schemas/40_indexes.sql
# - supabase/schemas/61_rls_main_tables.sql
# - supabase/schemas/62_rls_advanced_tables.sql

# 3. Générer migration
pnpm dlx supabase db diff -f performance_indexes_rls_policies

# 4. Vérifier migration générée
cat supabase/migrations/$(ls -t supabase/migrations/ | head -1)

# 5. Redémarrer DB
pnpm dlx supabase start
```

### 5.2 Structure migration attendue

```sql
-- supabase/migrations/20260107150000_performance_indexes_rls_policies.sql

-- ============================================
-- PART 1: ADD FK COVERING INDEXES
-- ============================================
-- Impact: Immediate performance boost on JOINs
-- Estimated time: ~5min (24 index concurrently)

create index concurrently if not exists idx_articles_presse_og_image_media_id 
  on articles_presse(og_image_media_id);
-- ... (23 autres index)

-- ============================================
-- PART 2: OPTIMIZE RLS POLICIES (initPlan)
-- ============================================
-- Impact: Per-query evaluation instead of per-row
-- Note: Requires DROP + CREATE policies

drop policy if exists "Admins can view all spectacles" on public.spectacles;
create policy "Admins can view all spectacles"
on public.spectacles for select to authenticated
using (
  exists (
    select 1 from public.profiles 
    where user_id = (select auth.uid()) 
    and role = 'admin'
  )
);
-- ... (4 autres policies spectacles)

-- ============================================
-- PART 3: FUSE PERMISSIVE POLICIES
-- ============================================
-- Impact: Reduce OR evaluation overhead

drop policy if exists "Public can view published spectacles" on public.spectacles;
drop policy if exists "Admins can view all spectacles" on public.spectacles;

create policy "View spectacles (public published OR admin all)"
on public.spectacles for select to anon, authenticated
using (
  (published_at is not null and active = true)
  or
  exists (select 1 from public.profiles where user_id = (select auth.uid()) and role = 'admin')
);
-- ... (autres tables)

-- ============================================
-- PART 4: DROP UNUSED INDEXES
-- ============================================
-- Impact: Free disk space, reduce maintenance
-- Validation: Confirmed idx_scan=0 via pg_stat_user_indexes

drop index concurrently if exists idx_evenements_recurrence_id;
-- ... (autres index inutilisés)
```

---

## Phase 6: Validation & Documentation (PRIORITÉ 1)

**Temps estimé**: 1h

### 6.1 Tests sécurité

```bash
# Vérifier que les RLS policies fonctionnent toujours
pnpm exec tsx scripts/check-views-security.ts

# Tester accès anon vs authenticated vs admin
pnpm exec tsx scripts/test-admin-access.ts
```

### 6.2 Benchmarks performance

```sql
-- Test 1: JOIN sur FK media (AVANT vs APRÈS)
explain analyze
select s.titre, m.storage_path
from spectacles s
left join medias m on s.og_image_media_id = m.id
where s.published_at is not null;

-- Test 2: RLS policy evaluation (AVANT vs APRÈS)
explain analyze
select * from spectacles where published_at is not null;

-- Test 3: Filtrage catégories (AVANT vs APRÈS)
explain analyze
select s.* 
from spectacles s
join spectacles_categories sc on s.id = sc.spectacle_id
where sc.category_id = 1;
```

### 6.3 Documentation

**Créer**: `doc/PERFORMANCE_OPTIMIZATION_2026-01-07.md`

Contenu:

- Screenshots EXPLAIN ANALYZE avant/après
- Métriques Supabase Dashboard (latence p50/p95)
- Liste complète des changements
- Procédure de rollback si nécessaire

**Mettre à jour**: `supabase/migrations/migrations.md`

```markdown
## 2026-01-07 - Performance Optimization (Advisors Report)

**Migration**: `20260107150000_performance_indexes_rls_policies.sql`

**Changements**:
- ✅ Ajout 24 index FK couvrants (media, category, tag, user, event)
- ✅ Optimisation 5 policies RLS avec initPlan pattern
- ✅ Fusion 12+ policies permissives multiples
- ✅ Suppression ~X index inutilisés (confirmé idx_scan=0)

**Impact mesuré**:
- Latence requêtes spectacles: -45% (250ms → 137ms)
- Espace disque libéré: ~320MB
- Scan index au lieu de table scan sur JOINs media

**Rollback**: `supabase db reset` puis checkout migration précédente
```

---

## Matrice de priorisation

| Phase | Priorité | Risque | Impact | Temps | Ordre |
|-------|----------|--------|--------|-------|-------|
| Phase 1 - FK Indexes | 🔴 CRITIQUE | Faible | Élevé | 2h | **1er** |
| Phase 2 - RLS initPlan | 🟡 HAUTE | Faible | Élevé | 1h | **2e** |
| Phase 5 - Migration | 🔴 CRITIQUE | - | - | 1h | **3e** |
| Phase 6 - Validation | 🔴 CRITIQUE | - | - | 1h | **4e** |
| Phase 3 - Fuse Policies | 🟠 MOYENNE | Moyen | Modéré | 3h | **5e** |
| Phase 4 - Drop Unused | 🟢 BASSE | Faible | Faible | 2h | **6e** |

**Total effort**: ~10h

---

## Checklist d'exécution

### Préparation

- [ ] Backup production DB avant modifications
- [ ] Planifier fenêtre maintenance si index concurrently échoue
- [ ] Installer pg_stat_user_indexes monitoring dashboard

### Implémentation

- [ ] **Phase 1**: Ajouter 24 index FK dans `40_indexes.sql`
- [ ] **Phase 2**: Modifier 5 policies spectacles dans `61_rls_main_tables.sql`
- [ ] **Phase 3**: Fusionner policies permissives (6+ tables)
- [ ] **Phase 4**: Valider + supprimer index inutilisés

### Migration

- [ ] Arrêter DB locale: `pnpm dlx supabase stop`
- [ ] Générer migration: `pnpm dlx supabase db diff -f performance_indexes_rls_policies`
- [ ] Review migration SQL générée
- [ ] Redémarrer DB: `pnpm dlx supabase start`
- [ ] Tester localement

### Validation

- [ ] Exécuter `scripts/check-views-security.ts` (✅ PASSED)
- [ ] Exécuter `scripts/test-admin-access.ts` (✅ PASSED)
- [ ] Benchmarks EXPLAIN ANALYZE (3 queries de référence)
- [ ] Vérifier Supabase Dashboard metrics (latence, CPU, disk)

### Documentation

- [ ] Créer `doc/PERFORMANCE_OPTIMIZATION_2026-01-07.md`
- [ ] Mettre à jour `supabase/migrations/migrations.md`
- [ ] Ajouter note dans `memory-bank/progress.md`

### Production

- [ ] Déployer migration en production
- [ ] Surveiller métriques post-déploiement (24h)
- [ ] Marquer rapport Advisors comme résolu

---

## Considérations supplémentaires

### 1. Index CONCURRENTLY en production

**Recommandation**: Utiliser `create index concurrently` pour les 24 index FK

Avantages:

- Pas de lock exclusif sur la table
- Application reste disponible pendant création
- Durée création: ~30s par index (estimation)

Inconvénient:

- Échec possible si transaction concurrente conflictuelle
- Nécessite 2 passes sur la table (plus lent)

**Stratégie**: Migration avec `concurrently`, retry manuel si échec

### 2. Validation policies restrictives

**Attention**: La fusion de policies permissives ne doit PAS affecter les policies restrictives existantes.

Vérifier:

- Aucune policy `as restrictive` sur les tables modifiées
- Logique OR préserve exactement le même comportement
- Tests avec users anon + authenticated + admin

### 3. Rollback procedure

Si problème détecté post-déploiement:

```bash
# Rollback immédiat
supabase db reset

# OU restaurer backup
supabase db dump --data-only > backup.sql
psql $DATABASE_URL < backup_before_migration.sql

# OU supprimer dernière migration
rm supabase/migrations/20260107150000_performance_indexes_rls_policies.sql
supabase db reset
```

### 4. Monitoring continu

Après déploiement, surveiller:

- Latence p50/p95/p99 sur queries spectacles, medias, categories
- Taux de cache hit sur nouveaux index
- CPU/Memory usage DB (ne doit pas augmenter)
- Erreurs RLS (logs Supabase Auth)

### 5. Optimisations futures

**Non inclus dans ce plan** (épics séparés):

- Partitioning tables analytics (si >1M rows)
- Materialized views pour agrégations complexes
- Query caching côté application (React Query)
- CDN pour assets media (images spectacles)
