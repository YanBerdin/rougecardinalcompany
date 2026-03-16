import { test as base } from '@playwright/test';
import { PressePage } from '@/e2e/pages/public/presse.page';

interface PresseFixtures {
    pressePage: PressePage;
}

export const test = base.extend<PresseFixtures>({
    pressePage: async ({ page }, use) => {
        const pressePage = new PressePage(page);
        await pressePage.goto();
        await use(pressePage);
    },
});

export { expect } from '@playwright/test';
