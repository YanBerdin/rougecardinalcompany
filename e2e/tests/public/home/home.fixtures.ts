import { test as base } from '@playwright/test';
import { HomePage } from '@/e2e/pages/public/home.page';

interface HomeFixtures {
    homePage: HomePage;
}

export const test = base.extend<HomeFixtures>({
    homePage: async ({ page }, use) => {
        const homePage = new HomePage(page);
        await homePage.goto();
        // eslint-disable-next-line react-hooks/rules-of-hooks
        await use(homePage);
    },
});

export { expect } from '@playwright/test';
