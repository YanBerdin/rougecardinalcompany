# Plan: TASK034 Performance Optimization

Optimiser les performances DB/frontend : suppression délais artificiels, SELECT * → colonnes, ISR avec client anon, bundle analysis, revalidateTag, React cache(), index slug, et streaming Presse.

## Phases Overview

| Phase | Description | Impact | Statut | Date |
|-------|-------------|--------|--------|------|
| 1 | Supprimer délais artificiels | 🔥 Très élevé (5-8s gain) | ✅ **Complet** | 2026-01-16 |
| 2 | SELECT * → colonnes explicites | 🔶 Élevé (bande passante) | ✅ **Complet** | 2026-01-16 |
| 3 | ISR sur pages publiques | 🔶 Élevé (cache cross-request) | ✅ **Complet** | 2026-01-16 |
| 4 | Index partiel spectacles.slug | 🔷 Moyen (lookup query) | ✅ **Complet** | 2026-01-16 |
| 5 | Streaming Presse page | 🔷 Moyen (TTI) | ✅ **Complet** | 2026-01-16 |
| 6 | Bundle analyzer | 🔷 Moyen (identification) | ✅ **Complet** | 2026-01-16 |
| 7 | revalidateTag + unstable_cache | 🔶 Élevé (granular cache) | ✅ **Complet** | 2026-01-16 |
| 8 | React cache() intra-request | 🔶 Élevé (déduplication) | ✅ **Complet** | 2026-01-16 |

**Légende Impact**: 🔥 Très élevé | 🔶 Élevé | 🔷 Moyen

**✅ TASK034 COMPLET** - Toutes les 8 phases d'optimisation performance implémentées (2026-01-16)

## Steps

### 1. Supprimer les délais artificiels (~20 fichiers containers)

Retirer `await delay()` / `sleep()` dans `components/features/` et `app/` — gain 5-8s latence.

**Fichiers cibles** (grep `delay|sleep` marqués `TODO`):
- `components/features/public-site/home/*Container.tsx`
- `components/features/public-site/agenda/AgendaContainer.tsx`
- `components/features/public-site/spectacles/SpectaclesContainer.tsx`
- `components/features/public-site/compagnie/*Container.tsx`
- `components/features/public-site/presse/*Container.tsx`
- `components/features/admin/*/...`

### 2. Optimiser SELECT * → colonnes explicites dans 6 DAL publics

**Fichiers**:
- `lib/dal/spectacles.ts`
- `lib/dal/home.ts`
- `lib/dal/press.ts`
- `lib/dal/compagnie.ts`
- `lib/dal/media.ts`
- `lib/dal/site-config.ts`

**Pattern**:
```typescript
// ❌ Avant
.select('*')

// ✅ Après
.select('id, title, slug, description, image_url, published_at')
```

### 3. Activer ISR sur pages publiques (sans créer nouveau client)

⚠️ **CRITICAL**: NE PAS créer `createAnonClient()` - violerait les règles Supabase auth (cookies pattern).

**Pages à migrer vers ISR** (`revalidate = 60`):
- `app/(marketing)/page.tsx`
- `app/(marketing)/spectacles/page.tsx`
- `app/(marketing)/compagnie/page.tsx`
- `app/(marketing)/presse/page.tsx`

**Pattern migration**:
```typescript
// ❌ Avant
export const dynamic = 'force-dynamic';

// ✅ Après
export const revalidate = 60; // ISR 60 secondes
// Note: retirer 'force-dynamic' pour permettre ISR
```

**Client Supabase**: Continuer à utiliser `createClient()` de `@/supabase/server` (déjà optimisé avec JWT Signing Keys + pattern cookies getAll/setAll)

### 4. Optimiser index `spectacles.slug` existant

⚠️ **DÉCOUVERTE**: Un index `idx_spectacles_slug` existe déjà dans `supabase/schemas/06_table_spectacles.sql` (ligne 50)

**Action**: Convertir en index partiel pour optimiser les pages publiques uniquement

**Migration**: `supabase/migrations/20260116XXXXXX_optimize_spectacles_slug_index.sql`
```sql
-- Supprimer l'index existant (non partiel)
drop index if exists public.idx_spectacles_slug;

-- Créer index partiel optimisé pour spectacles publiés
create index idx_spectacles_slug_published 
  on public.spectacles(slug) 
  where status = 'published';
```

**Schéma déclaratif**: `supabase/schemas/06_table_spectacles.sql`
- Modifier la ligne 50 pour utiliser l'index partiel

### 5. Ajouter streaming Presse avec Suspense boundaries

**Fichier**: `components/features/public-site/presse/PresseServerGate.tsx`

Wrapper chaque section avec `<Suspense>` + skeletons dédiés:
- Media Kit section
- Press Releases section
- Articles section

**Pattern**:
```tsx
<Suspense fallback={<MediaKitSkeleton />}>
  <MediaKitSection />
</Suspense>
<Suspense fallback={<PressReleasesSkeleton />}>
  <PressReleasesSection />
</Suspense>
```

### 6. Installer bundle analyzer

**Commande**:
```bash
pnpm add -D @next/bundle-analyzer cross-env
```

**Config `next.config.ts`**:
```typescript
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer(nextConfig);
```

**Script `package.json`**:
```json
"analyze": "cross-env ANALYZE=true next build"
```

**Modules à lazy-load après analyse**:
- `@dnd-kit/core`, `@dnd-kit/sortable` (admin only)
- Heavy admin components

### 7. Implémenter revalidateTag granulaire

⚠️ **ATTENTION**: Tags ne s'appliquent PAS aux queries Supabase client directement!

**Solution**: Wrapper les DAL functions avec `unstable_cache()` de Next.js

**Pattern**:
```typescript
// lib/dal/spectacles.ts
import { unstable_cache } from 'next/cache';

export const fetchPublishedSpectacles = unstable_cache(
  async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("spectacles")
      .select("...");
    // ... existing logic
    return data;
  },
  ['published-spectacles'], // Cache key
  {
    tags: ['spectacles'],
    revalidate: 60
  }
);
```

**Server Actions**:
```typescript
// lib/actions/spectacles-actions.ts
import { revalidateTag } from 'next/cache';

export async function updateSpectacleAction(id: string, input: unknown) {
  const result = await updateSpectacle(BigInt(id), input);
  if (!result.success) return result;
  
  // ✅ Invalidation granulaire par tag
  revalidateTag('spectacles');
  
  return result;
}
```

**Tags à créer**:
- `spectacles`, `hero`, `team`, `press`, `partners`, `compagnie`

### 8. Stratégie de cache DAL (React cache() + unstable_cache())

⚠️ **IMPORTANT**: Ne PAS combiner `cache()` et `unstable_cache()` sur la même fonction!

**Deux approches selon le besoin**:

#### Approche A: Déduplication intra-request (React cache)
Pour fonctions appelées plusieurs fois dans le même request (composants voisins).

```typescript
import { cache } from 'react';

export const fetchActiveTeamMembers = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("membres_equipe")
    .select("...");
  // ... existing logic
  return data;
});
```

**Avantages**: Simple, déduplication automatique par request, pas de TTL à gérer.

#### Approche B: Cache inter-request avec tags (unstable_cache)
Pour données publiques réutilisées entre requests, avec invalidation granulaire.

```typescript
import { unstable_cache } from 'next/cache';

export const fetchPublishedSpectacles = unstable_cache(
  async () => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("spectacles")
      .select("...");
    return data;
  },
  ['published-spectacles'],
  {
    tags: ['spectacles'],
    revalidate: 60
  }
);
```

**Avantages**: Cache persistant entre requests, `revalidateTag()` granulaire, TTL configurable.

**Fonctions cibles**:

| Fonction | Pattern | Raison |
|----------|---------|--------|
| `fetchActiveTeamMembers` | React cache() | Appelé 1-2× par page, dédup suffit |
| `fetchPublishedSpectacles` | unstable_cache() | Pages publiques, invalidation admin |
| `fetchActiveHomeHeroSlides` | unstable_cache() | Homepage hit rate élevé |
| `fetchCompanyStats` | React cache() | Appelé 1× par page admin |

---

## Phase 8 Status: ✅ COMPLETE (2026-01-16)

**React cache() wrapper implementation completed:**
- 12 DAL files modified
- 21 read functions wrapped with cache()
- TypeScript compilation: ✅ Clean
- Test script created: `scripts/test-all-dal-functions.ts`

**Files wrapped:**
- site-config.ts (2), compagnie.ts (2), home-about.ts (2)
- home-shows.ts (1), home-news.ts (1), home-partners.ts (1)
- home-hero.ts (1), spectacles.ts (4), presse.ts (3)
- agenda.ts (2), team.ts (2), compagnie-presentation.ts (1)

**Benefits:**
- Intra-request deduplication for frequently called DAL functions
- Compatible with cookies() (unlike unstable_cache)
- Combined with ISR (revalidate=60) for cross-request caching

---

## Estimation

| Phase | Effort | Impact |
|-------|--------|--------|
| 1. Délais artificiels | 0.5j | Immédiat (-5s latence) |
| 2. SELECT * → cols | 1j | DB payload -40% |
| 3. ISR (sans nouveau client) | 0.5j | Cache edge activé |
| 4. Optimiser index slug | 0.5j | Spectacles SEO -30ms |
| 5. Streaming Presse | 0.5j | TTFB amélioré |
| 6. Bundle analyzer | 0.5j | Diagnostic client |
| 7. unstable_cache + tags | 1j | Invalidation ciblée |
| 8. Stratégie cache DAL | 0.5j | Dédup requests |
| **Total** | **5 jours** | |

---

## Fichiers Clés à Créer/Modifier

### Nouveaux fichiers
- `supabase/migrations/20260116XXXXXX_optimize_spectacles_slug_index.sql`

### Fichiers à NE PAS créer
- ❌ `supabase/anon.ts` — Viole les règles Supabase auth (cookies pattern)

### Fichiers à modifier
- `supabase/schemas/06_table_spectacles.sql` — Index slug partiel (ligne 50)
- `next.config.ts` — Bundle analyzer config
- `package.json` — Script `"analyze"`
- ~20 containers — Suppression délais artificiels
- 6-8 DAL publics — SELECT colonnes explicites
- 4 pages marketing — ISR (retirer force-dynamic)
- `PresseServerGate.tsx` — Suspense boundaries
- `lib/actions/*.ts` — revalidateTag granulaire
- ~4 DAL hot paths — React cache() ou unstable_cache()

---

## Validation

### Tests de performance
1. Mesurer TTFB avant/après sur pages clés (Lighthouse)
2. Vérifier cache headers avec `curl -I`
3. Valider ISR avec `x-nextjs-cache: HIT`

### Tests fonctionnels
1. Vérifier que les pages publiques affichent les bonnes données
2. Tester invalidation après mutation admin
3. Valider que les pages admin fonctionnent toujours (cookies requis)

### Métriques cibles
- TTFB homepage: < 200ms (vs ~800ms actuellement)
- LCP: < 2.5s
- Bundle size reduction: 10-20%
