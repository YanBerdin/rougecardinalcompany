# [TASK084] — E2E Transversaux — Erreurs & Performance

**Status:** Pending
**Added:** 2026-03-17
**Updated:** 2026-03-19

## Original Request

Implémenter les tests couvrant la gestion d'erreurs et les métriques de performance —
définis dans `specs/PLAN_DE_TEST_COMPLET.md` sections 21.5 et 21.6.

## Thought Process

- Tests de gestion d'erreurs : testables avec Playwright (simuler erreurs réseau, page 404)
- Tests de performance : CROSS-PERF-001 peut être automatisé avec `page.evaluate(() => performance.now())`
  mais reste plus pertinent avec Lighthouse en CI
- Priorité basse — implémenter après TASK081, 082, 083, 038

### Statut des dépendances (mis à jour 2026-03-19)

| Tâche | Statut | Notes |
| --- | --- | --- |
| TASK081 (Auth E2E) | ✅ Completed (2026-03-17) | 14/14 tests |
| TASK082 (Editor CRUD E2E) | ✅ Completed (2026-03-20) | 51/51 tests |
| TASK083 (Admin CRUD E2E) | ⏳ Pending | Bloquant — projet `admin` Playwright manquant |
| TASK038 (Responsive) | 🔄 In Progress | Phase 0 pending |

### Prérequis Playwright

> **⚠️** : Aucun projet `cross` n'existe dans `playwright.config.ts`.
> Les tests `cross/**/*.spec.ts` ne seront pas matchés. Ajouter un bloc projet
> (sans storageState, ou avec storageState adapté selon le test).

## Périmètre

### Sections couvertes

| Section | IDs | Cas | Priorité |
| ------- | --- | --- | -------- |
| 21.5 — Performance | CROSS-PERF-001→003 | 3 | P1/P2 |
| 21.6 — Gestion d'erreurs | CROSS-ERR-001→003 | 3 | P0/P1 |

**Total : ~6 cas**

### Cas détaillés

**Gestion d'erreurs (P0/P1)**

- CROSS-ERR-001 : Page 404 — naviguer vers `/page-inexistante` → page 404 avec navigation
- CROSS-ERR-002 : Erreur serveur — Supabase indisponible → error boundary, pas de page blanche
- CROSS-ERR-003 : Toast erreur admin — simuler échec mutation → toast d'erreur

**Performance (P1/P2)**

- CROSS-PERF-001 : Accueil charge < 3 secondes
- CROSS-PERF-002 : Dashboard admin charge < 3 secondes
- CROSS-PERF-003 : Navigation entre pages publiques fluide

## Implementation Plan

### Approche technique

**CROSS-ERR-001** (Page 404) :

```typescript
await page.goto('/url-qui-nexiste-pas');
await expect(page).toHaveURL(/\/url-qui-nexiste-pas/);
await expect(page.getByText(/404|page introuvable/i)).toBeVisible();
```

**CROSS-ERR-002** (Erreur réseau) :

```typescript
// Bloquer les requêtes Supabase
await page.route('**/supabase.co/**', route => route.abort());
await page.goto('/');
// Vérifier error boundary visible, pas de page blanche
await expect(page.locator('body')).not.toBeEmpty();
```

**CROSS-ERR-003** (Toast erreur) :

- Simuler une action admin qui échoue (ex: conflit de clé unique)
- Vérifier `role="alert"` avec message d'erreur

**CROSS-PERF-001/002** :

```typescript
const start = Date.now();
await page.goto('/');
await page.waitForLoadState('networkidle');
const duration = Date.now() - start;
expect(duration).toBeLessThan(3000);
```

**Note** : Les tests de performance sont sensibles à l'environnement (machine locale vs CI).
Considérer de les marquer comme `test.skip` en CI ou d'augmenter le seuil.

### Structure des fichiers

```bash
e2e/tests/
└── cross/
    ├── errors/
    │   ├── errors.fixtures.ts
    │   └── errors.spec.ts
    └── performance/
        ├── performance.fixtures.ts
        └── performance.spec.ts
```

## Progress Tracking

**Overall Status:** Not Started — 0%

### Subtasks

| ID  | Description                                | Status      | Updated    | Notes |
| --- | ------------------------------------------ | ----------- | ---------- | ----- |
| 1.1 | Tests gestion erreurs (CROSS-ERR-001→003)  | Not Started | 2026-03-17 | P0/P1 |
| 1.2 | Tests performance (CROSS-PERF-001→003)     | Not Started | 2026-03-17 | Optionnel/manuel |

## Références

- Plan de test : `specs/PLAN_DE_TEST_COMPLET.md` sections 21.5, 21.6
- Infrastructure E2E : `playwright.config.ts`
- Error boundaries : `components/error-boundaries/`
