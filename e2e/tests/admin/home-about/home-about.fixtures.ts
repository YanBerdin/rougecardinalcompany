import { test as base } from '@playwright/test';
import { AdminHomeAboutPage } from '@/e2e/pages/admin';

interface HomeAboutFixtures {
    homeAboutPage: AdminHomeAboutPage;
}

export const test = base.extend<HomeAboutFixtures>({
    homeAboutPage: async ({ page }, use) => {
        const homeAboutPage = new AdminHomeAboutPage(page);
        await homeAboutPage.goto();
        // eslint-disable-next-line react-hooks/rules-of-hooks
        await use(homeAboutPage);
    },
});

export { expect } from '@playwright/test';
