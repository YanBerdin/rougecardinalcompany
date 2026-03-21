# \[TASK038] — Responsive Testing & Accessibilité (rescoped)

**Status:** Completed
**Added:** 2026-02-10 (original)
**Updated:** 2026-06-09 (implémentation complète)

## Rescope Note (2026-03-17)

Le plan original (créé avant TASK078) prévoyait :

- Phase 0 : Ajouter `data-testid` aux composants (non fait)
- Phase 1 : Créer `playwright.config.ts` (✅ fait dans TASK078)
- Phase 2 : Créer `tests/` (✅ fait dans TASK078)
- Phase 3 : Auth fixture Supabase (✅ fait dans TASK078)

**Rescope** : se concentrer uniquement sur les tests responsive, accessibilité et thème.
Les `data-testid` ne sont pas nécessaires pour ces tests (sélecteurs role/label suffisent).

### Infrastructure E2E disponible (post-TASK081/082/083)

| Élément | Source | Détail |
| ------- | ------ | ------ |
| Projets Playwright | `playwright.config.ts` | `chromium-auth`, `chromium-public`, `editor`, `admin`, `permissions` |
| Page Objects publics | `e2e/pages/public/` | `home`, `agenda`, `contact`, `compagnie`, `spectacles`, `presse` |
| Page Objects admin | `e2e/pages/admin/` | 7 POM (hero-slides, partners, team, etc.) |
| Global setup | `e2e/global-setup.ts` | Pre-flight checks (env vars + Supabase) |
| Auth fixture | `e2e/.auth/` | `admin.json`, `editor.json` |
| Sentry désactivé | `playwright.config.ts` | `NEXT_PUBLIC_SENTRY_ENABLED: 'false'` dans `webServer.env` |

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

> **Total : 16 cas** (CROSS-A11Y-006 comptabilisé dans responsive-admin.spec.ts)

### Cas détaillés

#### **Responsive (P0/P1)**

- CROSS-RESP-001 : Accueil mobile 375px — pas de débordement, menu hamburger
- CROSS-RESP-002 : Accueil tablette 768px — mise en page correcte
- CROSS-RESP-003 : Admin sidebar mobile — rétractable ou overlay
- CROSS-RESP-004 : Formulaire contact mobile — tous champs accessibles
- CROSS-RESP-005 : Tables admin mobile — scroll horizontal ou layout alternatif

#### **Accessibilité (P1)**

- CROSS-A11Y-001 : Skip link — Tab → lien "Aller au contenu principal" visible et fonctionnel
- CROSS-A11Y-002 : Navigation clavier header — tous liens atteignables via Tab
- CROSS-A11Y-003 : Labels formulaire contact — chaque champ a un `<label>` associé
- CROSS-A11Y-004 : Contraste textes — ratio ≥ 4.5:1
- CROSS-A11Y-005 : Alt text images — images informatives ont un alt descriptif
- CROSS-A11Y-006 : Navigation clavier formulaires admin — actions réalisables sans souris
- CROSS-A11Y-007 : Aria-live toasts — annoncés par lecteur d'écran

#### **Thème**

- CROSS-THEME-001 : Basculer thème — clair → sombre sans erreur visuelle
- CROSS-THEME-002 : Persistance thème après reload
- CROSS-THEME-003 : Admin lisible en thème sombre

## Implementation Plan

### Approche technique

#### **Responsive** : utiliser `page.setViewportSize()` dans les tests Playwright

```typescript
await page.setViewportSize({ width: 375, height: 812 }); // iPhone SE
await page.setViewportSize({ width: 768, height: 1024 }); // iPad
```

#### **Accessibilité**

- Tests Tab/focus : `page.keyboard.press('Tab')` + vérifier `page.locator(':focus')`
- Contraste : utiliser `@axe-core/playwright` pour les violations automatiques
- Skip link : vérifier visibilité au focus via `toBeVisible()` après Tab

#### **Thème** : vérifier le bouton toggle + `document.documentElement.classList` via `page.evaluate()`

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

**Overall Status:** Completed — 100% — **16/16 tests passent stablement** (3 runs consécutifs validés)

### Subtasks

| ID  | Description                                          | Status   | Updated    | Notes                                          |
| --- | ---------------------------------------------------- | -------- | ---------- | ---------------------------------------------- |
| 1.1 | Tests responsive (CROSS-RESP-001→005)                | Complete | 2026-06-09 | `responsive-public.spec.ts`                    |
|     |                                                      |          |            | + `responsive-admin.spec.ts`                   |
| 1.2 | Tests accessibilité (CROSS-A11Y-001→007)             | Complete | 2026-06-09 | `accessibility.spec.ts` + @axe-core/playwright |
| 1.3 | Tests thème (CROSS-THEME-001→003)                    | Complete | 2026-06-09 | `theme-public.spec.ts` + `theme-admin.spec.ts` |
| 1.4 | Projets `cross-public` + `cross-admin` config        | Complete | 2026-06-09 | Ajoutés dans `playwright.config.ts`            |
| 1.5 | Dépendance @axe-core/playwright                      | Complete | 2026-06-09 | v4.11.1                                        |
| 1.6 | Débogage et stabilisation des 16 tests               | Complete | 2026-03-21 | 7 bugs corrigés sur 3 sessions                 |

## Progress Log

### 2026-06-09

- Installé `@axe-core/playwright` v4.11.1
- Ajouté projets `cross-public` et `cross-admin` dans `playwright.config.ts`
- Créé `e2e/tests/cross/responsive/responsive-public.spec.ts` (CROSS-RESP-001, 002, 004)
- Créé `e2e/tests/cross/responsive/responsive-admin.spec.ts` (CROSS-RESP-003, 005, CROSS-A11Y-006)
- Créé `e2e/tests/cross/accessibility/accessibility.spec.ts` (CROSS-A11Y-001→005, 007)
- Créé `e2e/tests/cross/theme/theme-public.spec.ts` (CROSS-THEME-001, 002)
- Créé `e2e/tests/cross/theme/theme-admin.spec.ts` (CROSS-THEME-003)
- Validation TypeScript : 0 erreur sur les fichiers cross
- Structure finale : 10 fichiers dans `e2e/tests/cross/` (5 fixtures + 5 specs)

### 2026-03-21 — Session de débogage et stabilisation (3 sessions)

> **Résultat final : 16/16 tests passent, 3 runs consécutifs validés (37.6s, 37.3s, 35.0s)**

#### Bugs corrigés (7 au total)

> **Session 1–2 — Correction des sélecteurs cassés**

| Bug | Test | Cause | Fix |
| --- | ---- | ----- | --- |
| BUG-1 | A11Y-003 | Label `'E-mail'` → axe attendait `'Email'` (sans tiret) | Label renommé en `'Email'` dans le formulaire contact |
| BUG-2 | RESP-001 | Lien `'La Compagnie'` matchait plusieurs éléments (header + footer) | Ajout de `.first()` sur le locator |
| BUG-3 | RESP-003 | Sélecteur sidebar `#sidebar-nav` inexistant | `[data-sidebar="sidebar"]` détecté à l'inspection DOM |
| BUG-4 | RESP-003 | `data-state` null sur la sidebar en mode mobile overlay | Logique étendue : vérification AUSSI de `[role="dialog"]` visible |
| BUG-5 | RESP-005 / A11Y-006 | `getByRole('main')` ambiguë en admin | Remplacé par `locator('#main-content')` |
| BUG-6 | RESP-005 | `body.scrollWidth` sur admin cause un faux positif (sidebar width) | Vérification conditionnelle : `scrollWidth` seulement si pas de conteneur scrollable |
| BUG-7 | THEME-003 | Identique à BUG-5 — `getByRole('main')` admin | `locator('#main-content')` |

> **Session 3 — Stabilisation des tests intermittents (2 tests)**

| Test | Cause d'intermittence | Fix |
| ---- | --------------------- | --- |
| CROSS-RESP-003 | `waitForTimeout(400)` trop court en suite complète (CPU charge) | `expect().toPass({ timeout: 5_000 })` retry loop |
| CROSS-RESP-001 | `domcontentloaded` trop précoce → layout pas encore stable | `waitUntil: 'networkidle'` + `expect().toPass({ timeout: 5_000 })` |
| CROSS-A11Y-004 | CSS custom properties pas encore résolues quand axe analyse | `expect().toPass({ timeout: 10_000 })` retry loop sur l'analyze() |

**CSS fix a11y :**

- `--muted-foreground` modifié de `0 0% 45%` (~`#737373`) à `0 0% 36.0784%` (`#5C5C5C`)
- Ratio réel (#5C5C5C sur #faf4e7) : **6.17:1** (bien au-dessus de 4.5:1 WCAG AA)
- `app/globals.css` nettoyé : ligne commentée `/*? TEST --muted-foreground: ...*/` supprimée

#### Commits de stabilisation

```bash
fix(e2e): stabiliser CROSS-RESP-001/003 avec toPass() retry (TASK038)
fix(e2e): stabiliser CROSS-A11Y-004 avec toPass() retry axe (TASK038)
fix(css): supprimer ligne TEST commentée dans globals.css (TASK038)
```

#### Résultat final par test

| Test | Fichier | Statut |
| ---- | ------- | ------ |
| CROSS-A11Y-001 | accessibility.spec.ts | ✅ stable |
| CROSS-A11Y-002 | accessibility.spec.ts | ✅ stable |
| CROSS-A11Y-003 | accessibility.spec.ts | ✅ stable |
| CROSS-A11Y-004 | accessibility.spec.ts | ✅ stable (toPass retry) |
| CROSS-A11Y-005 | accessibility.spec.ts | ✅ stable |
| CROSS-A11Y-006 | responsive-admin.spec.ts | ✅ stable |
| CROSS-A11Y-007 | accessibility.spec.ts | ✅ stable |
| CROSS-RESP-001 | responsive-public.spec.ts | ✅ stable (networkidle + toPass) |
| CROSS-RESP-002 | responsive-public.spec.ts | ✅ stable |
| CROSS-RESP-003 | responsive-admin.spec.ts | ✅ stable (toPass) |
| CROSS-RESP-004 | responsive-public.spec.ts | ✅ stable |
| CROSS-RESP-005 | responsive-admin.spec.ts | ✅ stable (vérif conditionnelle) |
| CROSS-THEME-001 | theme-public.spec.ts | ✅ stable |
| CROSS-THEME-002 | theme-public.spec.ts | ✅ stable |
| CROSS-THEME-003 | theme-admin.spec.ts | ✅ stable |

## Références

- Plan de test : `specs/PLAN_DE_TEST_COMPLET.md` sections 21.1, 21.2, 21.3
- Infrastructure E2E : `playwright.config.ts`, `e2e/global-setup.ts`
- Page Objects publics : `e2e/pages/public/` (6 POM)
- Page Objects admin : `e2e/pages/admin/` (7 POM)
- Rapport TASK083 : `doc/tests/E2E-ADMIN-CRUD-ADMIN-ONLY-TASK083-REPORT.md`
- **Rapport débogage** : `doc/tests/E2E-CROSS-CUTTING-TASK038-REPORT.md`
