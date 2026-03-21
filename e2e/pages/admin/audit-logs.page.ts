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
        // Fail fast if the page is in error state (e.g. Postgres statement_timeout).
        // Without this check, tests wait the full 45s test timeout for buttons that
        // are never rendered, delaying the retry that would recover the situation.
        await expect(
            this.page.getByRole('alert').filter({ hasText: /ERR_AUDIT/ }),
        ).not.toBeVisible({ timeout: 3_000 });
        // Confirm the table toolbar is rendered (table loaded successfully).
        await expect(this.refreshButton).toBeVisible({ timeout: 10_000 });
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
