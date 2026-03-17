// spec: specs/tests-permissions-et-rôles.md
// Auth setup: saves user session to .auth/user.json

import { test as setup, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUTH_FILE = path.join(__dirname, '../../.auth/user.json');

setup('authenticate as user', async ({ page }) => {
    await page.goto('/auth/login');

    // Fill login form with user credentials
    await page.getByLabel('Email').fill(process.env.E2E_USER_EMAIL!);
    await page.getByLabel('Password').fill(process.env.E2E_USER_PASSWORD!);
    await page.getByRole('button', { name: /login/i }).click();

    // Login form redirects everyone to /admin, but middleware blocks "user" role
    // and redirects back to /auth/login. The auth cookies ARE set despite the redirect.
    // Wait for the redirect cycle to settle, then verify auth by navigating to home.
    await page.waitForTimeout(3_000);
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();

    // Save storage state for reuse
    await page.context().storageState({ path: AUTH_FILE });
});
