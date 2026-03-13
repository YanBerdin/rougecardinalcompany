# Plan : Résolution Design Review 2026-03-09

L'audit a identifié **aucun problème majeur** mais 3 recommandations d'amélioration. L'exploration du codebase montre que les attributs `sizes` sont déjà tous corrects (13/13) — il reste 2 vrais chantiers.

---

## Phase 1 — Skip Link Global (A11y WCAG 2.4.1)

**1.1** Ajouter `id="main-content"` sur le `<main>` dans `app/(marketing)/layout.tsx` (ligne 24, actuellement sans id)

**1.2** Ajouter un lien "Aller au contenu principal" en premier enfant du layout, avant `<PageViewTracker />`

- Réutiliser le pattern existant de `components/features/public-site/spectacles/SpectacleDetailView.tsx` lignes 27-34 (classes `sr-only focus:not-sr-only...`)

**1.3** _(parallèle)_ Idem dans le layout admin pour cohérence a11y

## Phase 2 — Placeholder Spectacle Dédié

**2.1** Créer `public/placeholder-spectacle.svg` — silhouette théâtrale sobre, ratio 3:4

**2.2** Créer `components/features/public-site/spectacles/constants.ts` avec `FALLBACK_SPECTACLE_IMAGE` — identique au pattern de `components/features/public-site/compagnie/constants.ts` ligne 17

**2.3** Remplacer les 3 occurrences de `"/opengraph-image.png"` par la constante dans :

- `components/features/public-site/spectacles/SpectaclesContainer.tsx` (lignes 27, 42)
- `components/features/public-site/spectacles/SpectaclesView.tsx` (lignes 60, 142)

## Phase 3 — Aucune action code

- **Attributs `sizes`** : Exploration complète → 11 images `fill` ont toutes un `sizes` correct, 2 images fixes utilisent `width/height` — tout est conforme
- **Warning LCP** : Faux positif (image below the fold), pas d'action
- **Web Vitals monitoring** : Documenter, pas de code à changer (Sentry Performance déjà intégré)

---

## Fichiers à modifier

- `app/(marketing)/layout.tsx` — Skip link + `id` sur `<main>`
- `app/(admin)/layout.tsx` — Skip link (optionnel, cohérence)
- `public/placeholder-spectacle.svg` — **Nouveau** — Image placeholder
- `components/features/public-site/spectacles/constants.ts` — **Nouveau** — Constante fallback
- `components/features/public-site/spectacles/SpectaclesContainer.tsx` — Import constante
- `components/features/public-site/spectacles/SpectaclesView.tsx` — Import constante

## Fichiers de référence (patterns à réutiliser)

- `components/features/public-site/spectacles/SpectacleDetailView.tsx` lignes 27-34 — Pattern skip link existant
- `components/features/public-site/compagnie/constants.ts` ligne 17 — Pattern constante fallback

## Vérification

1. Presser Tab sur le site → le skip link apparaît et navigue vers `#main-content`
2. Spectacle sans image → le placeholder SVG s'affiche correctement sur les 3 viewports
3. `pnpm build` et `pnpm lint` sans erreur
4. Vérification visuelle desktop/tablette/mobile sur `/spectacles`

## Décisions

- `sizes` → aucune action (déjà conforme après exploration)
- SVG préféré (léger, vectoriel, pas de pixélisation)
- Scope exclu : monitoring Web Vitals (task séparée si besoin)
