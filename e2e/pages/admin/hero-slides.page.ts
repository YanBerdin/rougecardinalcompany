import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class AdminHeroSlidesPage {
    readonly heading: Locator;
    readonly addSlideButton: Locator;
    readonly slideList: Locator;

    constructor(private readonly page: Page) {
        this.heading = page.getByRole('heading', { name: /Slides|Hero/i }).first();
        this.addSlideButton = page.getByRole('button', { name: /Ajouter un slide|Nouveau slide/i });
        this.slideList = page.locator('[role="list"], ul').first();
    }

    async goto(): Promise<void> {
        await this.page.goto(`/admin/home/hero?_t=${Date.now()}`);
    }

    async expectLoaded(): Promise<void> {
        await this.page.waitForLoadState('networkidle');
        await expect(this.addSlideButton).toBeVisible({ timeout: 10_000 });
    }

    getSlideByTitle(title: string): Locator {
        return this.page.locator('[class*="card"], li').filter({ hasText: title });
    }

    async clickAddSlide(): Promise<void> {
        await this.addSlideButton.click();
    }

    async fillSlideForm(data: { title: string; subtitle?: string; description?: string; imageUrl?: string; altText?: string }): Promise<void> {
        await this.page.getByLabel(/Titre\s*\*/i).fill(data.title);
        if (data.subtitle) {
            await this.page.getByLabel(/Sous.?titre/i).fill(data.subtitle);
        }
        if (data.description) {
            await this.page.getByLabel(/Description/i).fill(data.description);
        }
        // Only fill image URL when explicitly provided (avoid overwriting existing URL on edit)
        if (data.imageUrl !== undefined) {
            await this.page.getByPlaceholder('https://example.com/image.jpg').fill(data.imageUrl);
        }
        // Fill alt text if provided (required by HeroSlideFormSchema)
        if (data.altText) {
            await this.page.getByLabel(/Alt\s*Text/i).fill(data.altText);
        }
    }

    async submitSlideForm(): Promise<void> {
        await this.page.getByRole('button', { name: /Créer|Mettre à jour/i }).click();
    }

    async clickEditSlide(title: string): Promise<void> {
        await this.page.getByRole('button', { name: `Modifier le slide : ${title}` }).click();
    }

    async clickDeleteSlide(title: string): Promise<void> {
        await this.page.getByRole('button', { name: `Supprimer le slide : ${title}` }).click();
    }

    async confirmDelete(): Promise<void> {
        const dialog = this.page.getByRole('alertdialog');
        await dialog.getByRole('button', { name: 'Supprimer' }).click();
    }

    async expectSlideVisible(title: string): Promise<void> {
        await expect(this.page.getByText(title).first()).toBeVisible();
    }

    async expectSlideNotVisible(title: string): Promise<void> {
        await expect(this.page.getByText(title).first()).not.toBeVisible();
    }
}
