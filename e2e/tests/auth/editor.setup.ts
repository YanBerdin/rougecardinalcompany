// spec: specs/tests-permissions-et-rôles.md
// Auth setup: saves editor session to .auth/editor.json

import { test as setup, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUTH_FILE = path.join(__dirname, '../../.auth/editor.json');

setup('authenticate as editor', async ({ page }) => {
  await page.goto('/auth/login');

  // Fill login form with editor credentials
  await page.getByLabel('Email').fill(process.env.E2E_EDITOR_EMAIL!);
  await page.getByLabel('Password').fill(process.env.E2E_EDITOR_PASSWORD!);
  await page.getByRole('button', { name: /login/i }).click();

  // Wait for redirect to admin dashboard
  await page.waitForURL('**/admin**', { timeout: 30_000 });
  await expect(page.locator('body')).toBeVisible();

  // Save storage state for reuse
  await page.context().storageState({ path: AUTH_FILE });
});
