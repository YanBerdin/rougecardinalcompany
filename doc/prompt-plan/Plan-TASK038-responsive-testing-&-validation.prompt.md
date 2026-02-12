# Plan TASK038 - Responsive Testing & Validation

**Créé:** 2026-02-09  
**Mis à jour:** 2026-02-10  
**Statut:** Reviewed  
**Priorité:** High (Production Readiness)

---

## 1. Résumé Exécutif

### Objectif

Mettre en place une stratégie complète de tests responsive cross-device/browser pour garantir une expérience utilisateur optimale sur tous les formats (mobile, tablet, desktop).

### Scope

- **Pages admin** : Dashboard, CRUD interfaces, Media Library, Analytics
- **Pages publiques** : Homepage, Spectacles, Presse, Agenda, Contact
- **Devices** : Mobile (375px-768px), Tablet (768px-1024px), Desktop (1024px+)
- **Browsers** : Chrome, Firefox, Safari (desktop + mobile)

### Deliverables

- Suite de tests Playwright avec device matrix
- Scripts de validation responsive automatisés
- Documentation standards responsive
- CI/CD integration
- Visual regression testing setup

---

## 2. État Actuel - Audit Responsive

### 2.1 Patterns Responsive Existants

**✅ Patterns identifiés comme fonctionnels** :

```typescript
// Pattern 1: Overflow-x-auto pour tables
<div className="overflow-x-auto -mx-3 sm:-mx-4 md:-mx-6">
  <table>...</table>
</div>

// Pattern 2: Padding adaptatif
<div className="p-3 sm:p-4 md:p-6">

// Pattern 3: Grid responsive
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

// Pattern 4: Boutons flexibles
<Button className="min-w-[120px] flex-1 sm:flex-none">

// Pattern 5: AppSidebar collapsible
<AppSidebar collapsible="icon" />
```

**❌ Zones à risque identifiées** :

1. Forms longs (TeamMemberForm, SpectacleForm) : champs nombreux, validation visible ?
2. Tables complexes (Media Library, Audit Logs) : 6+ colonnes, horizontal scroll UX
3. Modals (MediaLibraryPicker) : height overflow sur petits écrans ?
4. Hero slides : images HD, ratio aspect maintenu ?
5. Admin Dashboard cards : readability sur mobile

### 2.2 Metrics Cibles

| Metric | Mobile | Tablet | Desktop |
|--------|--------|--------|---------|
| Touch targets | ≥44x44px | ≥44x44px | ≥40x40px |
| Font size minimum | 16px | 16px | 14px |
| Line height | 1.5 | 1.5 | 1.5 |
| Viewport overflow | 0 horizontal scroll | 0 horizontal scroll | Allowed |
| Content width | 100% viewport | 100% viewport | Max 1440px |

---

## 3. Architecture Tests Playwright

### 3.1 Structure Fichiers

```bash
tests/
├── e2e/
│   ├── admin/
│   │   ├── dashboard.responsive.spec.ts
│   │   ├── spectacles-crud.responsive.spec.ts
│   │   ├── media-library.responsive.spec.ts
│   │   ├── team-crud.responsive.spec.ts
│   │   └── analytics.responsive.spec.ts
│   ├── public/
│   │   ├── homepage.responsive.spec.ts
│   │   ├── spectacles.responsive.spec.ts
│   │   ├── presse.responsive.spec.ts
│   │   ├── agenda.responsive.spec.ts
│   │   └── contact.responsive.spec.ts
│   └── visual/
│       ├── screenshots.spec.ts
│       └── visual-regression.spec.ts
├── fixtures/
│   ├── devices.ts
│   ├── test-data.ts
│   └── auth.setup.ts
├── helpers/
│   ├── responsive-helpers.ts
│   ├── screenshot-helpers.ts
│   └── accessibility-helpers.ts
└── playwright.config.ts
```

### 3.2 Configuration Playwright

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    // Desktop browsers
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Desktop Firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'Desktop Safari',
      use: { ...devices['Desktop Safari'] },
    },
    
    // Mobile browsers
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    
    // Tablets
    {
      name: 'iPad',
      use: { ...devices['iPad Pro'] },
    },
    {
      name: 'iPad Landscape',
      use: { ...devices['iPad Pro landscape'] },
    },
    
    // Custom breakpoints
    {
      name: 'Small Mobile',
      use: {
        viewport: { width: 375, height: 667 }, // iPhone SE
      },
    },
    {
      name: 'Large Desktop',
      use: {
        viewport: { width: 1920, height: 1080 },
      },
    },
  ],
});
```

### 3.3 Device Matrix Definition

```typescript
// tests/fixtures/devices.ts
export const DEVICE_MATRIX = {
  mobile: {
    small: { width: 375, height: 667, name: 'iPhone SE' },
    medium: { width: 390, height: 844, name: 'iPhone 12' },
    large: { width: 428, height: 926, name: 'iPhone 14 Pro Max' },
  },
  tablet: {
    portrait: { width: 768, height: 1024, name: 'iPad' },
    landscape: { width: 1024, height: 768, name: 'iPad Landscape' },
    pro: { width: 1024, height: 1366, name: 'iPad Pro' },
  },
  desktop: {
    small: { width: 1024, height: 768, name: 'Small Desktop' },
    medium: { width: 1440, height: 900, name: 'Medium Desktop' },
    large: { width: 1920, height: 1080, name: 'Large Desktop' },
  },
} as const;

export type DeviceCategory = keyof typeof DEVICE_MATRIX;
export type DeviceSize = keyof typeof DEVICE_MATRIX[DeviceCategory];
```

---

## 4. Plan d'Implémentation (9 Phases)

### Phase 0: Instrumentation des Composants (4h) ⚠️ PRÉ-REQUIS

**Objectif:** Ajouter les attributs `data-testid` nécessaires aux tests Playwright

**Analyse (2026-02-10):** L'audit du codebase révèle que **0 composant** ne contient de `data-testid`. Les 15 occurrences trouvées sont uniquement dans la documentation (prompts, plans). Les tests Playwright échoueront sans ces attributs.

**Composants à instrumenter:**

| Composant | Fichier | Attribut à ajouter |
|-----------|---------|--------------------|
| AppSidebar | `components/admin/AdminSidebar.tsx` | `data-testid="app-sidebar"` |
| SidebarTrigger | `components/admin/AdminSidebar.tsx` | `data-testid="sidebar-trigger"` |
| DashboardStatsContainer | `components/features/admin/dashboard/` | `data-testid="stats-grid"` |
| Header mobile menu | `components/layout/Header.tsx` | `data-testid="mobile-menu-btn"` |
| Hero slides | `components/features/public-site/home/Hero.tsx` | `data-testid="hero-image"` |
| Media Library grid | `components/features/admin/media/` | `data-testid="media-grid"` |
| Tables (générique) | `components/ui/table.tsx` | `data-testid="data-table"` |
| Forms (générique) | Pattern à définir | `data-testid="form-{name}"` |

**Tasks:**

- [ ] Ajouter `data-testid` au Sidebar admin (AppSidebar + trigger)
- [ ] Ajouter `data-testid` au Dashboard stats grid
- [ ] Ajouter `data-testid` au Header public (mobile menu button)
- [ ] Ajouter `data-testid` aux Hero slides
- [ ] Ajouter `data-testid` à la Media Library grid
- [ ] Documenter la convention de nommage `data-testid`

**Deliverables:**

- Composants instrumentés avec `data-testid`
- Convention documentée dans `.github/instructions/playwright-tests.instructions.md`

---

### Phase 1: Setup & Infrastructure (2h)

**Objectif:** Configuration Playwright + CI/CD

**Tasks:**

- [ ] Install Playwright: `pnpm create playwright`
- [ ] Configure `playwright.config.ts` avec device matrix
- [ ] Créer fixtures (devices, auth, test-data)
- [ ] Helpers responsive:
  ```typescript
  // tests/helpers/responsive-helpers.ts
  export async function checkResponsive(page, options) {
    // Check viewport overflow
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    
    // Check touch targets
    const buttons = await page.locator('button, a').all();
    for (const btn of buttons) {
      const box = await btn.boundingBox();
      if (box && (box.width < 44 || box.height < 44)) {
        throw new Error(`Touch target too small: ${box.width}x${box.height}`);
      }
    }
    
    return { hasOverflow, buttonsCount: buttons.length };
  }
  ```

**Deliverables:**

- `playwright.config.ts` ✅
- `tests/fixtures/*.ts` ✅
- `tests/helpers/responsive-helpers.ts` ✅
- CI workflow `.github/workflows/playwright.yml`

---

### Phase 2: Admin Dashboard Tests (3h)

**Objectif:** Valider responsive dashboard + navigation

**Tests critiques:**

```typescript
// tests/e2e/admin/dashboard.responsive.spec.ts
import { test, expect } from '@playwright/test';
import { DEVICE_MATRIX } from '../../fixtures/devices';

for (const [category, sizes] of Object.entries(DEVICE_MATRIX)) {
  for (const [size, config] of Object.entries(sizes)) {
    test.describe(`Dashboard on ${category} ${size}`, () => {
      test.use({ viewport: config });
      
      test('should display stats cards properly', async ({ page }) => {
        await page.goto('/admin');
        
        // Check cards grid responsive
        const grid = page.locator('[data-testid="stats-grid"]');
        const gridClass = await grid.getAttribute('class');
        
        if (config.width < 768) {
          expect(gridClass).toContain('grid-cols-1'); // Mobile: 1 col
        } else if (config.width < 1024) {
          expect(gridClass).toContain('md:grid-cols-2'); // Tablet: 2 cols
        } else {
          expect(gridClass).toContain('lg:grid-cols-3'); // Desktop: 3 cols
        }
      });
      
      test('sidebar should be collapsible on mobile', async ({ page }) => {
        await page.goto('/admin');
        
        if (config.width < 768) {
          // Mobile: sidebar hidden by default
          const sidebar = page.locator('[data-testid="app-sidebar"]');
          await expect(sidebar).toHaveAttribute('data-state', 'collapsed');
          
          // Open sidebar via sheet trigger
          await page.click('[data-testid="sidebar-trigger"]');
          await expect(sidebar).toHaveAttribute('data-state', 'expanded');
        }
      });
      
      test('no horizontal overflow', async ({ page }) => {
        await page.goto('/admin');
        
        const hasOverflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth;
        });
        
        expect(hasOverflow).toBe(false);
      });
    });
  }
}
```

**Deliverables:**

- `dashboard.responsive.spec.ts` ✅
- Screenshots baseline (9 devices x 3 breakpoints)
- Bug reports si nécessaire

---

### Phase 3: CRUD Forms Tests (4h)

**Objectif:** Valider forms complexes (Spectacles, Team, Media)

**Tests critiques:**

```typescript
// tests/e2e/admin/spectacles-crud.responsive.spec.ts
test.describe('Spectacle Form Responsive', () => {
  test('form fields should stack on mobile', async ({ page, viewport }) => {
    await page.goto('/admin/spectacles/new');
    
    const formGrid = page.locator('form > div');
    const gridCols = await formGrid.evaluate((el) => {
      return window.getComputedStyle(el).gridTemplateColumns;
    });
    
    if (viewport.width < 768) {
      expect(gridCols).toBe('1fr'); // Mobile: 1 column
    } else {
      expect(gridCols).toContain('fr'); // Desktop: multi-column
    }
  });
  
  test('image upload button should be touch-friendly', async ({ page }) => {
    await page.goto('/admin/spectacles/new');
    
    const uploadBtn = page.locator('[data-testid="upload-image-btn"]');
    const box = await uploadBtn.boundingBox();
    
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  });
  
  test('form should be scrollable on small screens', async ({ page, viewport }) => {
    await page.goto('/admin/spectacles/new');
    
    if (viewport.height < 900) {
      const formHeight = await page.evaluate(() => {
        const form = document.querySelector('form');
        return form.scrollHeight;
      });
      
      expect(formHeight).toBeGreaterThan(viewport.height);
    }
  });
});
```

**Deliverables:**

- `spectacles-crud.responsive.spec.ts` ✅
- `team-crud.responsive.spec.ts` ✅
- `media-library.responsive.spec.ts` ✅
- Fix list (touch targets, overflow, stacking)

---

### Phase 4: Tables & Lists Tests (3h)

**Objectif:** Valider tables complexes (Media, Audit Logs, Analytics)

**Tests critiques:**

```typescript
// tests/e2e/admin/media-library.responsive.spec.ts
test.describe('Media Library Table', () => {
  test('table should have horizontal scroll on mobile', async ({ page, viewport }) => {
    await page.goto('/admin/media');
    
    if (viewport.width < 768) {
      const tableWrapper = page.locator('[data-testid="table-wrapper"]');
      const hasOverflowX = await tableWrapper.evaluate((el) => {
        return el.scrollWidth > el.clientWidth;
      });
      
      expect(hasOverflowX).toBe(true);
      expect(await tableWrapper.getAttribute('class')).toContain('overflow-x-auto');
    }
  });
  
  test('action buttons should remain visible on mobile', async ({ page, viewport }) => {
    await page.goto('/admin/media');
    
    const actionBtns = page.locator('[data-testid="media-actions"]').first();
    const isVisible = await actionBtns.isVisible();
    
    expect(isVisible).toBe(true);
  });
  
  test('pagination should adapt to screen size', async ({ page, viewport }) => {
    await page.goto('/admin/media');
    
    const pagination = page.locator('[data-testid="pagination"]');
    
    if (viewport.width < 640) {
      // Mobile: compact pagination (prev/next only)
      const pageNumbers = pagination.locator('[data-testid="page-number"]');
      await expect(pageNumbers).toHaveCount(0);
    } else {
      // Desktop: full pagination
      const pageNumbers = pagination.locator('[data-testid="page-number"]');
      await expect(pageNumbers.first()).toBeVisible();
    }
  });
});
```

**Deliverables:**

- `media-library.responsive.spec.ts` ✅
- `audit-logs.responsive.spec.ts` ✅
- Fixes: sticky headers, compact actions, responsive pagination

---

### Phase 5: Public Pages Tests (3h)

**Objectif:** Valider homepage, spectacles, presse, agenda

**Tests critiques:**

```typescript
// tests/e2e/public/homepage.responsive.spec.ts
test.describe('Homepage Responsive', () => {
  test('hero slides should maintain aspect ratio', async ({ page, viewport }) => {
    await page.goto('/');
    
    const heroImage = page.locator('[data-testid="hero-image"]').first();
    const box = await heroImage.boundingBox();
    
    const aspectRatio = box.width / box.height;
    expect(aspectRatio).toBeGreaterThan(1.5); // Landscape
    expect(aspectRatio).toBeLessThan(2.5);
  });
  
  test('stats cards should stack on mobile', async ({ page, viewport }) => {
    await page.goto('/');
    
    const statsGrid = page.locator('[data-testid="stats-grid"]');
    
    if (viewport.width < 768) {
      const gridTemplate = await statsGrid.evaluate((el) => {
        return window.getComputedStyle(el).gridTemplateColumns;
      });
      expect(gridTemplate).toBe('1fr');
    }
  });
  
  test('navigation menu should be accessible', async ({ page, viewport }) => {
    await page.goto('/');
    
    if (viewport.width < 1024) {
      // Mobile: hamburger menu
      const menuBtn = page.locator('[data-testid="mobile-menu-btn"]');
      await expect(menuBtn).toBeVisible();
      
      await menuBtn.click();
      const navLinks = page.locator('nav a');
      await expect(navLinks.first()).toBeVisible();
    }
  });
});
```

**Deliverables:**

- `homepage.responsive.spec.ts` ✅
- `spectacles.responsive.spec.ts` ✅
- `presse.responsive.spec.ts` ✅
- `contact.responsive.spec.ts` ✅

---

### Phase 6: Visual Regression Testing (2h)

**Objectif:** Baseline screenshots + diff detection

**Setup:**

```typescript
// tests/e2e/visual/screenshots.spec.ts
import { test } from '@playwright/test';
import { DEVICE_MATRIX } from '../../fixtures/devices';

const CRITICAL_PAGES = [
  '/',
  '/spectacles',
  '/presse',
  '/admin',
  '/admin/spectacles',
  '/admin/media',
];

for (const page of CRITICAL_PAGES) {
  for (const [category, sizes] of Object.entries(DEVICE_MATRIX)) {
    for (const [size, config] of Object.entries(sizes)) {
      test(`Screenshot ${page} on ${category}-${size}`, async ({ page: pw }) => {
        await pw.setViewportSize(config);
        await pw.goto(page);
        
        // Wait for content
        await pw.waitForLoadState('networkidle');
        
        // Take full page screenshot
        await pw.screenshot({
          path: `screenshots/${category}-${size}${page.replace(/\//g, '-')}.png`,
          fullPage: true,
        });
      });
    }
  }
}
```

**Process:**

1. Generate baseline: `pnpm test:visual --update-snapshots`
2. Run comparison: `pnpm test:visual`
3. Review diffs in `test-results/`

**Deliverables:**

- Baseline screenshots (6 pages x 9 devices = 54 images)
- Visual regression test suite
- CI workflow with artifact upload

---

### Phase 7: Accessibility Testing (2h)

**Objectif:** Valider touch targets, focus, keyboard navigation

**Tests:**

```typescript
// tests/helpers/accessibility-helpers.ts
export async function checkAccessibility(page) {
  // Check touch target sizes
  const buttons = await page.locator('button, a, input[type="submit"]').all();
  const smallTargets = [];
  
  for (const btn of buttons) {
    const box = await btn.boundingBox();
    if (box && (box.width < 44 || box.height < 44)) {
      const text = await btn.textContent();
      smallTargets.push({ text, size: `${box.width}x${box.height}` });
    }
  }
  
  return { smallTargets };
}

// tests/e2e/admin/accessibility.responsive.spec.ts
test('all interactive elements meet touch target size', async ({ page }) => {
  await page.goto('/admin');
  
  const { smallTargets } = await checkAccessibility(page);
  
  expect(smallTargets).toHaveLength(0);
});
```

**Deliverables:**

- `accessibility.responsive.spec.ts` ✅
- Fixes: button padding, link areas, input heights

---

### Phase 8: CI/CD Integration (1h)

**Objectif:** Automatiser tests responsive dans CI

**GitHub Actions Workflow:**

```yaml
# .github/workflows/playwright.yml
name: Playwright Tests

on:
  push:
    branches: [main, develop, feature/*]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    strategy:
      matrix:
        shard: [1, 2, 3, 4]
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Install Playwright Browsers
        run: pnpm exec playwright install --with-deps
      
      - name: Run Playwright tests
        run: pnpm exec playwright test --shard=${{ matrix.shard }}/4
        env:
          BASE_URL: http://localhost:3000
      
      - uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: playwright-report-${{ matrix.shard }}
          path: playwright-report/
          retention-days: 30
```

**Deliverables:**

- `.github/workflows/playwright.yml` ✅
- `package.json` scripts:
  ```json
  {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:visual": "playwright test tests/e2e/visual",
    "test:visual:update": "playwright test tests/e2e/visual --update-snapshots"
  }
  ```

---

## 5. Standards Responsive (Documentation)

### 5.1 Breakpoints (Tailwind Config)

```typescript
// tailwind.config.ts
export default {
  theme: {
    screens: {
      'sm': '640px',   // Mobile large
      'md': '768px',   // Tablet
      'lg': '1024px',  // Desktop small
      'xl': '1280px',  // Desktop medium
      '2xl': '1536px', // Desktop large
    },
  },
}
```

### 5.2 Patterns Obligatoires

**Tables:**
```tsx
<div className="overflow-x-auto -mx-3 sm:-mx-4 md:-mx-6">
  <table className="min-w-full">
```

**Grids:**
```tsx
<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
```

**Padding:**
```tsx
<div className="p-3 sm:p-4 md:p-6">
```

**Buttons:**
```tsx
<Button className="w-full sm:w-auto min-h-[44px]">
```

### 5.3 Checklist PR

- [ ] Tests Playwright passent sur 3+ devices
- [ ] Aucun horizontal overflow détecté
- [ ] Touch targets ≥44x44px
- [ ] Font sizes ≥16px sur mobile
- [ ] Images responsive avec aspect ratio
- [ ] Forms stack correctement sur mobile
- [ ] Tables ont overflow-x-auto

---

## 6. Timeline & Resources

| Phase | Duration | Priority | Dependencies |
|-------|----------|----------|--------------|
| **0. Instrumentation** | **4h** | **P0** | **None** |
| 1. Setup | 2h | P0 | Phase 0 |
| 2. Dashboard | 3h | P0 | Phase 1 |
| 3. Forms | 4h | P1 | Phase 1 |
| 4. Tables | 3h | P1 | Phase 1 |
| 5. Public | 3h | P1 | Phase 1 |
| 6. Visual | 2h | P2 | Phase 2-5 |
| 7. A11y | 2h | P1 | Phase 1 |
| 8. CI/CD | 1h | P0 | Phase 1-7 |

**Total:** 24h (3 jours)

**Resources:**

- 1 développeur frontend (tests)
- 1 QA (validation manuelle)
- CI/CD (GitHub Actions minutes)

---

## 7. Success Criteria

- [ ] ✅ Suite de tests Playwright complète (50+ tests)
- [ ] ✅ Coverage: 9 devices x 10 pages = 90 test cases
- [ ] ✅ Visual regression: 54 baseline screenshots
- [ ] ✅ CI/CD: Tests automatisés dans PR
- [ ] ✅ Documentation: Standards responsive publiés
- [ ] ✅ Fixes: 0 blocking responsive issues
- [ ] ✅ Performance: Tests run en <10min
- [ ] ✅ Accessibility: 100% touch targets compliant

---

## 8. Next Steps

### Immediate (Cette semaine)

1. ✅ Valider plan avec équipe
2. ⏳ **Phase 0: Instrumenter les composants avec data-testid**
3. ⏳ Installer Playwright
4. ⏳ Configurer device matrix
5. ⏳ Créer fixtures et helpers

### Short-term (2 semaines)

1. ✅ Implémenter Phases 1-4 (Setup + Admin)
2. ✅ Fix critical responsive issues
3. ✅ Baseline visual regression

### Long-term (1 mois)

1. ✅ Phases 5-8 (Public + CI/CD)
2. ✅ Documentation complète
3. ✅ Formation équipe

---
