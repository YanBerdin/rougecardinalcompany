import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class PressePage {
    readonly heroHeading: Locator;
    readonly contactPresseSection: Locator;
    readonly revueDePresse: Locator;

    constructor(private readonly page: Page) {
        this.heroHeading = page.getByRole('heading', { name: 'Espace Média' });
        this.contactPresseSection = page.locator(
            '[aria-label="Contact presse"]',
        );
        this.revueDePresse = page.locator('[aria-label="Revue de presse"]');
    }

    async goto(): Promise<void> {
        await this.page.goto('/presse', { waitUntil: 'domcontentloaded' });
    }

    async expectLoaded(): Promise<void> {
        await expect(this.heroHeading).toBeVisible();
    }
}
