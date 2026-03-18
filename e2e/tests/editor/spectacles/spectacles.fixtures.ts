import { test as base } from '@playwright/test';
import { AdminSpectaclesPage } from '@/e2e/pages/admin/spectacles.page';

interface SpectaclesFixtures {
    spectaclesPage: AdminSpectaclesPage;
}

export const test = base.extend<SpectaclesFixtures>({
    spectaclesPage: async ({ page }, use) => {
        const spectaclesPage = new AdminSpectaclesPage(page);
        await spectaclesPage.goto();
        // eslint-disable-next-line react-hooks/rules-of-hooks
        await use(spectaclesPage);
    },
});

export { expect } from '@playwright/test';
