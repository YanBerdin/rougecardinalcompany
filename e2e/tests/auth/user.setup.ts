// spec: specs/tests-permissions-et-rôles.md
// Auth setup: saves user session to .auth/user.json

import { test as setup, expect } from '@playwright/test';
import path from 'path';

const AUTH_FILE = path.join(__dirname, '../../.auth/user.json');

setup('authenticate as user', async ({ page }) => {
  await page.goto('/auth/login');

  // Fill login form with user credentials
  await page.getByLabel('Email').fill(process.env.E2E_USER_EMAIL!);
  await page.getByLabel('Password').fill(process.env.E2E_USER_PASSWORD!);
  await page.getByRole('button', { name: /login/i }).click();

  // Wait for redirect after login (user role redirects to home since no admin access)
  await page.waitForURL('**/', { timeout: 30_000 });
  await expect(page.locator('body')).toBeVisible();

  // Save storage state for reuse
  await page.context().storageState({ path: AUTH_FILE });
});
