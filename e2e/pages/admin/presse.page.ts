import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class AdminPressePage {
    readonly heading: Locator;
    readonly tabCommuniques: Locator;
    readonly tabArticles: Locator;
    readonly tabContacts: Locator;

    constructor(private readonly page: Page) {
        this.heading = page.getByRole('heading', { name: 'Gestion Presse' });
        this.tabCommuniques = page.getByRole('tab', { name: 'Communiqués' });
        this.tabArticles = page.getByRole('tab', { name: 'Articles' });
        this.tabContacts = page.getByRole('tab', { name: 'Contacts' });
    }

    async goto(): Promise<void> {
        await this.page.goto('/admin/presse');
    }

    async expectLoaded(): Promise<void> {
        await expect(this.heading).toBeVisible();
    }

    async expectThreeTabs(): Promise<void> {
        await expect(this.tabCommuniques).toBeVisible();
        await expect(this.tabArticles).toBeVisible();
        await expect(this.tabContacts).toBeVisible();
    }

    async switchToTab(tab: 'Communiqués' | 'Articles' | 'Contacts'): Promise<void> {
        await this.page.getByRole('tab', { name: tab }).click();
    }

    async clickCreateCommunique(): Promise<void> {
        await this.page.getByRole('link', { name: 'Nouveau communiqué', exact: true }).click();
        await this.page.waitForURL('**/admin/presse/communiques/new');
    }

    async fillCommuniqueForm(data: {
        title: string;
        description?: string;
    }): Promise<void> {
        await this.page.getByLabel(/Titre/i).fill(data.title);
        if (data.description) {
            await this.page.getByLabel(/Description/i).fill(data.description);
        }
    }

    async submitForm(): Promise<void> {
        await this.page.getByRole('button', { name: /Créer|Mettre à jour|Sauvegarder|Enregistrer|Publier/ }).click();
    }

    async clickCommuniqueAction(
        title: string,
        action: 'Prévisualiser' | 'Publier' | 'Dépublier' | 'Modifier' | 'Supprimer',
    ): Promise<void> {
        const ariaLabelMap: Record<string, string> = {
            'Prévisualiser': `Prévisualiser le communiqué : ${title}`,
            'Publier': 'Publier le communiqué',
            'Dépublier': 'Dépublier le communiqué',
            'Modifier': `Modifier le communiqué : ${title}`,
            'Supprimer': `Supprimer le communiqué : ${title}`,
        };
        const button = this.page.getByRole('button', { name: ariaLabelMap[action] }).first();
        await button.click();
        if (action === 'Modifier') {
            await this.page.waitForURL('**/edit');
        }
    }

    async confirmDelete(): Promise<void> {
        await expect(this.page.getByText('Confirmer la suppression')).toBeVisible();
        await this.page.getByRole('button', { name: /Supprimer|Confirmer/ }).last().click();
    }

    async expectDeleteToast(): Promise<void> {
        await expect(this.page.getByText('Communiqué supprimé')).toBeVisible({ timeout: 10_000 });
    }

    async expectPublishToast(): Promise<void> {
        await expect(this.page.getByText('Communiqué publié')).toBeVisible({ timeout: 10_000 });
    }

    async expectUnpublishToast(): Promise<void> {
        await expect(this.page.getByText('Communiqué dépublié')).toBeVisible({ timeout: 10_000 });
    }

    async expectCommuniqueVisible(title: string): Promise<void> {
        await expect(this.page.getByText(title).first()).toBeVisible({ timeout: 10_000 });
    }
}
