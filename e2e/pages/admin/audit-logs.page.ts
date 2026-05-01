import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class AdminAuditLogsPage {
    readonly heading: Locator;
    readonly searchInput: Locator;
    readonly refreshButton: Locator;
    readonly exportButton: Locator;
    readonly actionFilter: Locator;
    readonly tableFilter: Locator;
    readonly userFilter: Locator;
    readonly logsTable: Locator;

    constructor(private readonly page: Page) {
        this.heading = page.getByRole('heading', { name: /Audit|Journaux/i }).first();
        this.searchInput = page.getByRole('searchbox', { name: /Rechercher dans les logs/i })
            .or(page.locator('[aria-label="Rechercher dans les logs d\'audit"]'));
        this.refreshButton = page.getByRole('button', { name: /Rafraîchir/i });
        this.exportButton = page.getByRole('button', { name: /Exporter|Export/i });
        this.actionFilter = page.getByPlaceholder('Action');
        this.tableFilter = page.getByPlaceholder('Table');
        this.userFilter = page.getByPlaceholder('Utilisateur');
        this.logsTable = page.getByRole('table').first();
    }

    async goto(): Promise<void> {
        await this.page.goto(`/admin/audit-logs?_t=${Date.now()}`);
    }

    async expectLoaded(): Promise<void> {
        await expect(this.heading).toBeVisible({ timeout: 15_000 });

        const errAlert = this.page.getByRole('alert').filter({ hasText: /ERR_AUDIT/ });

        // Retry a few times because CI DB can be under load and the first request may
        // time out. Handling recovery at the page-load level gives all dependent
        // assertions a clean starting point.
        const maxAttempts = 3;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            await this.page.waitForLoadState('networkidle').catch(() => {});

            const hasError = await errAlert.isVisible().catch(() => false);
            if (!hasError) break;

            // Small backoff before reloading to let DB recover
            await this.page.waitForTimeout(500 * attempt);
            await this.page.reload({ waitUntil: 'networkidle' });
        }

        await expect(errAlert).not.toBeVisible({ timeout: 15_000 });

        // Confirm the table toolbar is rendered (page is actually usable).
        await expect(this.refreshButton).toBeVisible({ timeout: 15_000 });
    }

    async clickRefresh(): Promise<void> {
        await this.refreshButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    async searchLogs(query: string): Promise<void> {
        await this.searchInput.fill(query);
        await this.page.waitForTimeout(500);
    }

    async filterByAction(action: string): Promise<void> {
        await this.actionFilter.fill(action);
        await this.page.waitForTimeout(500);
    }

    async filterByTable(table: string): Promise<void> {
        await this.tableFilter.fill(table);
        await this.page.waitForTimeout(500);
    }

    async filterByUser(user: string): Promise<void> {
        await this.userFilter.fill(user);
        await this.page.waitForTimeout(500);
    }

    getLogRow(action: string, tableName: string): Locator {
        return this.page.locator(`[aria-label="Log ${action} sur ${tableName}"]`);
    }

    async clickLogDetail(action: string, tableName: string): Promise<void> {
        const row = this.getLogRow(action, tableName);
        await row.getByRole('button', { name: 'Voir les détails' }).click();
    }

    async expectLogVisible(action: string, tableName: string): Promise<void> {
        await expect(this.getLogRow(action, tableName)).toBeVisible({ timeout: 5_000 });
    }

    async expectColumnHeaders(): Promise<void> {
        for (const col of ['Date', 'Utilisateur', 'Action', 'Table']) {
            await expect(this.logsTable.getByRole('columnheader', { name: col })).toBeVisible();
        }
    }

    async selectActionFilter(actionLabel: string): Promise<void> {
        const trigger = this.page.getByRole('combobox').filter({ hasText: /actions/i });
        await trigger.click();
        await this.page.getByRole('option', { name: actionLabel }).click();
        await this.page.waitForLoadState('networkidle');
    }

    async clickExport(): Promise<void> {
        await this.exportButton.click();
    }

    async expectExportToast(): Promise<void> {
        await expect(
            this.page.locator('[data-sonner-toast]').filter({ hasText: 'Export réussi' })
        ).toBeVisible({ timeout: 30_000 });
    }
}
