import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class CompagniePage {
    readonly heroHeading: Locator;

    constructor(private readonly page: Page) {
        this.heroHeading = page.locator('#heading-hero');
    }

    async goto(): Promise<void> {
        await this.page.goto('/compagnie');
    }

    async expectLoaded(): Promise<void> {
        await expect(this.page.getByRole('heading', { level: 1 })).toBeVisible();
    }

    async expectSections(): Promise<void> {
        const sectionIds = [
            'heading-hero',
            'heading-history',
            'heading-team',
        ];
        for (const id of sectionIds) {
            const section = this.page.locator(`#${id}`);
            if (await section.isVisible()) {
                await expect(section).toBeVisible();
            }
        }
    }
}
