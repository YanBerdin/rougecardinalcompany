import { test as base } from '@playwright/test';
import { AdminAnalyticsPage } from '@/e2e/pages/admin';

interface AnalyticsFixtures {
    analyticsPage: AdminAnalyticsPage;
}

export const test = base.extend<AnalyticsFixtures>({
    analyticsPage: async ({ page }, use) => {
        const analyticsPage = new AdminAnalyticsPage(page);
        await analyticsPage.goto();
        // eslint-disable-next-line react-hooks/rules-of-hooks
        await use(analyticsPage);
    },
});

export { expect } from '@playwright/test';
