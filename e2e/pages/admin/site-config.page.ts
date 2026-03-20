import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class AdminSiteConfigPage {
    readonly heading: Locator;
    readonly sectionsHeading: Locator;

    constructor(private readonly page: Page) {
        this.heading = page.getByRole('heading', { name: /Configuration|Site/i }).first();
        this.sectionsHeading = page.getByRole('heading', { name: /Affichage des Sections/i });
    }

    async goto(): Promise<void> {
        await this.page.goto(`/admin/site-config?_t=${Date.now()}`);
    }

    async expectLoaded(): Promise<void> {
        await this.page.waitForLoadState('load');
        await expect(this.sectionsHeading).toBeVisible({ timeout: 10_000 });
        // Wait for at least one toggle switch to render (React hydration)
        await this.page.locator('[role="switch"]').first().waitFor({ timeout: 10_000 });
    }

    getToggleByKey(key: string): Locator {
        // Attribute selector avoids CSS parsing issues with colons in IDs (e.g. "public:home:hero")
        return this.page.locator(`[id="${key}"]`);
    }

    async isToggleEnabled(key: string): Promise<boolean> {
        const toggle = this.getToggleByKey(key);
        await toggle.waitFor({ timeout: 10_000 });
        const checked = await toggle.getAttribute('aria-checked');
        return checked === 'true';
    }

    async clickToggle(key: string): Promise<void> {
        await this.getToggleByKey(key).click();
    }

    async expectToggleState(key: string, enabled: boolean): Promise<void> {
        const toggle = this.getToggleByKey(key);
        await expect(toggle).toHaveAttribute('aria-checked', String(enabled));
    }

    async expectSectionVisible(sectionName: string): Promise<void> {
        await expect(this.page.getByText(sectionName)).toBeVisible();
    }

    async expectToastVisible(title: string): Promise<void> {
        await expect(
            this.page.locator('[data-sonner-toast]').filter({ hasText: title })
        ).toBeVisible({ timeout: 15_000 });
    }

    getSectionLocator(sectionTitle: string): Locator {
        return this.page
            .locator('section, [role="region"]')
            .filter({ has: this.page.getByText(sectionTitle) });
    }
}
