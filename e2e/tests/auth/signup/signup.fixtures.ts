import { test as base } from '@playwright/test';
import { SignupPage } from '@/e2e/pages/auth/signup.page';

interface SignupFixtures {
    signupPage: SignupPage;
}

export const test = base.extend<SignupFixtures>({
    signupPage: async ({ page }, use) => {
        const signupPage = new SignupPage(page);
        await signupPage.goto();
        // eslint-disable-next-line react-hooks/rules-of-hooks
        await use(signupPage);
    },
});

export { expect } from '@playwright/test';
