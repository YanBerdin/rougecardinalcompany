import { test as base } from '@playwright/test';
import { AdminPartnersPage } from '@/e2e/pages/admin';

interface PartnersFixtures {
    partnersPage: AdminPartnersPage;
}

export const test = base.extend<PartnersFixtures>({
    partnersPage: async ({ page }, use) => {
        const partnersPage = new AdminPartnersPage(page);
        await partnersPage.goto();
        // eslint-disable-next-line react-hooks/rules-of-hooks
        await use(partnersPage);
    },
});

export { expect } from '@playwright/test';
