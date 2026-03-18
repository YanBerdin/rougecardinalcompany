import { test as base } from '@playwright/test';
import { AdminPressePage } from '@/e2e/pages/admin/presse.page';

interface PresseFixtures {
    pressePage: AdminPressePage;
}

export const test = base.extend<PresseFixtures>({
    pressePage: async ({ page }, use) => {
        const pressePage = new AdminPressePage(page);
        await pressePage.goto();
        // eslint-disable-next-line react-hooks/rules-of-hooks
        await use(pressePage);
    },
});

export { expect } from '@playwright/test';
