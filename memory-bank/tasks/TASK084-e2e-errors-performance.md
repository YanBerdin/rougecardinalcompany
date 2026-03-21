# \[TASK084] — E2E Transversaux — Erreurs & Performance

**Status:** Pending

**Added:** 2026-03-17
**Updated:** 2026-03-21

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
| TASK083 (Admin CRUD E2E) | ✅ Completed (2026-03-20) | 56/56 tests |
| TASK038 (Responsive) | ✅ Completed (2026-03-21) | 16/16 tests |

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

#### **Total : ~6 cas**

### Cas détaillés

#### **Gestion d'erreurs (P0/P1)**

- CROSS-ERR-001 : Page 404 — naviguer vers `/page-inexistante` → page 404 avec navigation
- CROSS-ERR-002 : Erreur serveur — Supabase indisponible → error boundary, pas de page blanche
- CROSS-ERR-003 : Toast erreur admin — simuler échec mutation → toast d'erreur

#### **Performance (P1/P2)**

- CROSS-PERF-001 : Accueil charge < 3 secondes
- CROSS-PERF-002 : Dashboard admin charge < 3 secondes
- CROSS-PERF-003 : Navigation entre pages publiques fluide

## Implementation Plan

### Approche technique

#### **CROSS-ERR-001** (Page 404)

```typescript
await page.goto('/url-qui-nexiste-pas');
await expect(page).toHaveURL(/\/url-qui-nexiste-pas/);
await expect(page.getByText(/404|page introuvable/i)).toBeVisible();
```

#### **CROSS-ERR-002** (Erreur réseau)

```typescript
// Bloquer les requêtes Supabase
await page.route('**/supabase.co/**', route => route.abort());
await page.goto('/');
// Vérifier error boundary visible, pas de page blanche
await expect(page.locator('body')).not.toBeEmpty();
```

#### **CROSS-ERR-003** (Toast erreur)

- Simuler une action admin qui échoue (ex: conflit de clé unique)
- Vérifier `role="alert"` avec message d'erreur

#### **CROSS-PERF-001/002**

```typescript
const start = Date.now();
await page.goto('/');
await page.waitForLoadState('networkidle');
const duration = Date.now() - start;
expect(duration).toBeLessThan(3000);
```

#### **Note** : Les tests de performance sont sensibles à l'environnement (machine locale vs CI)

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

> **Overall Status:** Not Started — 0%

### Subtasks

| ID  | Description                                | Status      | Updated    | Notes            |
| --- | ------------------------------------------ | ----------- | ---------- | ---------------- |
| 1.1 | Tests gestion erreurs (CROSS-ERR-001→003)  | Not Started | 2026-03-17 | P0/P1            |
| 1.2 | Tests performance (CROSS-PERF-001→003)     | Not Started | 2026-03-17 | Optionnel/manuel |

## Pièges connus — Patterns à éviter dans les futurs tests cross

Bugs découverts et corrigés dans la suite `editor` (2026-03-21), valables pour toute nouvelle spec.

### Bug #1 — `<Link><Button>` : clic sur le `<button>` interne ne déclenche pas la navigation

**Contexte** : `<Link href="..."><Button aria-label="...">` (Next.js) produit du DOM invalide `<a><button>`.
Cliquer le `<button>` intérieur ne propage **pas** l'événement à l'`<a>` → `waitForURL` time out après 20 s.

**Symptôme** : `TimeoutError: waitForURL('**/edit')` — la navigation ne se produit jamais.

**Fix** : Sélectionner le rôle `link` au lieu de `button` — le nom accessible du `<a>` hérite de l'`aria-label` de l'enfant (calcul d'arbre d'accessibilité WCAG).

```typescript
// ❌ INCORRECT — click sur le button interne ne navigue pas
page.getByRole('button', { name: 'Modifier le communiqué : Foo' })

// ✅ CORRECT — le link porte le même nom accessible et navigue
page.getByRole('link', { name: 'Modifier le communiqué : Foo' })
```

---

### Bug #2 — `getByText().first()` sélectionne les éléments `sm:hidden` (mobile, display:none)

**Contexte** : Les vues Tailwind avec double rendu (mobile `sm:hidden` + desktop `hidden sm:block`) gardent les **deux** dans le DOM. La couche mobile est masquée via `display:none`, mais `getByText()` la trouve quand même.

**Symptôme** : `expect(element).toBeVisible()` échoue avec `hidden` — l'élément trouvé est dans un conteneur `display:none`.

**Fix** : Utiliser `getByRole()` qui respecte l'arbre d'accessibilité et exclut les `display:none`.

```typescript
// ❌ INCORRECT — peut correspondre au <h3> dans sm:hidden
page.getByText(title).first()

// ✅ CORRECT — exclut display:none, trouve uniquement l'élément visible
page.getByRole('heading', { name: title })
```

---

### Bug #3 — `waitForURL('**/prefix**')` se résout immédiatement si l'URL courante matche

**Contexte** : Le glob `'**/admin/presse**'` matche `/admin/presse/communiques/new` (URL courante).
`waitForURL` se résout donc instantanément sans attendre la véritable navigation de retour vers `/admin/presse`.

**Symptôme** : Le test continue sur la mauvaise page → assertions échouent sur des éléments absents.

**Fix** : Utiliser un pattern exact sans `**` final.

```typescript
// ❌ INCORRECT — match l'URL courante /admin/presse/communiques/new
await page.waitForURL('**/admin/presse**');

// ✅ CORRECT — match uniquement /admin/presse (page liste)
await page.waitForURL('**/admin/presse');
```

---

### Bug #4 — Race condition après `router.push()` sans attente de navigation

**Contexte** : Les boutons d'action des tableaux React appellent `router.push()` côté client. L'appel retourne immédiatement ; la navigation SSR (Server Component + requête DB) prend encore 1–2 s.

**Symptôme** : `expect(element).toBeVisible()` échoue — on cherche un élément qui n'est pas encore rendu.

**Fix** : Toujours enchaîner `waitForURL` + `waitForLoadState` après avoir cliqué un bouton qui navigue.

```typescript
// ❌ INCORRECT — race condition
await page.getByRole('button', { name: 'Voir Foo' }).click();
// assertions immédiatement → données SSR pas encore là

// ✅ CORRECT
await page.getByRole('button', { name: 'Voir Foo' }).click();
await page.waitForURL('**/spectacles/*');
await page.waitForLoadState('domcontentloaded');
// assertions maintenant sûres
```

---

### Bug #5 — Timeout `expectToBeVisible` trop court pour Server Components (SSR)

**Contexte** : Playwright utilise 5 000 ms par défaut pour `expect(...).toBeVisible()`. Les Server Components avec requêtes DB peuvent prendre > 5 s (surtout après une création/mutation qui invalide les caches).

**Fix** : Passer un timeout explicite sur les assertions qui suivent une mutation.

```typescript
// ❌ INCORRECT — timeout 5 s insuffisant pour SSR post-mutation
await expect(table.getByRole('cell', { name: title }).first()).toBeVisible();

// ✅ CORRECT — 15 s pour laisser le temps au Server Component de re-rendre
await expect(table.getByRole('cell', { name: title }).first()).toBeVisible({ timeout: 15_000 });
```

---

**Commit de référence** : `f19f2d1` (`fix(e2e): stabilise editor suite — presse + spectacles POM fixes`)
**Fichiers modifiés** :
- `e2e/pages/admin/presse.page.ts`
- `e2e/pages/admin/spectacles.page.ts`
- `e2e/tests/editor/presse/presse.spec.ts`

---

## Progress Log

### 2026-03-21

- Suite `e2e:editor` — 3 tests presse cassés (ADM-PRESSE-003, 006, 007) + 3 tests flaky (PRESSE-002, SPEC-003, SPEC-006)
- Diagnostiqué 5 patterns de bug récurrents (voir section "Pièges connus" ci-dessus)
- Corrections appliquées dans les POM `presse.page.ts` et `spectacles.page.ts` + spec `presse.spec.ts`
- Résultat final validé : **51/51 PASSED** (3 runs consécutifs confirmés)
- Commit `f19f2d1` sur `feat/task038-e2e-cross-cutting-stable`

## Références

- Plan de test : `specs/PLAN_DE_TEST_COMPLET.md` sections 21.5, 21.6
- Infrastructure E2E : `playwright.config.ts`
- Error boundaries : `components/error-boundaries/`
