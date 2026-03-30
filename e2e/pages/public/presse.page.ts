import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class PressePage {
    readonly heroHeading: Locator;
    readonly contactPresseSection: Locator;
    readonly revueDePresse: Locator;

    constructor(private readonly page: Page) {
        this.heroHeading = page.getByRole('heading', { name: /espace média/i });
        this.contactPresseSection = page.locator(
            '[aria-label="Contact presse"]',
        );
        this.revueDePresse = page.locator('[aria-label="Revue de presse"]');
    }

    async goto(): Promise<void> {
        await this.page.goto('/presse', { waitUntil: 'networkidle' });
    }

    async expectLoaded(): Promise<void> {
        // Vérifier URL + contenu stable au lieu du H1 exact
        await expect(this.page).toHaveURL(/\/presse\/?$/);
        await expect(this.revueDePresse).toBeVisible({ timeout: 15_000 });
    }
}
