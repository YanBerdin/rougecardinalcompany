import { test as base } from '@playwright/test';
import { AdminTeamPage } from '@/e2e/pages/admin';

interface TeamFixtures {
    teamPage: AdminTeamPage;
}

export const test = base.extend<TeamFixtures>({
    teamPage: async ({ page }, use) => {
        const teamPage = new AdminTeamPage(page);
        await teamPage.goto();
        // eslint-disable-next-line react-hooks/rules-of-hooks
        await use(teamPage);
    },
});

export { expect } from '@playwright/test';
