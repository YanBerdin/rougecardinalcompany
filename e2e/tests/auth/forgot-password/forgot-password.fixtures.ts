import { test as base } from '@playwright/test';
import { ForgotPasswordPage } from '@/e2e/pages/auth/forgot-password.page';

interface ForgotPasswordFixtures {
    forgotPage: ForgotPasswordPage;
}

export const test = base.extend<ForgotPasswordFixtures>({
    forgotPage: async ({ page }, use) => {
        const forgotPage = new ForgotPasswordPage(page);
        await forgotPage.goto();
        // eslint-disable-next-line react-hooks/rules-of-hooks
        await use(forgotPage);
    },
});

export { expect } from '@playwright/test';
