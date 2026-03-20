import { test as base } from '@playwright/test';
import { AdminHeroSlidesPage } from '@/e2e/pages/admin';

interface HeroSlidesFixtures {
    heroSlidesPage: AdminHeroSlidesPage;
}

export const test = base.extend<HeroSlidesFixtures>({
    heroSlidesPage: async ({ page }, use) => {
        const heroSlidesPage = new AdminHeroSlidesPage(page);
        await heroSlidesPage.goto();
        // eslint-disable-next-line react-hooks/rules-of-hooks
        await use(heroSlidesPage);
    },
});

export { expect } from '@playwright/test';
