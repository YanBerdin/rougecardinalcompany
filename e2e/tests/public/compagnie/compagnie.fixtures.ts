import { test as base } from '@playwright/test';
import { CompagniePage } from '@/e2e/pages/public/compagnie.page';

interface CompagnieFixtures {
    compagniePage: CompagniePage;
}

export const test = base.extend<CompagnieFixtures>({
    compagniePage: async ({ page }, register) => {
        const compagniePage = new CompagniePage(page);
        await compagniePage.goto();
        await register(compagniePage);
    },
});

export { expect } from '@playwright/test';
