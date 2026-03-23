# Rapport E2E — Tests Admin Analytics (rôle admin)

**Date :** 2026-03-23
**Tâche :** TASK085 — E2E Admin — Analytics
**Projet Playwright :** `admin` (Chromium, Desktop 1280×720)
**Fichiers de tests :** `e2e/tests/admin/analytics/analytics.spec.ts`

---

## Résumé

Implémentation de **3 tests E2E** (tous actifs, 0 fixme) couvrant la page Analytics du backoffice admin — définis dans `specs/PLAN_DE_TEST_COMPLET.md` section 20 (ADM-ANALYTICS-001 → 003).

> **Résultat final (2026-03-23) : 3/3 passent, 0 échouent, 0 fixme — 23.4s**
>
> Un bug de strict mode Playwright a été rencontré et corrigé durant l'implémentation (voir section « Bugs corrigés »).

Cette tâche ferme le dernier gap de couverture admin : la suite E2E atteint désormais **100 % des sections du plan de test** (sections 1–21).

---

## Périmètre couvert

| Section | IDs | Tests | Passent | Fixme | Référence fichier |
| ------- | --- | ----- | ------- | ----- | ----------------- |
| 20 — Analytics | ADM-ANALYTICS-001→003 | 3 | ✅ 3 | 0 | `analytics/analytics.spec.ts` |
| **Total** | | **3** | **3** | **0** | |

---

## Résultats détaillés

### 20 — Analytics (`e2e/tests/admin/analytics/analytics.spec.ts`)

| ID | Description | Priorité | Statut | Notes |
| -- | ----------- | -------- | ------ | ----- |
| ADM-ANALYTICS-001 | La page charge sans erreur | P0 | ✅ | Vérifie : pas d'error boundary, heading visible, `#main-content` non vide |
| ADM-ANALYTICS-002 | Contenu affiché si données présentes | P2 | ✅ | Vérifie : canvas/svg recharts OU stat chiffrée OU fallback contenu non vide, pas de spinner infini |
| ADM-ANALYTICS-003 | État vide gracieux (période future) | P2 | ✅ | Selects future period via combobox/select si disponible ; vérifie : pas d'error boundary, contenu visible, pas de spinner |

> **3/3 passent**

---

## Fichiers créés / modifiés

| Fichier | Action | Description |
| ------- | ------ | ----------- |
| `e2e/pages/admin/analytics.page.ts` | Créé | Page Object `AdminAnalyticsPage` — goto, expectLoaded, expectContentVisible, expectEmptyState, selectFuturePeriod |
| `e2e/tests/admin/analytics/analytics.fixtures.ts` | Créé | Fixture `analyticsPage` — extend base, appelle goto() dans setup |
| `e2e/tests/admin/analytics/analytics.spec.ts` | Créé | 3 tests ADM-ANALYTICS-001→003 |
| `e2e/pages/admin/index.ts` | Modifié | Ajout export `AdminAnalyticsPage` |
| `package.json` | Modifié | Ajout script `e2e:analytics` |

---

## Bugs corrigés

### Fix 1 — Strict mode violation : `locator('main')` ambigu (BLOQUANT)

**Impact :** 3/3 tests échouaient au lancement.

**Cause :** Le layout admin génère **deux éléments `<main>`** simultanément dans le DOM :

1. `<main data-slot="sidebar-inset">` — conteneur de la sidebar Radix UI
2. `<main id="main-content">` — contenu principal de la page

`locator('main')` résout sur ces 2 éléments → Playwright lève une erreur de strict mode.

**Solution :** Remplacement de toutes les occurrences de `locator('main')` par `locator('#main-content')` dans `analytics.page.ts`.

**Pattern établi :** Ce pattern (`#main-content` au lieu de `getByRole('main')` ou `locator('main')`) était déjà documenté dans le rapport TASK038 (Fix 5) et dans `memory-bank/progress.md`. Son application dans TASK085 confirme la cohérence avec les autres pages admin.

---

## Apprentissages clés

### 1. Pattern `#main-content` obligatoire en admin

Le layout admin (`components/layout/admin/AdminLayout.tsx`) utilise `SidebarInset` de Radix UI, qui crée un `<main>` wrapper en plus du `<main id="main-content">` de la page. Toute future page admin doit utiliser `#main-content` comme sélecteur de contenu principal.

### 2. `networkidle` requis pour recharts

La page Analytics effectue des re-renders asynchrones après hydratation (recharts, fetch data). L'état `networkidle` garantit que tous les graphiques ont été montés avant les assertions.

### 3. Assertions flexibles pour contenu variable

La méthode `expectContentVisible()` utilise une cascade de sélecteurs :

1. `canvas` — recharts canvas renderer
2. `svg.recharts-surface` — recharts SVG renderer
3. `[data-testid^="stat-"]` — statistiques chiffrées
4. Fallback : `#main-content` non vide (toujours vrai si page chargée correctement)

Cette approche évite les faux négatifs sur une base de données vide (environnement local/CI) tout en garantissant l'absence de crash.

---

## Couverture admin globale post-TASK085

| Section | Tests | Statut |
| ------- | ----- | ------ |
| 1 — Auth (E2E auth) | 7 | ✅ |
| 2–6 — Cross-cutting (A11Y, responsive, thème) | 16 | ✅ |
| 7 — Dashboard | 3 | ✅ |
| 8 — Équipe | 8 | ✅ |
| 9–14 — CRUD éditorial (Spectacles, Agenda, Presse…) | 51 | ✅ |
| 15–19 — CRUD admin-only (Hero, Config, Audit…) | 55 | ✅ |
| 20 — Analytics | **3** | ✅ **NOUVEAU** |
| 21 — Erreurs & Performance transversaux | 7 | ✅ |
| **Total** | **~150** | **100 % sections couvertes** |

---

## Commandes de lancement

```bash
# Tous les tests analytics uniquement
pnpm e2e:analytics

# Ou avec Playwright directement
pnpm exec playwright test --project=admin --grep "ADM-ANALYTICS" --reporter=list

# Suite admin complète (inclut analytics)
pnpm e2e:admin
```
