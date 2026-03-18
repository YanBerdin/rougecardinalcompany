import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class AdminAgendaPage {
    readonly heading: Locator;
    readonly createButton: Locator;
    readonly table: Locator;
    readonly emptyState: Locator;

    constructor(private readonly page: Page) {
        this.heading = page.getByRole('heading', { name: 'Gestion Agenda' });
        this.createButton = page.getByRole('button', { name: 'Nouvel Événement' });
        this.table = page.locator('table');
        this.emptyState = page.getByText('Aucun événement trouvé.');
    }

    async goto(): Promise<void> {
        await this.page.goto('/admin/agenda');
    }

    async expectLoaded(): Promise<void> {
        await expect(this.heading).toBeVisible();
    }

    async expectTableHeaders(): Promise<void> {
        const headers = ['Spectacle', 'Date', 'Lieu', 'Statut', 'Actions'];
        for (const header of headers) {
            await expect(this.table.getByRole('columnheader', { name: header })).toBeVisible();
        }
    }

    async clickCreate(): Promise<void> {
        await this.createButton.click();
        await this.page.waitForURL('**/admin/agenda/new');
    }

    async fillForm(data: {
        spectacle?: string;
        dateDebut: string;
        startTime: string;
        lieu?: string;
    }): Promise<void> {
        if (data.spectacle) {
            await this.page.getByRole('combobox', { name: /Spectacle/i }).click();
            await this.page.getByRole('option', { name: data.spectacle }).click();
        }
        // date_debut is a datetime-local input: combine date + time
        const datetimeValue = `${data.dateDebut}T${data.startTime}`;
        await this.page.getByLabel('Date début *').fill(datetimeValue);
        await this.page.getByLabel('Heure début *').fill(data.startTime);
        if (data.lieu) {
            await this.page.getByRole('combobox', { name: /Lieu/i }).click();
            await this.page.getByRole('option', { name: data.lieu }).click();
        }
    }

    async submitForm(): Promise<void> {
        await this.page.getByRole('button', { name: /Créer|Mettre à jour/ }).click();
    }

    async clickRowAction(spectacleTitle: string, action: 'Voir' | 'Modifier' | 'Supprimer'): Promise<void> {
        await this.page.getByRole('button', { name: `${action} ${spectacleTitle}` }).click();
    }

    async confirmDelete(): Promise<void> {
        await expect(this.page.getByText('Supprimer cet événement ?')).toBeVisible();
        await this.page.getByRole('button', { name: 'Supprimer' }).last().click();
    }

    async expectDeleteToast(): Promise<void> {
        await expect(this.page.getByText('Événement supprimé')).toBeVisible();
    }

    async expectRowWithSpectacle(spectacleTitle: string): Promise<void> {
        await expect(this.table.getByRole('cell', { name: spectacleTitle }).first()).toBeVisible();
    }
}
