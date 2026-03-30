import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class AgendaPage {
    readonly heroHeading: Locator;

    constructor(private readonly page: Page) {
        this.heroHeading = page.getByRole('heading', { name: /agenda/i });
    }

    async goto(): Promise<void> {
        await this.page.goto('/agenda', { waitUntil: 'networkidle' });
    }

    async expectLoaded(): Promise<void> {
        await expect(this.page).toHaveURL(/\/agenda\/?$/);
        await expect(this.heroHeading).toBeVisible({ timeout: 15_000 });
    }

    async expectEventListVisible(): Promise<void> {
        const subtitle = this.page.getByText('Retrouvez-nous sur scène');
        await expect(subtitle).toBeVisible();
    }
}
