# [TASK038] — Responsive Testing & Accessibilité (rescoped)

**Status:** Pending
**Added:** 2026-02-10 (original)
**Updated:** 2026-03-17 (rescoped post-TASK078)

## Rescope Note (2026-03-17)

Le plan original (créé avant TASK078) prévoyait :

- Phase 0 : Ajouter `data-testid` aux composants (non fait)
- Phase 1 : Créer `playwright.config.ts` (✅ fait dans TASK078)
- Phase 2 : Créer `tests/` (✅ fait dans TASK078)
- Phase 3 : Auth fixture Supabase (✅ fait dans TASK078)

**Rescope** : se concentrer uniquement sur les tests responsive, accessibilité et thème.
Les `data-testid` ne sont pas nécessaires pour ces tests (sélecteurs role/label suffisent).

## Original Request

Implémenter les tests couvrant le responsive design, l'accessibilité WCAG 2.2,
et le thème dark/light — définis dans `specs/PLAN_DE_TEST_COMPLET.md` section 21.1, 21.2, 21.3.

## Périmètre

### Sections couvertes

| Section | IDs | Cas | Priorité |
| ------- | --- | --- | -------- |
| 21.1 — Responsive | CROSS-RESP-001→005 | 5 | P0/P1 |
| 21.2 — Accessibilité | CROSS-A11Y-001→007 | 7 | P1/P2 |
| 21.3 — Thème | CROSS-THEME-001→003 | 3 | P1/P2 |

**Total : ~15 cas**

### Cas détaillés

**Responsive (P0/P1)**

- CROSS-RESP-001 : Accueil mobile 375px — pas de débordement, menu hamburger
- CROSS-RESP-002 : Accueil tablette 768px — mise en page correcte
- CROSS-RESP-003 : Admin sidebar mobile — rétractable ou overlay
- CROSS-RESP-004 : Formulaire contact mobile — tous champs accessibles
- CROSS-RESP-005 : Tables admin mobile — scroll horizontal ou layout alternatif

**Accessibilité (P1)**

- CROSS-A11Y-001 : Skip link — Tab → lien "Aller au contenu principal" visible et fonctionnel
- CROSS-A11Y-002 : Navigation clavier header — tous liens atteignables via Tab
- CROSS-A11Y-003 : Labels formulaire contact — chaque champ a un `<label>` associé
- CROSS-A11Y-004 : Contraste textes — ratio ≥ 4.5:1
- CROSS-A11Y-005 : Alt text images — images informatives ont un alt descriptif
- CROSS-A11Y-006 : Navigation clavier formulaires admin — actions réalisables sans souris
- CROSS-A11Y-007 : Aria-live toasts — annoncés par lecteur d'écran

**Thème**

- CROSS-THEME-001 : Basculer thème — clair → sombre sans erreur visuelle
- CROSS-THEME-002 : Persistance thème après reload
- CROSS-THEME-003 : Admin lisible en thème sombre

## Implementation Plan

### Approche technique

**Responsive** : utiliser `page.setViewportSize()` dans les tests Playwright

```typescript
await page.setViewportSize({ width: 375, height: 812 }); // iPhone SE
await page.setViewportSize({ width: 768, height: 1024 }); // iPad
```

**Accessibilité** :

- Tests Tab/focus : `page.keyboard.press('Tab')` + vérifier `page.locator(':focus')`
- Contraste : utiliser `@axe-core/playwright` pour les violations automatiques
- Skip link : vérifier visibilité au focus via `toBeVisible()` après Tab

**Thème** : vérifier le bouton toggle + `document.documentElement.classList` via `page.evaluate()`

### Nouveau projet Playwright

Ajouter dans `playwright.config.ts` :

```typescript
{
  name: 'chromium-mobile',
  use: {
    ...devices['iPhone SE'],
  },
  testMatch: /responsive\/.*\.spec\.ts/,
}
```

### Structure des fichiers

```bash
e2e/tests/
├── responsive/
│   ├── responsive.fixtures.ts
│   └── responsive.spec.ts
├── accessibility/
│   ├── accessibility.fixtures.ts
│   └── accessibility.spec.ts
└── theme/
    ├── theme.fixtures.ts
    └── theme.spec.ts
```

### Dépendance optionnelle

```bash
pnpm add -D @axe-core/playwright
```

Pour les tests de contraste automatiques (CROSS-A11Y-004).

## Progress Tracking

**Overall Status:** Not Started — 0%

### Subtasks

| ID  | Description                                    | Status      | Updated    | Notes |
| --- | ---------------------------------------------- | ----------- | ---------- | ----- |
| 1.1 | Tests responsive (CROSS-RESP-001→005)          | Not Started | 2026-03-17 | `setViewportSize` |
| 1.2 | Tests accessibilité (CROSS-A11Y-001→007)       | Not Started | 2026-03-17 | axe-core optionnel |
| 1.3 | Tests thème (CROSS-THEME-001→003)              | Not Started | 2026-03-17 |       |
| 1.4 | Projet `chromium-mobile` dans playwright.config | Not Started | 2026-03-17 |       |

## Références

- Plan de test : `specs/PLAN_DE_TEST_COMPLET.md` sections 21.1, 21.2, 21.3
- Infrastructure E2E : `playwright.config.ts`
- Page Objects publics existants : `e2e/pages/public/`
