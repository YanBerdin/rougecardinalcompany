import { test as base } from '@playwright/test';
import { SetupAccountPage } from '@/e2e/pages/auth/setup-account.page';

export const test = base.extend<{ setupAccountPage: SetupAccountPage }>({
    setupAccountPage: async ({ page }, use) => {
        const setupAccountPage = new SetupAccountPage(page);
        await use(setupAccountPage);
    },
});

export { expect } from '@playwright/test';
