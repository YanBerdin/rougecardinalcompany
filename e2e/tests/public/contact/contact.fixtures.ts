import { test as base } from '@playwright/test';
import { ContactPage } from '@/e2e/pages/public/contact.page';

interface ContactFixtures {
    contactPage: ContactPage;
}

export const test = base.extend<ContactFixtures>({
    contactPage: async ({ page }, use) => {
        const contactPage = new ContactPage(page);
        await contactPage.goto();
        await use(contactPage);
    },
});

export { expect } from '@playwright/test';
