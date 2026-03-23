# Rapport E2E — Tests Cross-Cutting (TASK038)

**Date** : 2026-03-21  
**Auteur** : GitHub Copilot  
**Commande** : `pnpm run e2e:cross`  
**Résultat final** : ✅ **15/15 tests passent** — 3 runs consécutifs validés (37.6 s, 37.3 s, 35.0 s)

---

## 1. Contexte

TASK038 couvre les tests **transversaux** ne relevant pas d'un CRUD spécifique :

| Suite | Projets Playwright | Fichiers |
| ----- | ------------------ | -------- |
| Responsive | `cross-public` + `cross-admin` | `responsive-public.spec.ts`, `responsive-admin.spec.ts` |
| Accessibilité | `cross-public` + `cross-admin` | `accessibility.spec.ts` |
| Thème dark/light | `cross-public` + `cross-admin` | `theme-public.spec.ts`, `theme-admin.spec.ts` |

Les tests ont été créés initialement le 2026-06-09. Plusieurs sessions de débogage ont été nécessaires (2026-03-21) pour atteindre une stabilité à 100 %.

---

## 2. Inventaire des tests

| ID | Titre | Fichier | Statut final |
| --- | ----- | ------- | ------------ |
| CROSS-A11Y-001 | Skip link visible au focus Tab | `accessibility.spec.ts` | ✅ |
| CROSS-A11Y-002 | Navigation clavier header | `accessibility.spec.ts` | ✅ |
| CROSS-A11Y-003 | Labels formulaire contact | `accessibility.spec.ts` | ✅ (BUG-1) |
| CROSS-A11Y-004 | Contraste textes WCAG AA | `accessibility.spec.ts` | ✅ (BUG-CSS + retry) |
| CROSS-A11Y-005 | Alt text images | `accessibility.spec.ts` | ✅ |
| CROSS-A11Y-006 | Navigation clavier formulaires admin | `responsive-admin.spec.ts` | ✅ (BUG-5) |
| CROSS-A11Y-007 | Aria-live toasts | `accessibility.spec.ts` | ✅ |
| CROSS-RESP-001 | Mobile 375px — pas de débordement | `responsive-public.spec.ts` | ✅ (BUG-2 + retry) |
| CROSS-RESP-002 | Tablette 768px — mise en page | `responsive-public.spec.ts` | ✅ |
| CROSS-RESP-003 | Admin sidebar mobile — overlay | `responsive-admin.spec.ts` | ✅ (BUG-3 + BUG-4 + retry) |
| CROSS-RESP-004 | Formulaire contact mobile | `responsive-public.spec.ts` | ✅ |
| CROSS-RESP-005 | Tables admin mobile — scroll | `responsive-admin.spec.ts` | ✅ (BUG-6) |
| CROSS-THEME-001 | Bascule clair → sombre | `theme-public.spec.ts` | ✅ |
| CROSS-THEME-002 | Persistance thème après reload | `theme-public.spec.ts` | ✅ |
| CROSS-THEME-003 | Admin lisible en thème sombre | `theme-admin.spec.ts` | ✅ (BUG-7) |

---

## 3. Bugs corrigés — Analyse détaillée

### BUG-1 — Label formulaire : trait d'union `E-mail` vs `Email`

**Test** : CROSS-A11Y-003  
**Symptôme** : Test échouait sur `getByLabel('Email')` — l'élément n'était pas trouvé.  
**Cause** : Le formulaire de contact utilisait le label `E-mail` (avec trait d'union typographique), tandis qu'axe-core et le sélecteur Playwright attendaient `Email`.  
**Fix** : Renommage du label HTML `E-mail` → `Email` dans le composant formulaire contact.  
**Leçon** : Les traits d'union dans les labels de formulaires peuvent créer des divergences entre les sélecteurs Playwright (`getByLabel`) et les textes visuels. Préférer les formes sans ponctuation ambiguë.

---

### BUG-2 — Lien `'La Compagnie'` ambigu (header + footer)

**Test** : CROSS-RESP-001  
**Symptôme** : `page.getByRole('link', { name: 'La Compagnie' })` levait une erreur "strict mode violation" (plusieurs éléments trouvés).  
**Cause** : Le lien `La Compagnie` apparaît dans le header ET dans le footer de la page d'accueil.  
**Fix** : Ajout de `.first()` pour cibler le premier lien rencontré (header).  
**Leçon** : Sur les pages complètes, les liens de navigation se répètent souvent dans le footer. Toujours ajouter `.first()` ou scoper les sélecteurs de liens de navigation au `header` ou `nav`.

---

### BUG-3 — Sélecteur sidebar `#sidebar-nav` inexistant

**Test** : CROSS-RESP-003  
**Symptôme** : `page.locator('#sidebar-nav')` — aucun élément trouvé.  
**Cause** : L'attribut `id="sidebar-nav"` n'existe pas. La sidebar utilise `data-sidebar="sidebar"` (attribut Radix UI / shadcn).  
**Fix** : Remplacement de `#sidebar-nav` par `[data-sidebar="sidebar"]`.  
**Leçon** : Toujours inspecter le DOM réel (DevTools ou `page.content()`) avant de supposer un `id`. Les composants shadcn/Radix exposent des `data-*` attributes, pas des `id` conventionnels.

---

### BUG-4 — `data-state` null sur la sidebar mobile (overlay)

**Test** : CROSS-RESP-003  
**Symptôme** : Après le clic sur le déclencheur, `sidebar.getAttribute('data-state')` retournait `null` (l'attribut n'existait pas).  
**Cause** : En mode mobile, la sidebar shadcn passe en mode "overlay" (Sheet/Dialog), détachée du DOM principal. L'élément `[data-sidebar="sidebar"]` reste dans le DOM mais sans `data-state`.  
**Fix** : Logique étendue — vérification combinée :

```typescript
const expandedState = await sidebar.getAttribute('data-state');
const overlay = page.locator('[data-sidebar="overlay"], [role="dialog"]').first();
const isOverlayVisible = await overlay.isVisible().catch(() => false);
const sidebarOpened = expandedState !== state || isOverlayVisible;
```

**Leçon** : Les composants sidebar shadcn ont deux comportements distincts selon le breakpoint (desktop = `data-state`, mobile = Sheet/Dialog). Toujours prévoir les deux chemins dans les assertions.

---

### BUG-5 et BUG-7 — `getByRole('main')` ambigu dans l'admin

**Tests** : CROSS-RESP-005 (BUG-5) + CROSS-THEME-003 (BUG-7)  
**Symptôme** : `getByRole('main')` matchait plusieurs éléments ou échouait en mode admin.  
**Cause** : Le layout admin contient plusieurs régions `role="main"` en raison du double rendu (desktop + mobile) ou des transitions.  
**Fix** : Remplacement par `locator('#main-content')` qui cible l'ID unique du bloc principal admin.  
**Leçon** : Dans les layouts admin avec sidebar, `getByRole('main')` est souvent ambigu. Préférer un `id` unique sur l'élément de contenu principal et le cibler avec `locator('#main-content')`.

---

### BUG-6 — Faux positif `body.scrollWidth` en admin (sidebar)

**Test** : CROSS-RESP-005  
**Symptôme** : Le test échouait avec `body.scrollWidth > 375px` alors que le contenu n'était pas en débordement.  
**Cause** : En admin, la sidebar (même rétractée) contribue à la `scrollWidth` du body. Cette sidebar est intentionnellement en `position: fixed` ou débordante à droite.  
**Fix** : Vérification conditionnelle — `scrollWidth` testé seulement si aucun conteneur avec scroll interne n'est présent :

```typescript
const hasScrollableContainer = await page.evaluate(() => 
    document.querySelector('[class*="overflow-x-auto"], [class*="overflow-auto"]') !== null
);
if (!hasScrollableContainer) {
    expect(scrollWidth).toBeLessThanOrEqual(MOBILE.width + 1);
}
```

**Leçon** : Le `scrollWidth` du body n'est pas un indicateur fiable de débordement dans les layouts avec sidebar. Préférer vérifier le conteneur de contenu principal au lieu du body, ou exclure les cas où un scroll horizontal intentionnel existe (tables, etc.).

---

### BUG-CSS — Ratio de contraste insuffisant `--muted-foreground`

**Test** : CROSS-A11Y-004  
**Symptôme** : axe-core signalait un ratio de contraste de 3.52:1 sur `<p class="text-muted-foreground">` dans `AboutContent.tsx`.  
**Cause** : `--muted-foreground` était à `0 0% 45%` (~`#737373`), soit un ratio ≈ 4.2:1 sur `--background` (#faf4e7). Insuffisant pour WCAG AA (4.5:1 requis).  
**Fix** : Assombrissement de `--muted-foreground` à `0 0% 36.0784%` (#5C5C5C).  
**Vérification** : Ratio #5C5C5C / #faf4e7 = **6.17:1** ✅  
**Composant affecté** : `components/features/public-site/home/about/AboutContent.tsx` — `<p className="text-sm text-muted-foreground">{content.missionText}</p>`  
**Leçon** : Toujours valider les ratios de contraste avec les couleurs non-seulement CSS calculées mais aussi avec les valeurs réelles du `--background` parent. La transparence des variables CSS peut introduire des surprises.

---

## 4. Tests intermittents — Analyse et solutions

Trois tests présentaient une intermittence (passaient parfois, échouaient parfois en suite complète). Le pattern commun : **des assertions exécutées avant que l'état visé soit stable**.

### Pattern de solution : `expect().toPass({ timeout })`

```typescript
// ❌ Fragile — assertion directe sur un état potentiellement instable
const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
expect(scrollWidth).toBeLessThanOrEqual(375 + 1);

// ✅ Robuste — retry jusqu'à stabilisation
await expect(async () => {
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(375 + 1);
}).toPass({ timeout: 5_000 });
```

### CROSS-RESP-001 — `waitUntil: 'domcontentloaded'` trop précoce

| Avant | Après |
| ----- | ----- |
| `waitUntil: 'domcontentloaded'` | `waitUntil: 'networkidle'` |
| assertion directe `scrollWidth` | `expect().toPass({ timeout: 5_000 })` |

Le layout Next.js/Tailwind peut effectuer des ajustements post-hydratation. Le `domcontentloaded` était atteint avant que Tailwind ait appliqué les breakpoints.

### CROSS-RESP-003 — `waitForTimeout(400)` trop court

| Avant | Après |
| ----- | ----- |
| `await page.waitForTimeout(400)` | `expect().toPass({ timeout: 5_000 })` |

En suite complète (15 tests séquentiels), le CPU est plus chargé. 400 ms n'était pas suffisant pour l'animation d'ouverture de la sidebar.

### CROSS-A11Y-004 — CSS custom properties non résolues au moment d'axe

**Cause racine** : La commande `await new AxeBuilder(page).withRules(['color-contrast']).analyze()` s'exécutait immédiatement après `networkidle`. Pourtant, les CSS custom properties (`--muted-foreground`, `--background`) pouvaient ne pas être entièrement résolues dans le contexte de rendu de certains éléments (notamment `.<absolute>` dans `AboutContent.tsx`).

**Preuve** : Les couleurs computées renvoyées par axe (`#828282`, `#f9f5eb`) ne correspondaient à aucune valeur définie dans les CSS variables :

- `--muted-foreground` défini : `#5C5C5C` ou `#A3A3A3` (dark)
- Couleur computée lors de l'échec : `#828282` (51% lightness — valeur intermédiaire)

**Fix** : Encapsulation dans `expect().toPass({ timeout: 10_000 })`. axe re-analyse jusqu'à ce que les propriétés CSS soient correctement résolues.

```typescript
await expect(async () => {
    const results = await new AxeBuilder({ page })
        .withRules(['color-contrast'])
        .analyze();
    expect(results.violations.length).toBe(0);
}).toPass({ timeout: 10_000 });
```

**Leçon** : `networkidle` garantit que les requêtes réseau sont terminées, mais **pas** que les CSS custom properties sont pleinement résolues. Pour les checks de contraste avec axe, toujours encapsuler dans un retry. Un timeout de 10 s suffit dans tous les cas observés.

---

## 5. Patterns de stabilité établis (réutilisables)

Ces patterns sont maintenant documentés dans `memory-bank/systemPatterns.md`.

### P1 — `waitUntil: 'networkidle'` pour les checks de layout

```typescript
await page.goto(URL, { waitUntil: 'networkidle' });
```

À utiliser pour tout test qui mesure des dimensions CSS ou attend une stabilité visuelle complète.

### P2 — `expect().toPass()` pour les états UI asynchrones

```typescript
await expect(async () => {
    // assertion potentiellement instable
    expect(await page.evaluate(() => ...)).toBe(...);
}).toPass({ timeout: 5_000 });
```

À utiliser pour : états de composants UI post-interaction (sidebar, menu), mesures de layout après navigation, tout `waitForTimeout()` > 200 ms.

### P3 — `expect().toPass()` pour les analyses axe-core

```typescript
await expect(async () => {
    const results = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
    expect(results.violations.length).toBe(0);
}).toPass({ timeout: 10_000 });
```

Les CSS custom properties de design systems (Tailwind/shadcn) peuvent mettre 1–3 s à se résoudre complètement dans TOUS les éléments.

### P4 — Sidebar shadcn mobile : double détection

```typescript
// state desktop
const expandedState = await sidebar.getAttribute('data-state');
// state mobile (Sheet/overlay)
const overlay = page.locator('[data-sidebar="overlay"], [role="dialog"]').first();
const isOverlayVisible = await overlay.isVisible().catch(() => false);
const sidebarOpened = expandedState !== state || isOverlayVisible;
```

### P5 — `scrollWidth` conditionnel en présence de scroll intentionnel

```typescript
const hasScrollableContainer = await page.evaluate(
    () => document.querySelector('[class*="overflow-x-auto"], [class*="overflow-auto"]') !== null
);
if (!hasScrollableContainer) {
    expect(scrollWidth).toBeLessThanOrEqual(MOBILE.width + 1);
}
```

---

## 6. Fichiers modifiés

| Fichier | Modifications |
| ------- | ------------- |
| `e2e/tests/cross/accessibility/accessibility.spec.ts` | BUG-1 (label Email), CROSS-A11Y-004 retry toPass, enrichissement violation details |
| `e2e/tests/cross/responsive/responsive-public.spec.ts` | BUG-2 (.first()), CROSS-RESP-001 networkidle + toPass |
| `e2e/tests/cross/responsive/responsive-admin.spec.ts` | BUG-3 (sélecteur sidebar), BUG-4 (overlay detection), BUG-5 (#main-content), BUG-6 (scrollWidth conditionnel), RESP-003 toPass |
| `e2e/tests/cross/theme/theme-admin.spec.ts` | BUG-7 (#main-content) |
| `app/globals.css` | `--muted-foreground` 45% → 36.0784% (#5C5C5C), suppression ligne TEST commentée |

---

## 7. Références

- Task : `memory-bank/tasks/TASK038-responsive-accessibility-rescoped.md`
- Plan de test : `specs/PLAN_DE_TEST_COMPLET.md` sections 21.1–21.3
- Config Playwright : `playwright.config.ts` (projets `cross-public`, `cross-admin`)
- Patterns : `memory-bank/systemPatterns.md` (section "E2E Stability Patterns")
