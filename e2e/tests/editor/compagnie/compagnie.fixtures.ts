import { test as base } from '@playwright/test';
import { AdminCompagniePage } from '@/e2e/pages/admin/compagnie.page';

interface CompagnieFixtures {
    compagniePage: AdminCompagniePage;
}

export const test = base.extend<CompagnieFixtures>({
    compagniePage: async ({ page }, use) => {
        const compagniePage = new AdminCompagniePage(page);
        await compagniePage.goto();
        // eslint-disable-next-line react-hooks/rules-of-hooks
        await use(compagniePage);
    },
});

export { expect } from '@playwright/test';
