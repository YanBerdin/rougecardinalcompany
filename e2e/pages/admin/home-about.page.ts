import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class AdminHomeAboutPage {
    readonly heading: Locator;
    readonly addStatButton: Locator;
    readonly statsList: Locator;
    readonly emptyState: Locator;

    constructor(private readonly page: Page) {
        this.heading = page.getByRole('heading', { name: /À propos|About/i }).first();
        this.addStatButton = page.getByRole('button', { name: /Ajouter une statistique/i });
        this.statsList = page.getByRole('list', { name: 'Liste des statistiques' });
        this.emptyState = page.getByText('Aucune statistique. Créez-en une pour commencer.');
    }

    async goto(): Promise<void> {
        await this.page.goto(`/admin/home/about?_t=${Date.now()}`);
    }

    async expectLoaded(): Promise<void> {
        await this.page.waitForLoadState('networkidle');
        await expect(this.addStatButton).toBeVisible({ timeout: 10_000 });
    }

    async clickAddStat(): Promise<void> {
        await this.addStatButton.click();
    }

    async fillStatForm(data: { label: string; value: string; key?: string }): Promise<void> {
        await this.page.getByLabel(/Libellé|Label/i).fill(data.label);
        await this.page.getByLabel(/Valeur chiffrée|Valeur/i).fill(data.value);
        if (data.key) {
            const keyInput = this.page.getByLabel(/Clé|Key/i);
            if (await keyInput.isVisible()) {
                await keyInput.fill(data.key);
            }
        }
    }

    async submitStatForm(): Promise<void> {
        await this.page.getByRole('button', { name: /Créer|Mettre à jour/i }).click();
    }

    async clickEditStat(label: string): Promise<void> {
        await this.page.getByRole('button', { name: `Modifier la statistique ${label}` }).click();
    }

    async clickDeleteStat(label: string): Promise<void> {
        await this.page.getByRole('button', { name: `Supprimer la statistique ${label}` }).click();
    }

    async confirmDeleteStat(): Promise<void> {
        const dialog = this.page.getByRole('alertdialog');
        await expect(dialog.getByText('Supprimer cette statistique ?')).toBeVisible();
        await dialog.getByRole('button', { name: 'Supprimer' }).click();
    }

    async cancelDeleteStat(): Promise<void> {
        const dialog = this.page.getByRole('alertdialog');
        await dialog.getByRole('button', { name: /Annuler/i }).click();
    }

    async expectStatVisible(label: string): Promise<void> {
        await expect(this.page.getByText(label).first()).toBeVisible();
    }

    async expectStatNotVisible(label: string): Promise<void> {
        await expect(this.page.getByText(label)).not.toBeVisible();
    }

    async expectEmptyState(): Promise<void> {
        await expect(this.emptyState).toBeVisible();
    }
}
