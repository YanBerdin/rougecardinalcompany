import { test as base } from '@playwright/test';
import { SpectaclesPage } from '@/e2e/pages/public/spectacles.page';

interface SpectaclesFixtures {
    spectaclesPage: SpectaclesPage;
}

export const test = base.extend<SpectaclesFixtures>({
    spectaclesPage: async ({ page }, use) => {
        const spectaclesPage = new SpectaclesPage(page);
        await spectaclesPage.goto();
        // eslint-disable-next-line react-hooks/rules-of-hooks
        await use(spectaclesPage);
    },
});

export { expect } from '@playwright/test';
