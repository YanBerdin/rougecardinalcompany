import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class AdminPartnersPage {
    readonly heading: Locator;
    readonly addPartnerLink: Locator;

    constructor(private readonly page: Page) {
        this.heading = page.getByRole('heading', { name: /Partenaires/i }).first();
        this.addPartnerLink = page.getByRole('link', { name: /Nouveau partenaire|Ajouter/i });
    }

    async goto(): Promise<void> {
        await this.page.goto(`/admin/partners?_t=${Date.now()}`);
    }

    async expectLoaded(): Promise<void> {
        await this.page.waitForLoadState('networkidle');
        await expect(this.addPartnerLink).toBeVisible({ timeout: 10_000 });
    }

    async clickAddPartner(): Promise<void> {
        await this.addPartnerLink.click();
    }

    async fillPartnerForm(data: { name: string; url?: string; description?: string }): Promise<void> {
        await this.page.getByLabel(/Nom du partenaire/i).fill(data.name);
        if (data.url) {
            await this.page.getByLabel(/Site web/i).fill(data.url);
        }
        if (data.description) {
            await this.page.getByLabel(/Description/i).fill(data.description);
        }
    }

    async submitPartnerForm(): Promise<void> {
        await this.page.getByRole('button', { name: /Créer|Mettre à jour/i }).click();
    }

    async clickEditPartner(name: string): Promise<void> {
        await this.page.getByRole('button', { name: `Modifier ${name}` }).click();
    }

    async clickDeletePartner(name: string): Promise<void> {
        await this.page.getByRole('button', { name: `Supprimer ${name}` }).click();
    }

    async confirmDeletePartner(): Promise<void> {
        const dialog = this.page.getByRole('dialog');
        await dialog.getByRole('button', { name: /Supprimer|Confirmer/i }).click();
    }

    async cancelDeletePartner(): Promise<void> {
        const dialog = this.page.getByRole('dialog');
        await dialog.getByRole('button', { name: /Annuler/i }).click();
    }

    async expectPartnerVisible(name: string): Promise<void> {
        // Card renders both mobile (sm:hidden) and desktop (hidden sm:flex) views;
        // .last() targets the desktop-visible h3 at 1280px viewport
        await expect(this.page.getByText(name).last()).toBeVisible({ timeout: 5_000 });
    }

    async expectPartnerNotVisible(name: string): Promise<void> {
        // After deletion, wait for both mobile+desktop h3 elements to disappear
        await expect(this.page.getByText(name).first()).not.toBeVisible({ timeout: 10_000 });
    }

    getDnDHandle(name: string): Locator {
        return this.page.locator('[aria-label="Glisser pour réorganiser"]').filter({
            has: this.page.getByText(name),
        });
    }
}
