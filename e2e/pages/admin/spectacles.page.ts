import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class AdminSpectaclesPage {
    readonly heading: Locator;
    readonly createButton: Locator;
    readonly table: Locator;
    readonly emptyState: Locator;

    constructor(private readonly page: Page) {
        this.heading = page.getByRole('heading', { name: 'Gestion des spectacles' });
        this.createButton = page.getByRole('button', { name: /Nouveau spectacle|Nouveau/ });
        this.table = page.locator('table');
        this.emptyState = page.getByText('Aucun spectacle trouvé.');
    }

    async goto(): Promise<void> {
        await this.page.goto('/admin/spectacles');
    }

    async expectLoaded(): Promise<void> {
        await expect(this.heading).toBeVisible();
    }

    async expectTableHeaders(): Promise<void> {
        const headers = ['Titre', 'Genre', 'Statut', 'Durée', 'Première', 'Visibilité', 'Actions'];
        for (const header of headers) {
            await expect(this.table.getByRole('columnheader', { name: header })).toBeVisible();
        }
    }

    async clickCreate(): Promise<void> {
        await this.createButton.click();
        await this.page.waitForURL('**/admin/spectacles/new');
    }

    async fillForm(data: {
        title: string;
        genre?: string;
        duration?: string;
        description?: string;
    }): Promise<void> {
        await this.page.getByLabel('Titre *').fill(data.title);
        if (data.genre) {
            await this.page.getByRole('combobox').filter({ hasText: /Sélectionner un genre/ }).click();
            await this.page.getByRole('menuitem', { name: data.genre, exact: true }).click();
        }
        if (data.duration) {
            await this.page.getByLabel(/Durée/i).fill(data.duration);
        }
        if (data.description) {
            await this.page.getByLabel(/Description complète/i).fill(data.description);
        }
    }

    async submitForm(): Promise<void> {
        await this.page.getByRole('button', { name: /Créer le spectacle|Mettre à jour/ }).click();
    }

    async expectRowWithTitle(title: string): Promise<void> {
        await expect(this.table.getByRole('cell', { name: title }).first()).toBeVisible({ timeout: 15_000 });
    }

    async expectRowCount(count: number): Promise<void> {
        await expect(this.table.getByRole('row')).toHaveCount(count + 1); // +1 for header
    }

    getRowActions(title: string): Locator {
        return this.table.getByRole('row').filter({ hasText: title });
    }

    async clickRowAction(title: string, action: 'Détails' | 'Galerie' | 'Éditer' | 'Supprimer'): Promise<void> {
        const ariaLabelMap: Record<string, string> = {
            'Détails': `Voir ${title}`,
            'Galerie': `Gérer la galerie de ${title}`,
            'Éditer': `Éditer ${title}`,
            'Supprimer': `Supprimer ${title}`,
        };
        await this.page.getByRole('button', { name: ariaLabelMap[action] }).click();

        // Wait for navigation to complete for actions that trigger router.push()
        if (action === 'Détails') {
            await this.page.waitForURL('**/spectacles/*');
            await this.page.waitForLoadState('domcontentloaded');
        } else if (action === 'Éditer') {
            await this.page.waitForURL('**/edit');
            await this.page.waitForLoadState('domcontentloaded');
        } else if (action === 'Galerie') {
            await this.page.waitForURL('**/spectacles/*');
            await this.page.waitForLoadState('domcontentloaded');
        }
    }

    async confirmDelete(): Promise<void> {
        await expect(this.page.getByText('Supprimer le spectacle')).toBeVisible();
        await this.page.getByRole('button', { name: 'Supprimer' }).last().click();
    }

    async expectDeleteToast(): Promise<void> {
        await expect(this.page.getByText('Spectacle supprimé').first()).toBeVisible();
    }

    async clickSortHeader(header: string): Promise<void> {
        await this.table.getByRole('columnheader', { name: header }).click();
    }

    async expectFormValidationError(): Promise<void> {
        await expect(this.page.locator('[role="alert"], .text-destructive, [data-slot="form-message"]').first()).toBeVisible();
    }
}
