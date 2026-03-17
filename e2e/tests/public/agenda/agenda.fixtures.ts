import { test as base } from '@playwright/test';
import { AgendaPage } from '@/e2e/pages/public/agenda.page';

interface AgendaFixtures {
    agendaPage: AgendaPage;
}

export const test = base.extend<AgendaFixtures>({
    agendaPage: async ({ page }, use) => {
        const agendaPage = new AgendaPage(page);
        await agendaPage.goto();
        await use(agendaPage);
    },
});

export { expect } from '@playwright/test';
