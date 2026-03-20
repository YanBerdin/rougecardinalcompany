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
        await this.page.waitForLoadState('networkidle');
        await expect(this.heading).toBeVisible({ timeout: 10_000 });
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

    async clickExport(): Promise<void> {
        await this.exportButton.click();
    }
}
