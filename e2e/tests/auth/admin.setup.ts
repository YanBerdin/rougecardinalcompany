// spec: specs/tests-permissions-et-rôles.md
// Auth setup: saves admin session to .auth/admin.json

import { test as setup, expect } from '@playwright/test';
import path from 'path';

const AUTH_FILE = path.join(__dirname, '../../.auth/admin.json');

setup('authenticate as admin', async ({ page }) => {
  await page.goto('/auth/login');

  // Fill login form with admin credentials
  await page.getByLabel('Email').fill(process.env.E2E_ADMIN_EMAIL!);
  await page.getByLabel('Password').fill(process.env.E2E_ADMIN_PASSWORD!);
  await page.getByRole('button', { name: /login/i }).click();

  // Wait for redirect to admin dashboard
  await page.waitForURL('**/admin**', { timeout: 30_000 });
  await expect(page.locator('body')).toBeVisible();

  // Save storage state for reuse
  await page.context().storageState({ path: AUTH_FILE });
});
