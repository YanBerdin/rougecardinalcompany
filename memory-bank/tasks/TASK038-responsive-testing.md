# TASK038 - Responsive Testing

**Status:** In Progress  
**Added:** 2025-10-16  
**Updated:** 2026-02-10

## Original Request

Cross-device and cross-browser validation to ensure responsive behavior across devices.

## Thought Process

Use Playwright and BrowserStack (optional) to run device matrix tests. Focus on admin UI usability on tablets and mobiles.

**Audit findings (2026-02-10):**

- Playwright `@playwright/test ^1.57.0` installed but NOT configured (no `playwright.config.ts`)
- No `tests/` directory exists
- **0 `data-testid`** attributes in components (15 found in docs only)
- Existing responsive patterns: `overflow-x-auto`, padding adaptatif, grids responsive
- Supabase auth setup strategy needed for tests

## Implementation Plan

- ~~Define device matrix and critical pages to test.~~ ✅ Defined in plan
- ~~Add Playwright tests simulating mobile/tablet/desktop interactions.~~
- Run visual diffs for regressions on important pages.
- Fix UI breakpoints and touch targets.

**Revised Plan (9 Phases, 24h):**

1. **Phase 0 (4h)** - Instrumentation: Add `data-testid` attributes to components
2. **Phase 1 (2h)** - Setup: playwright.config.ts, fixtures, helpers
3. **Phase 2 (3h)** - Admin Dashboard tests
4. **Phase 3 (4h)** - CRUD Forms tests
5. **Phase 4 (3h)** - Tables tests
6. **Phase 5 (3h)** - Public pages tests
7. **Phase 6 (2h)** - Visual regression
8. **Phase 7 (2h)** - Accessibility tests
9. **Phase 8 (1h)** - CI/CD integration

## Progress Tracking

**Overall Status:** In Progress - 5%

### Subtasks

| ID | Description | Status | Updated | Notes |
| --- | --- | --- | --- | --- |
| 0.1 | Plan document review | Complete | 2026-02-10 | 5 gaps identified |
| 0.2 | Add data-testid to AdminSidebar | Not Started | - | Required for tests |
| 0.3 | Add data-testid to Dashboard stats | Not Started | - | Required for tests |
| 0.4 | Add data-testid to Header mobile | Not Started | - | Required for tests |
| 0.5 | Add data-testid to Hero slides | Not Started | - | Required for tests |
| 1.1 | Create playwright.config.ts | Not Started | - | Phase 1 |
| 1.2 | Create tests/ directory structure | Not Started | - | Phase 1 |
| 1.3 | Create auth.setup.ts | Not Started | - | Supabase auth |
| 1.4 | Create devices.ts fixture | Not Started | - | 9 devices |
| 1.5 | Create responsive-helpers.ts | Not Started | - | Phase 1 |
| 2.1 | Dashboard responsive tests | Not Started | - | Phase 2 |

## Progress Log

### 2025-10-16

- Task created from epic.

### 2026-02-10

- **Plan review complete** - Analyzed plan against current codebase
- **5 gaps identified:**
  1. No `data-testid` attributes in components (0 found)
  2. No `tests/` directory (Playwright not configured)
  3. No `playwright.config.ts` file
  4. Auth setup for Supabase not detailed in plan
  5. CI workflow `playwright.yml` missing
- **Plan updated:** Added Phase 0 (Instrumentation, 4h)
- **Timeline adjusted:** 20h → 24h (3 days)
- **Recommendation:** Start with Phase 0, then Phase 5 (public pages) as more stable than admin
