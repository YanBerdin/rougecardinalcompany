import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class AdminLieuxPage {
    readonly heading: Locator;
    readonly createButton: Locator;
    readonly table: Locator;
    readonly emptyState: Locator;

    constructor(private readonly page: Page) {
        this.heading = page.getByRole('heading', { name: 'Lieux' });
        this.createButton = page.getByRole('button', { name: 'Nouveau Lieu' });
        this.table = page.locator('table');
        this.emptyState = page.getByText('Aucun lieu enregistré');
    }

    async goto(): Promise<void> {
        await this.page.goto('/admin/lieux');
    }

    async expectLoaded(): Promise<void> {
        await expect(this.heading).toBeVisible();
    }

    async expectTableHeaders(): Promise<void> {
        const headers = ['Nom', 'Ville', 'Adresse', 'Capacité', 'Actions'];
        for (const header of headers) {
            await expect(this.table.getByRole('columnheader', { name: header })).toBeVisible();
        }
    }

    async clickCreate(): Promise<void> {
        await this.createButton.click();
        await this.page.waitForURL('**/admin/lieux/new');
    }

    async fillForm(data: {
        nom: string;
        adresse?: string;
        ville?: string;
        codePostal?: string;
        capacite?: string;
    }): Promise<void> {
        await this.page.getByLabel('Nom *').fill(data.nom);
        if (data.adresse) {
            await this.page.getByLabel('Adresse').fill(data.adresse);
        }
        if (data.ville) {
            await this.page.getByLabel('Ville').fill(data.ville);
        }
        if (data.codePostal) {
            await this.page.getByLabel('Code postal').fill(data.codePostal);
        }
        if (data.capacite) {
            await this.page.getByLabel('Capacité').fill(data.capacite);
        }
    }

    async submitForm(): Promise<void> {
        await this.page.getByRole('button', { name: /Créer|Mettre à jour/ }).click();
    }

    async clickRowAction(nom: string, action: 'Modifier' | 'Supprimer'): Promise<void> {
        await this.page.getByRole('button', { name: `${action} ${nom}` }).click();
    }

    async confirmDelete(): Promise<void> {
        await expect(this.page.getByText('Supprimer ce lieu ?')).toBeVisible();
        await this.page.getByRole('button', { name: 'Supprimer' }).last().click();
    }

    async expectDeleteToast(): Promise<void> {
        await expect(this.page.getByText('Lieu supprimé')).toBeVisible();
    }

    async expectCreateToast(): Promise<void> {
        await expect(this.page.getByText('Lieu créé')).toBeVisible();
    }

    async expectUpdateToast(): Promise<void> {
        await expect(this.page.getByText('Lieu mis à jour')).toBeVisible();
    }

    async expectRowWithNom(nom: string): Promise<void> {
        await expect(this.table.getByRole('cell', { name: nom }).first()).toBeVisible();
    }

    async expectFormValidationError(): Promise<void> {
        await expect(this.page.locator('[role="alert"], .text-destructive, [data-slot="form-message"]').first()).toBeVisible();
    }
}
