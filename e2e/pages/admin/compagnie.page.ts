import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class AdminCompagniePage {
    readonly heading: Locator;
    readonly tabPresentation: Locator;
    readonly tabValeurs: Locator;

    constructor(private readonly page: Page) {
        this.heading = page.getByRole('heading', { name: 'Gestion Compagnie' });
        this.tabPresentation = page.getByRole('tab', { name: 'Présentation' });
        this.tabValeurs = page.getByRole('tab', { name: 'Valeurs' });
    }

    async goto(): Promise<void> {
        await this.page.goto('/admin/compagnie');
    }

    async expectLoaded(): Promise<void> {
        await expect(this.heading).toBeVisible();
    }

    async expectTwoTabs(): Promise<void> {
        await expect(this.tabPresentation).toBeVisible();
        await expect(this.tabValeurs).toBeVisible();
    }

    async switchToTab(tab: 'Présentation' | 'Valeurs'): Promise<void> {
        await this.page.getByRole('tab', { name: tab }).click();
    }

    async expectSectionCount(count: number): Promise<void> {
        const items = this.page.locator('[aria-label="Liste des sections de présentation"] li');
        await expect(items).toHaveCount(count);
    }

    async expectSectionKinds(kinds: string[]): Promise<void> {
        for (const kind of kinds) {
            await expect(this.page.getByText(kind).first()).toBeVisible();
        }
    }

    async expectSectionActive(kind: string): Promise<void> {
        const section = this.page.locator('li').filter({ hasText: kind });
        await expect(section.getByText('Actif')).toBeVisible();
    }

    async clickEditSection(kind: string): Promise<void> {
        const section = this.page.locator('li').filter({ hasText: kind });
        await section.getByRole('button', { name: /Modifier/ }).click();
    }

    async clickVisualiser(): Promise<void> {
        await this.page.getByRole('link', { name: /Visualiser/ }).click();
    }
}
