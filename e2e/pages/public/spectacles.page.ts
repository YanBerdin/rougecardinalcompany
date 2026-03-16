import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class SpectaclesPage {
    readonly heroHeading: Locator;
    readonly spectacleCards: Locator;

    constructor(private readonly page: Page) {
        this.heroHeading = page.getByRole('heading', { name: 'À l\'Affiche' });
        this.spectacleCards = page.getByRole('region', { name: 'Spectacles actuels' });
    }

    async goto(): Promise<void> {
        await this.page.goto('/spectacles');
    }

    async expectLoaded(): Promise<void> {
        await expect(this.heroHeading).toBeVisible();
    }

    async expectSpectacleCardsVisible(): Promise<void> {
        await expect(this.spectacleCards).toBeVisible();
    }

    async clickFirstSpectacle(): Promise<void> {
        // L'overlay CSS (pointer-events-none → auto au hover) intercepte les clics.
        // On récupère le href du premier lien image et on navigue directement.
        const imageLink = this.spectacleCards
            .getByRole('link', { name: /Affiche du spectacle/ })
            .first();
        const href = await imageLink.getAttribute('href');
        if (!href) throw new Error('Aucun lien spectacle trouvé');
        await this.page.goto(href);
    }

    async expectDetailPageLoaded(): Promise<void> {
        await expect(this.page).toHaveURL(/\/spectacles\/.+/, { timeout: 15_000 });
        await expect(
            this.page.getByRole('heading', { level: 1 }),
        ).toBeVisible();
    }
}
