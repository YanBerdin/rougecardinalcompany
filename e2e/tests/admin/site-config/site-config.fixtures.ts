import { test as base } from '@playwright/test';
import { AdminSiteConfigPage } from '@/e2e/pages/admin';

interface SiteConfigFixtures {
    siteConfigPage: AdminSiteConfigPage;
}

export const test = base.extend<SiteConfigFixtures>({
    siteConfigPage: async ({ page }, use) => {
        const siteConfigPage = new AdminSiteConfigPage(page);
        await siteConfigPage.goto();
        // eslint-disable-next-line react-hooks/rules-of-hooks
        await use(siteConfigPage);
    },
});

export { expect } from '@playwright/test';
