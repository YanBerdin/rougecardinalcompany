import { test as base } from '@playwright/test';
import { AdminAgendaPage } from '@/e2e/pages/admin/agenda.page';

interface AgendaFixtures {
    agendaPage: AdminAgendaPage;
}

export const test = base.extend<AgendaFixtures>({
    agendaPage: async ({ page }, use) => {
        const agendaPage = new AdminAgendaPage(page);
        await agendaPage.goto();
        // eslint-disable-next-line react-hooks/rules-of-hooks
        await use(agendaPage);
    },
});

export { expect } from '@playwright/test';
