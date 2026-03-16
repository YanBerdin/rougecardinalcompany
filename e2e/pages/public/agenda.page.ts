import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class AgendaPage {
    readonly heroHeading: Locator;

    constructor(private readonly page: Page) {
        this.heroHeading = page.getByRole('heading', { name: 'Agenda' });
    }

    async goto(): Promise<void> {
        await this.page.goto('/agenda');
    }

    async expectLoaded(): Promise<void> {
        await expect(this.heroHeading).toBeVisible();
    }

    async expectEventListVisible(): Promise<void> {
        const subtitle = this.page.getByText('Retrouvez-nous sur scène');
        await expect(subtitle).toBeVisible();
    }
}
