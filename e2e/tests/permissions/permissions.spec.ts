// spec: specs/tests-permissions-et-rôles.md
// seed: e2e/tests/auth/admin.setup.ts, e2e/tests/auth/editor.setup.ts, e2e/tests/auth/user.setup.ts

import { test, expect } from './permissions.fixtures';

// --- Constants ---

/** Sidebar items visible to editor role (8 items) */
const EDITOR_SIDEBAR_ITEMS = [
  'Tableau de bord',
  'Spectacles',
  'Agenda',
  'Lieux',
  'Presse',
  'Compagnie',
  'Médiathèque',
  'Retour au site publique',
] as const;

/** Sidebar items visible only to admin role (10 additional items) */
const ADMIN_ONLY_SIDEBAR_ITEMS = [
  'Équipe',
  'Utilisateurs',
  'Accueil - Slides',
  'Accueil - La compagnie',
  'Partenaires',
  'Analytics',
  'Affichage Sections',
  'Audit Logs',
  'Paramètres',
  'Debug Auth',
] as const;

const TOTAL_ADMIN_SIDEBAR_ITEMS = EDITOR_SIDEBAR_ITEMS.length + ADMIN_ONLY_SIDEBAR_ITEMS.length; // 18

const ADMIN_ONLY_PAGES = [
  '/admin/team',
  '/admin/users',
  '/admin/analytics',
  '/admin/site-config',
  '/admin/audit-logs',
] as const;

const API_ADMIN_ENDPOINT = '/api/admin/media/search';

// ---------------------------------------------------------------------------
// 5.1 — Parcours Editor
// ---------------------------------------------------------------------------

test.describe('Parcours Editor — Permissions', () => {
  // ROLE-E2E-001: Editor login → dashboard
  test('ROLE-E2E-001 — Editor login → dashboard', async ({ editorPage: page }) => {
    // 1. Navigate to admin dashboard
    await page.goto('/admin');

    // 2. Verify dashboard is displayed with correct title
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.getByRole('heading', { name: /tableau de bord/i })).toBeVisible();
  });

  // ROLE-E2E-002: Editor sidebar shows exactly 8 items
  test('ROLE-E2E-002 — Editor sidebar filtrée (8 items visibles)', async ({ editorPage: page }) => {
    // 1. Navigate to admin dashboard
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin/);

    // 2. Verify each expected sidebar item is visible
    const sidebar = page.locator('[data-sidebar="sidebar"]');
    for (const item of EDITOR_SIDEBAR_ITEMS) {
      await expect(sidebar.getByRole('link', { name: item })).toBeVisible();
    }

    // 3. Verify total sidebar link count matches editor items
    const sidebarLinks = sidebar.getByRole('link');
    await expect(sidebarLinks).toHaveCount(EDITOR_SIDEBAR_ITEMS.length);
  });

  // ROLE-E2E-003: Editor sidebar — admin items hidden
  test('ROLE-E2E-003 — Editor sidebar — items admin masqués', async ({ editorPage: page }) => {
    // 1. Navigate to admin dashboard
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin/);

    // 2. Verify each admin-only item is NOT visible
    const sidebar = page.locator('[data-sidebar="sidebar"]');
    for (const item of ADMIN_ONLY_SIDEBAR_ITEMS) {
      await expect(sidebar.getByRole('link', { name: item })).toBeHidden();
    }
  });

  // ROLE-E2E-006: Editor blocked on /admin/team (admin-only page)
  test('ROLE-E2E-006 — Editor page admin-only bloquée (/admin/team)', async ({ editorPage: page }) => {
    // 1. Navigate directly to admin-only page
    await page.goto('/admin/team');

    // 2. Verify redirect to /auth/login
    await page.waitForURL('**/auth/login', { timeout: 15_000 });
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  // ROLE-E2E-007: Editor blocked on /admin/analytics
  test('ROLE-E2E-007 — Editor page analytics bloquée', async ({ editorPage: page }) => {
    // 1. Navigate directly to admin-only page
    await page.goto('/admin/analytics');

    // 2. Verify redirect to /auth/login
    await page.waitForURL('**/auth/login', { timeout: 15_000 });
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  // ROLE-E2E-008: Editor blocked on /admin/users
  test('ROLE-E2E-008 — Editor page users bloquée', async ({ editorPage: page }) => {
    // 1. Navigate directly to admin-only page
    await page.goto('/admin/users');

    // 2. Verify redirect to /auth/login
    await page.waitForURL('**/auth/login', { timeout: 15_000 });
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  // ROLE-E2E-009: Editor blocked on /admin/site-config
  test('ROLE-E2E-009 — Editor page site-config bloquée', async ({ editorPage: page }) => {
    // 1. Navigate directly to admin-only page
    await page.goto('/admin/site-config');

    // 2. Verify redirect to /auth/login
    await page.waitForURL('**/auth/login', { timeout: 15_000 });
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  // ROLE-E2E-010: Editor blocked on /admin/presse/contacts/new
  test('ROLE-E2E-010 — Editor page presse/contacts bloquée', async ({ editorPage: page }) => {
    // 1. Navigate directly to restricted press contacts page
    await page.goto('/admin/presse/contacts/new');

    // 2. Verify redirect or error
    await page.waitForURL(/\/(auth\/login|admin)/, { timeout: 15_000 });
  });
});

// ---------------------------------------------------------------------------
// 5.2 — Parcours Admin
// ---------------------------------------------------------------------------

test.describe('Parcours Admin — Permissions', () => {
  // ROLE-E2E-011: Admin login → dashboard complet
  test('ROLE-E2E-011 — Admin login → dashboard complet', async ({ adminPage: page }) => {
    // 1. Navigate to admin dashboard
    await page.goto('/admin');

    // 2. Verify dashboard is displayed
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.getByRole('heading', { name: /tableau de bord/i })).toBeVisible();
  });

  // ROLE-E2E-012: Admin sidebar shows all 18 items
  test('ROLE-E2E-012 — Admin sidebar complète (18 items)', async ({ adminPage: page }) => {
    // 1. Navigate to admin dashboard
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin/);

    // 2. Verify total sidebar link count matches all items
    const sidebar = page.locator('[data-sidebar="sidebar"]');
    const sidebarLinks = sidebar.getByRole('link');
    await expect(sidebarLinks).toHaveCount(TOTAL_ADMIN_SIDEBAR_ITEMS);

    // 3. Verify admin-only items are visible
    for (const item of ADMIN_ONLY_SIDEBAR_ITEMS) {
      await expect(sidebar.getByRole('link', { name: item })).toBeVisible();
    }
  });

  // ROLE-E2E-013: Admin can access all admin-only pages
  test('ROLE-E2E-013 — Admin accès toutes pages', async ({ adminPage: page }) => {
    // 1. Navigate sequentially to each admin-only page
    for (const adminPath of ADMIN_ONLY_PAGES) {
      await page.goto(adminPath);

      // 2. Verify page loads (no redirect to /auth/login)
      await expect(page).not.toHaveURL(/\/auth\/login/);
      await expect(page.locator('body')).toBeVisible();
    }
  });
});

// ---------------------------------------------------------------------------
// 5.3 — Parcours User (bloqué)
// ---------------------------------------------------------------------------

test.describe('Parcours User — Bloqué', () => {
  // ROLE-E2E-016: User blocked on /admin
  test('ROLE-E2E-016 — User bloqué /admin', async ({ userPage: page }) => {
    // 1. Navigate to admin
    await page.goto('/admin');

    // 2. Verify redirect to /auth/login
    await page.waitForURL('**/auth/login', { timeout: 15_000 });
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  // ROLE-E2E-017: User blocked on /admin/spectacles
  test('ROLE-E2E-017 — User bloqué /admin/spectacles', async ({ userPage: page }) => {
    // 1. Navigate to admin spectacles
    await page.goto('/admin/spectacles');

    // 2. Verify redirect to /auth/login
    await page.waitForURL('**/auth/login', { timeout: 15_000 });
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  // ROLE-E2E-018: User blocked on /admin/team
  test('ROLE-E2E-018 — User bloqué /admin/team', async ({ userPage: page }) => {
    // 1. Navigate to admin team
    await page.goto('/admin/team');

    // 2. Verify redirect to /auth/login
    await page.waitForURL('**/auth/login', { timeout: 15_000 });
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});

// ---------------------------------------------------------------------------
// 5.4 — Parcours Anon (bloqué)
// ---------------------------------------------------------------------------

test.describe('Parcours Anon — Bloqué', () => {
  // ROLE-E2E-019: Anon blocked on /admin
  test('ROLE-E2E-019 — Anon bloqué /admin', async ({ anonPage: page }) => {
    // 1. Navigate to admin without session
    await page.goto('/admin');

    // 2. Verify redirect to /auth/login
    await page.waitForURL('**/auth/login', { timeout: 15_000 });
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  // ROLE-E2E-020: Anon blocked on /admin/spectacles
  test('ROLE-E2E-020 — Anon bloqué /admin/spectacles', async ({ anonPage: page }) => {
    // 1. Navigate to admin spectacles without session
    await page.goto('/admin/spectacles');

    // 2. Verify redirect to /auth/login
    await page.waitForURL('**/auth/login', { timeout: 15_000 });
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});

// ---------------------------------------------------------------------------
// 5.5 — Middleware et API
// ---------------------------------------------------------------------------

test.describe('API Admin — Permissions', () => {
  // ROLE-E2E-021: API admin — Editor blocked (403)
  test('ROLE-E2E-021 — API admin — Editor bloqué (403)', async ({ editorPage: page }) => {
    // 1. Fetch admin API with editor session cookies
    const response = await page.request.fetch(API_ADMIN_ENDPOINT, {
      method: 'GET',
    });

    // 2. Verify 403 Forbidden response
    expect(response.status()).toBe(403);
    const body = await response.json();
    expect(body).toHaveProperty('error', 'Forbidden');
  });

  // ROLE-E2E-022: API admin — User blocked (403)
  test('ROLE-E2E-022 — API admin — User bloqué (403)', async ({ userPage: page }) => {
    // 1. Fetch admin API with user session cookies
    const response = await page.request.fetch(API_ADMIN_ENDPOINT, {
      method: 'GET',
    });

    // 2. Verify 403 Forbidden response
    expect(response.status()).toBe(403);
    const body = await response.json();
    expect(body).toHaveProperty('error', 'Forbidden');
  });

  // ROLE-E2E-023: API admin — Anon blocked (403)
  test('ROLE-E2E-023 — API admin — Anon bloqué (403)', async ({ anonPage: page }) => {
    // 1. Fetch admin API without any session
    const response = await page.request.fetch(API_ADMIN_ENDPOINT, {
      method: 'GET',
    });

    // 2. Verify 403 Forbidden response
    expect(response.status()).toBe(403);
    const body = await response.json();
    expect(body).toHaveProperty('error', 'Forbidden');
  });

  // ROLE-E2E-024: API admin — Admin authorized (200)
  test('ROLE-E2E-024 — API admin — Admin autorisé (200)', async ({ adminPage: page }) => {
    // 1. Fetch admin API with admin session cookies
    const response = await page.request.fetch(API_ADMIN_ENDPOINT, {
      method: 'GET',
    });

    // 2. Verify 200 OK response (not 403)
    expect(response.status()).toBe(200);
  });
});
