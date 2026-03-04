# Plan de correction — TASK074 Audit Public Spectacles

> **Audit source** : `doc/TASK074-audit-public-spectacles.md`  
> **Branche** : `refactor/task074-audit-public-spectacles`  
> **16 violations** : 2 CRITICAL, 7 MAJOR, 4 MINOR, 3 SUGGESTION  
> **Version** : 1.1 — Post-implémentation  
> **Dernière mise à jour** : Juillet 2025

### Historique des versions

| Version | Date | Description |
|---------|------|-------------|
| 1.0 | Juin 2025 | Plan initial pré-implémentation |
| 1.1 | Juillet 2025 | Mise à jour post-implémentation — statut par étape, divergences documentées, section ticket_url ajoutée |

### Légende des statuts

| Icône | Signification |
|-------|---------------|
| ✅ | Implémenté conforme au plan |
| ⚠️ | Implémenté avec divergence (détails dans la section) |
| ❌ | Non implémenté |

---

## Phase 1 — CRITICAL (2 violations) ✅

### Étape 1.1 — Conflit `force-dynamic` / `revalidate` (violation 3.1) ✅

**Fichier** : `app/(marketing)/spectacles/[slug]/page.tsx` (lignes 8-9)

**Action** : Supprimer `export const dynamic = "force-dynamic"` et conserver uniquement `export const revalidate = 60` (ISR). Les données spectacle ne sont pas temps réel.

```diff
- export const dynamic = "force-dynamic";
  export const revalidate = 60;
```

**Vérification** : `pnpm build` — la page `[slug]` doit apparaître en ISR (icône ○), pas en λ (dynamique).

---

### Étape 1.2 — Supprimer 5 `console.log` actifs dans le DAL (violation 3.2) ✅

**Fichier** : `lib/dal/spectacles.ts` (lignes ~215, 226, 230, 246, 254)

**Action** : Supprimer les 5 lignes `console.log` dans `fetchSpectacleBySlug`. Conserver les `console.error` existants.

```diff
- console.log("[fetchSpectacleBySlug] Input:", slugOrId, "| isNumeric:", isNumeric);
- console.log("[fetchSpectacleBySlug] Querying by ID:", id);
- console.log("[fetchSpectacleBySlug] Querying by slug:", slugOrId);
- console.log("[fetchSpectacleBySlug] Raw data received:", data);
- console.log("[fetchSpectacleBySlug] Success! Returning spectacle:", parsed.data.title);
```

**Vérification** : `grep -n "console.log" lib/dal/spectacles.ts` → 0 résultat.

---

## Phase 2 — MAJOR (7 violations)

### Étape 2.1 — Remplacer `backgroundImage` CSS par `next/image` (violation 3.3) ✅

**Fichier** : `SpectaclesView.tsx` — 2 occurrences (grille current shows ~ligne 66, grille archives ~ligne 157)

**Action** : Remplacer les `<div style={{ backgroundImage }}` par `<Image fill>` de `next/image` avec :
- `alt={`Affiche du spectacle ${show.title}`}`
- `sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"`
- `className="object-cover"` sur l'Image
- Conteneur parent avec `position: relative` + `overflow: hidden`

**Impact** : Optimisation WebP/AVIF automatique, lazy loading natif, conformité WCAG 1.1.1 (alt text).

---

### Étape 2.2 — Supprimer fichier mort `hooks.ts` (violation 3.4) ✅

**Fichiers** :
1. **Supprimer** `components/features/public-site/spectacles/hooks.ts` (129 lignes, 100% commenté)
2. **Modifier** `components/features/public-site/spectacles/index.ts` — supprimer la ligne commentée `// export * from './hooks';`

**Vérification** : `ls components/features/public-site/spectacles/hooks.ts` → fichier absent.

---

### Étape 2.3 — Remplacer `getMediaPublicUrl` par `buildMediaPublicUrl` (violation 3.5) ✅

**Fichier** : `SpectacleDetailView.tsx`

**Action** :
1. Supprimer la fonction inline `getMediaPublicUrl` (lignes 36-38)
2. Supprimer l'import `import { env } from "@/lib/env"` si devenu inutile
3. Ajouter `import { buildMediaPublicUrl } from "@/lib/dal/helpers"`
4. Remplacer tous les appels `getMediaPublicUrl(x)` par `buildMediaPublicUrl(x)`

**Note** : `buildMediaPublicUrl` accepte `string | null` et retourne `string | null` — ajouter des guards `?? ""` si le contexte attend une string non-nullable.

---

### Étape 2.4 — Remplacer `formatDate` / `formatDuration` inline par helpers centralisés (violation 3.6) ✅

**Fichier** : `SpectacleDetailView.tsx` (lignes 69-82)

**Problème de format** : Les helpers inline et centralisés diffèrent :
| Inline | Centralisé | Différence |
|--------|-----------|------------|
| `formatDate` → "15 octobre" (sans année) | `formatSpectacleDetailDate` → "15 octobre 2024" (avec année) | Année en plus |
| `formatDuration` → "1h 30min" (lisible) | `formatSpectacleDuration` → "90 min" (compact) | Format différent |

**Action** : Créer 2 nouvelles variantes dans `lib/tables/spectacle-table-helpers.tsx` :
1. `formatSpectaclePremiereShort(dateString)` → "15 octobre" (sans année, pour la page publique)
2. `formatDurationHumanReadable(minutes)` → "1h 30min" (pour la page publique)

Puis :
1. Supprimer les fonctions inline `formatDate` et `formatDuration` de `SpectacleDetailView.tsx`
2. Importer les nouvelles variantes depuis `@/lib/tables/spectacle-table-helpers`

---

### Étape 2.5 — Extraire composant `SpectacleCTABar` (violation 3.7) ⚠️

**Fichier** : `SpectacleDetailView.tsx` (2 blocs CTA dupliqués ~lignes 236-260 et ~314-350)

**Action planifiée** :
1. Créer `components/features/public-site/spectacles/SpectacleCTABar.tsx`
2. Props : `{ title: string; agendaLabel?: string; backLabel?: string }`
3. Contient les 3 boutons : Réserver, Agenda, Retour (avec `aria-label` dynamiques)
4. Remplacer les 2 blocs dans `SpectacleDetailView.tsx` par `<SpectacleCTABar title={spectacle.title} />`

**Vérification** : Visuellement identique, fichier `SpectacleDetailView.tsx` réduit de ~40 lignes.

> **⚠️ Divergence d'implémentation** :
>
> Les props ont été enrichies pour intégrer le `ticket_url` provenant de `evenements` :
>
> | Aspect | Plan | Implémentation réelle |
> |--------|------|-----------------------|
> | Props | `{ title, agendaLabel?, backLabel? }` | `{ title, ticketUrl?, agendaLabel?, backLabel?, wrapperClassName? }` |
> | CTA "Réserver" | `href="/contact?subject=reservation"` | `href={ticketUrl ?? "/contact?subject=reservation"}` |
> | Lien externe | Non prévu | `target="_blank" rel="noopener noreferrer"` si `ticketUrl` |
> | `wrapperClassName` | Non prévu | Ajouté pour flexibilité de positionnement (sticky, responsive) |
>
> Voir §6 du document d'audit pour les détails complets du pipeline `ticket_url`.

---

### Étape 2.6 — Corriger HTML invalide `<Button asChild>` dans `<Link>` (violation 3.8) ⚠️

**Fichier** : `SpectaclesView.tsx` — 3 occurrences (lignes ~73-79, ~82-87, ~166-172)

**Action planifiée** : Remplacer par des `<span>` stylés comme des boutons visuels sans composant `Button` avec label "Découvrir" et icône `ArrowRight`.

```tsx
<span className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
  <ArrowRight className="h-4 w-4" />
  Découvrir
</span>
```

> **⚠️ Divergence d'implémentation** :
>
> L'approche réelle est une restructuration complète avec des liens indépendants au lieu de `<span>` dans un `<Link>` englobant :
>
> | Aspect | Plan | Implémentation réelle |
> |--------|------|-----------------------|
> | Élément | `<span>` dans `<Link>` englobant | 2 `<Link>` indépendants (aucun parent `<a>`) |
> | Label | "Découvrir" | "Réserver mes billets" + "Détails" |
> | Icônes | `ArrowRight` uniquement | `Ticket` (réserver) + `Play` (détails) |
> | Actions | 1 action (détail) | 2 actions distinctes (réservation + détail) |
> | ticket_url | Non prévu | `href={show.ticketUrl ?? getSpectacleUrl(show)}` |
> | Lien externe | Non prévu | `target="_blank"` si `ticketUrl` présent |
> | Périmètre | `SpectaclesView.tsx` uniquement | `SpectaclesView.tsx` + `ShowCard.tsx` (home page) |
>
> **Avantage** : HTML nativement valide (pas de `<a>` imbriqué), séparation claire des intentions utilisateur (réserver vs. consulter), support de la billetterie externe.

**Impact** : HTML valide, 2 actions distinctes, support billetterie externe, appliqué à SpectaclesView ET ShowCard.

---

### Étape 2.7 — Corriger mapping sémantique `premiere → created_at` (violation 3.9) ✅

**Fichier** : `SpectaclesContainer.tsx` (lignes ~43-44)

**Pré-requis confirmé** : `created_at` et `updated_at` ne sont PAS consommés dans `SpectaclesView.tsx` (grep : 0 résultat).

**Action** :
1. Supprimer `created_at` et `updated_at` du mapping dans `SpectaclesContainer.tsx`
2. Supprimer `created_at`, `updated_at`, `public`, `created_by` de `CurrentShowSchema` dans `lib/schemas/spectacles.ts` (tous inutilisés)

```diff
  // SpectaclesContainer.tsx — suppression des champs
- created_at: s.premiere ?? "",
- updated_at: s.premiere ?? "",

  // lib/schemas/spectacles.ts — CurrentShowSchema
- created_at: z.string(),
- updated_at: z.string(),
- public: z.boolean(),
- created_by: z.string().optional(),
```

**Vérification** : `pnpm build` — aucune erreur TypeScript sur `created_at`.

---

## Phase 3 — MINOR (4 violations) ✅

### Étape 3.1 — Supprimer prop `loading` redondante (violation 3.10) ✅

**Fichiers** :
1. `components/features/public-site/spectacles/types.ts` — supprimer `loading?: boolean` de `SpectaclesViewProps`
2. `SpectaclesView.tsx` — supprimer le bloc `if (loading) return <SpectaclesSkeleton />;` (lignes 31-33)
3. `SpectaclesContainer.tsx` — supprimer `loading={false}` du JSX (ligne 82)

Le `Suspense` dans `app/(marketing)/spectacles/page.tsx` gère déjà le loading state.

---

### Étape 3.2 — Supprimer 4 blocs de code commenté (violation 3.11) ✅

| Fichier | Lignes | Contenu |
|---------|--------|---------|
| `SpectaclesContainer.tsx` | ~13-23 | DEBUG console.log block |
| `SpectaclesContainer.tsx` | ~70-76 | Second DEBUG block |
| `SpectacleDetailView.tsx` | ~385-398 | Ancien placement carousel (14 lignes) |
| `SpectacleDetailView.tsx` | ~8 | `// ArrowRight,` import commenté |

---

### Étape 3.3 — Corriger espaces dans `<main>` (violation 3.12) ✅

**Fichier** : `SpectacleDetailView.tsx`

```diff
- <main className=" bg-background text-foreground ...">
+ <main className="bg-background text-foreground ...">

- </main >
+ </main>
```

---

### Étape 3.4 — Ajouter guard sur `new Date(show.premiere)` (violation 3.13) ✅

**Fichier** : `SpectaclesView.tsx` (ligne ~117)

**Action** : Remplacer l'appel `new Date()` nu par un helper safe ou un guard :

```tsx
// ✅ Avec guard
{show.premiere && (
  <p>Première : {new Date(show.premiere).toLocaleDateString("fr-FR")}</p>
)}
```

Ou mieux, utiliser le nouveau helper `formatSpectaclePremiereShort` créé à l'étape 2.4 :

```tsx
{show.premiere && (
  <p>Première : {formatSpectaclePremiereShort(show.premiere)}</p>
)}
```

---

## Phase 4 — SUGGESTIONS (2 sur 3) ✅

> La violation 3.16 (compound components) est un refactoring architectural important. Elle est documentée mais **hors scope** de ce plan.

### Étape 4.1 — Extraire `usePrefersReducedMotion` dans `lib/hooks/` (violation 3.14) ✅

**Source** : `SpectacleCarousel.tsx` (lignes 370-391)

**Action** :
1. Créer `lib/hooks/use-prefers-reduced-motion.ts` avec le hook extrait
2. Mettre à jour `SpectacleCarousel.tsx` pour importer depuis `@/lib/hooks/use-prefers-reduced-motion`
3. Supprimer la définition locale du hook

---

### Étape 4.2 — Extraire `LandscapePhotoCard` dans un fichier dédié (violation 3.15) ✅

**Source** : `SpectacleDetailView.tsx` (lignes 43-58)

**Action** :
1. Créer `components/features/public-site/spectacles/LandscapePhotoCard.tsx`
2. Déplacer le composant avec ses types/props
3. Importer dans `SpectacleDetailView.tsx`

**Impact** : Réduit `SpectacleDetailView.tsx` sous la limite de 300 lignes (combiné avec extraction CTA).

---

## Phase 5 — Tests de non-régression ❌

> **Non implémentée.** Les validations se limitent à `pnpm build` (exit code 0) et `pnpm lint` (0 erreurs). Les scripts de test DAL/schéma et les tests E2E Playwright n'ont pas été créés dans cette itération.

### 5.1 — Enrichir `scripts/test-spectacles-dal.ts` ❌

Le script existant (206 lignes) teste `fetchAllSpectacles`, `fetchSpectacleById`, `fetchSpectacleBySlug`.

**Ajouts** :
- Test que `fetchSpectacleBySlug` ne produit pas de `console.log` (vérifier output)
- Test que le résultat parsé par le schéma Zod est valide après suppression des champs `created_at`/`updated_at`/`public`/`created_by`

---

### 5.2 — Créer `scripts/test-spectacles-schemas.ts` ❌

**Tests** :
- `CurrentShowSchema.parse()` avec données valides → success
- `CurrentShowSchema.parse()` sans `created_at` → success (champ supprimé)
- `ArchivedShowSchema.parse()` avec données valides → success
- Validation des types après refactoring

---

### 5.3 — Créer test E2E `e2e-tests/spectacles.spec.ts` ❌

**Pré-requis** : Créer `playwright.config.ts` si absent (base sur `http://localhost:3000`).

**Tests Playwright** :
1. **Page listing** (`/spectacles`) :
   - Chargement sans erreur (status 200)
   - Présence d'au moins 1 spectacle dans le DOM
   - Images rendues via `<img>` (next/image) et non via `background-image`
   - Pas de `<button>` imbriqué dans un `<a>`
2. **Page détail** (`/spectacles/{slug}`) :
   - Chargement sans erreur (status 200)
   - Présence du titre du spectacle
   - Boutons CTA visibles (Réserver, Agenda, Retour)
   - Pas de texte "Invalid Date" dans la page
   - Carousel gallery accessible au clavier (Tab + Enter)
3. **Page 404** (`/spectacles/slug-inexistant`) :
   - Affiche le contenu 404 custom

---

### 5.4 — Vérifications automatisées ❌

```bash
# TypeScript — aucune erreur de compilation
pnpm build

# ESLint — aucun nouveau warning/error
pnpm lint

# Test DAL existant
pnpm exec tsx scripts/test-spectacles-dal.ts

# Test schémas (nouveau)
pnpm exec tsx scripts/test-spectacles-schemas.ts

# Test E2E (si playwright configuré)
pnpm exec playwright test e2e-tests/spectacles.spec.ts
```

---

## Résumé des fichiers impactés

> **Mise à jour v1.1** : fichiers additionnels marqués avec ★ (hors périmètre initial).

| Action | Fichier | Phase | Statut |
|--------|---------|-------|--------|
| **Modifier** | `app/(marketing)/spectacles/[slug]/page.tsx` | 1 | ✅ |
| **Modifier** | `lib/dal/spectacles.ts` | 1, 6 | ✅ |
| **Modifier** | `SpectaclesView.tsx` | 2, 3 | ✅ |
| **Modifier** | `SpectacleDetailView.tsx` | 2, 3 | ✅ |
| **Modifier** | `SpectaclesContainer.tsx` | 2, 3, 6 | ✅ |
| **Modifier** | `lib/schemas/spectacles.ts` (`CurrentShowSchema`) | 2, 6 | ✅ |
| **Modifier** | `lib/tables/spectacle-table-helpers.tsx` (2 variantes) | 2 | ✅ |
| **Modifier** | `components/features/public-site/spectacles/types.ts` | 3 | ✅ |
| **Modifier** | `components/features/public-site/spectacles/index.ts` | 2 | ✅ |
| **Modifier** | `SpectacleCarousel.tsx` | 4 | ✅ |
| **Supprimer** | `components/features/public-site/spectacles/hooks.ts` | 2 | ✅ |
| **Créer** | `components/features/public-site/spectacles/SpectacleCTABar.tsx` | 2 | ✅ |
| **Créer** | `components/features/public-site/spectacles/LandscapePhotoCard.tsx` | 4 | ✅ |
| **Créer** | `lib/hooks/use-prefers-reduced-motion.ts` | 4 | ✅ |
| ★ **Modifier** | `components/features/public-site/home/shows/ShowCard.tsx` | 2, 6 | ✅ |
| ★ **Modifier** | `components/features/public-site/home/shows/ShowsContainer.tsx` | 6 | ✅ |
| ★ **Modifier** | `components/features/public-site/home/shows/types.ts` | 6 | ✅ |
| **Créer** | `scripts/test-spectacles-schemas.ts` | 5 | ❌ |
| **Créer** | `e2e-tests/spectacles.spec.ts` | 5 | ❌ |
| **Créer** | `playwright.config.ts` (si absent) | 5 | ❌ |

**Total réalisé** : 14 fichiers modifiés, 1 supprimé, 4 créés (dont 3 hors périmètre initial). 3 fichiers non créés (Phase 5).

---

## Phase 6 — Travaux complémentaires : intégration `ticket_url` ✅

> **Hors scope initial.** Cette phase a été ajoutée en cours d'implémentation pour connecter les CTA de réservation à la billetterie externe via `evenements.ticket_url`.

### 6.1 — Fonctions DAL `ticket_url`

Deux fonctions ajoutées dans `lib/dal/spectacles.ts` :

| Fonction | Usage | Retour |
|----------|-------|--------|
| `fetchSpectacleTicketUrl(spectacleId)` | Page détail `[slug]` | `string \| null` (cache React) |
| `fetchTicketUrlsForSpectacles(spectacleIds)` | Liste + home | `Map<number, string>` |

Requête : premier événement futur trié par `date_debut asc`, `ticket_url is not null`.

### 6.2 — Enrichissement schéma Zod

`CurrentShowSchema` enrichi avec `ticketUrl: z.string().nullable().optional()`.

### 6.3 — Enrichissement containers

- `SpectaclesContainer.tsx` : batch fetch via `fetchTicketUrlsForSpectacles`, injection dans chaque show
- `ShowsContainer.tsx` (home) : idem pour la section "À l'affiche"
- `[slug]/page.tsx` : fetch parallèle via `fetchSpectacleTicketUrl`

### 6.4 — Comportement CTA dynamique

| Composant | ticketUrl présent | ticketUrl absent |
|-----------|-------------------|------------------|
| `SpectacleCTABar` | Lien externe `target="_blank"` | Lien vers `/contact?subject=reservation` |
| `SpectaclesView` (current) | Lien externe `target="_blank"` | Lien vers page détail |
| `ShowCard` (home) | Lien externe `target="_blank"` | Lien vers page détail |

---

## Ordre d'exécution recommandé (mis à jour v1.1)

1. **Phase 1** (CRITICAL) — 2 étapes ✅
2. **Phase 3** (MINOR) — 4 étapes ✅
3. **Phase 2** (MAJOR) — 7 étapes ✅ (dont 2 avec divergences)
4. **Phase 4** (SUGGESTIONS) — 2 étapes ✅
5. **Phase 6** (COMPLÉMENTAIRE) — ticket_url ✅
6. **Phase 5** (TESTS) — ❌ non implémentée
7. `pnpm build && pnpm lint` — ✅ validation réussie (0 erreurs)
