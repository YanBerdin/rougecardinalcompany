import { test as base } from '@playwright/test';
import { AdminAuditLogsPage } from '@/e2e/pages/admin';

interface AuditLogsFixtures {
    auditLogsPage: AdminAuditLogsPage;
}

export const test = base.extend<AuditLogsFixtures>({
    auditLogsPage: async ({ page }, use) => {
        const auditLogsPage = new AdminAuditLogsPage(page);
        await auditLogsPage.goto();
        // eslint-disable-next-line react-hooks/rules-of-hooks
        await use(auditLogsPage);
    },
});

export { expect } from '@playwright/test';
