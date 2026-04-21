import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class AgendaPage {
    readonly heroHeading: Locator;
    readonly eventList: Locator;

    constructor(private readonly page: Page) {
        this.heroHeading = page.getByRole('heading', { name: /agenda/i });
        this.eventList = page.getByTestId('agenda-event-list');
    }

    async goto(): Promise<void> {
        await this.page.goto('/agenda', { waitUntil: 'networkidle' });
    }

    async expectLoaded(): Promise<void> {
        await expect(this.page).toHaveURL(/\/agenda\/?$/);
        await expect(this.heroHeading).toBeVisible({ timeout: 15_000 });
    }

    async expectEventListVisible(): Promise<void> {
        await expect(this.eventList).toBeVisible({ timeout: 15_000 });
    }
}
