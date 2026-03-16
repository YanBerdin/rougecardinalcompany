// spec: specs/tests-permissions-et-rôles.md
// Fixtures for permissions E2E tests: provides pre-authenticated pages per role

import { test as base, type Page, type BrowserContext } from '@playwright/test';
import path from 'path';

const AUTH_DIR = path.join(__dirname, '../../.auth');

interface PermissionsFixtures {
  adminPage: Page;
  editorPage: Page;
  userPage: Page;
  anonPage: Page;
}

export const test = base.extend<PermissionsFixtures>({
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: path.join(AUTH_DIR, 'admin.json'),
    });
    const page = await context.newPage();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(page);
    await context.close();
  },

  editorPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: path.join(AUTH_DIR, 'editor.json'),
    });
    const page = await context.newPage();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(page);
    await context.close();
  },

  userPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: path.join(AUTH_DIR, 'user.json'),
    });
    const page = await context.newPage();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(page);
    await context.close();
  },

  anonPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(page);
    await context.close();
  },
});

export { expect } from '@playwright/test';
