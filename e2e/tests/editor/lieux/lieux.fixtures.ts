import { test as base } from '@playwright/test';
import { AdminLieuxPage } from '@/e2e/pages/admin/lieux.page';

interface LieuxFixtures {
    lieuxPage: AdminLieuxPage;
}

export const test = base.extend<LieuxFixtures>({
    lieuxPage: async ({ page }, use) => {
        const lieuxPage = new AdminLieuxPage(page);
        await lieuxPage.goto();
        // eslint-disable-next-line react-hooks/rules-of-hooks
        await use(lieuxPage);
    },
});

export { expect } from '@playwright/test';
