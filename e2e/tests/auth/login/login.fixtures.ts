import { test as base } from '@playwright/test';
import { LoginPage } from '@/e2e/pages/auth/login.page';

interface LoginFixtures {
    loginPage: LoginPage;
}

export const test = base.extend<LoginFixtures>({
    loginPage: async ({ page }, use) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        // eslint-disable-next-line react-hooks/rules-of-hooks
        await use(loginPage);
    },
});

export { expect } from '@playwright/test';
