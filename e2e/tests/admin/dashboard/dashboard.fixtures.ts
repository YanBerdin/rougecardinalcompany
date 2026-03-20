import { test as base } from '@playwright/test';
import { AdminDashboardPage } from '@/e2e/pages/admin';

interface DashboardFixtures {
    dashboardPage: AdminDashboardPage;
}

export const test = base.extend<DashboardFixtures>({
    dashboardPage: async ({ page }, use) => {
        const dashboardPage = new AdminDashboardPage(page);
        await dashboardPage.goto();
        // eslint-disable-next-line react-hooks/rules-of-hooks
        await use(dashboardPage);
    },
});

export { expect } from '@playwright/test';
