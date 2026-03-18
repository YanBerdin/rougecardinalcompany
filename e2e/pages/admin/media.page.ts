import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class AdminMediaPage {
    readonly heading: Locator;
    readonly cardBibliotheque: Locator;
    readonly cardTags: Locator;
    readonly cardDossiers: Locator;

    constructor(private readonly page: Page) {
        this.heading = page.getByRole('heading', { name: 'Médiathèque', level: 1 });
        this.cardBibliotheque = page.getByRole('link', { name: /Bibliothèque/ });
        this.cardTags = page.getByRole('link', { name: /Tags/ });
        this.cardDossiers = page.getByRole('link', { name: /Dossiers/ });
    }

    async goto(): Promise<void> {
        await this.page.goto('/admin/media');
    }

    async expectLoaded(): Promise<void> {
        await expect(this.heading).toBeVisible();
    }

    async expectThreeSections(): Promise<void> {
        await expect(this.cardBibliotheque).toBeVisible();
        await expect(this.cardTags).toBeVisible();
        await expect(this.cardDossiers).toBeVisible();
    }

    async navigateToLibrary(): Promise<void> {
        await this.cardBibliotheque.click();
        await this.page.waitForURL('**/admin/media/library');
    }

    async navigateToTags(): Promise<void> {
        await this.cardTags.click();
        await this.page.waitForURL('**/admin/media/tags');
    }

    async navigateToFolders(): Promise<void> {
        await this.cardDossiers.click();
        await this.page.waitForURL('**/admin/media/folders');
    }
}

export class AdminMediaLibraryPage {
    readonly heading: Locator;
    readonly uploadButton: Locator;
    readonly searchInput: Locator;
    readonly emptyState: Locator;

    constructor(private readonly page: Page) {
        this.heading = page.getByRole('heading', { name: 'Médiathèque', level: 1 });
        this.uploadButton = page.getByRole('button', { name: /Téléverser/ });
        this.searchInput = page.getByLabel('Rechercher dans les médias');
        this.emptyState = page.getByText('Aucun média');
    }

    async goto(): Promise<void> {
        await this.page.goto('/admin/media/library');
        // Retry up to 2 times if server-side error page appears
        for (let i = 0; i < 2; i++) {
            const errorHeading = this.page.getByRole('heading', { name: 'Une erreur est survenue' });
            if (await errorHeading.isVisible({ timeout: 3_000 }).catch(() => false)) {
                await this.page.waitForTimeout(1_000);
                await this.page.goto('/admin/media/library');
            } else {
                break;
            }
        }
    }

    async expectLoaded(): Promise<void> {
        await expect(this.heading).toBeVisible({ timeout: 15_000 });
    }

    async clickUpload(): Promise<void> {
        await this.uploadButton.click();
    }

    async fillUploadDialog(filePath: string): Promise<void> {
        const dialog = this.page.getByRole('dialog');
        await expect(dialog.getByText('Téléverser un fichier')).toBeVisible();
        const fileInput = dialog.locator('input[type="file"]');
        await fileInput.setInputFiles(filePath);
    }

    async submitUpload(): Promise<void> {
        const dialog = this.page.getByRole('dialog');
        await dialog.getByRole('button', { name: 'Téléverser' }).click();
    }

    async expectUploadToast(): Promise<void> {
        await expect(this.page.getByText('Image téléversée')).toBeVisible();
    }

    async expectUploadTooLargeToast(): Promise<void> {
        await expect(this.page.getByText('Fichier trop volumineux')).toBeVisible();
    }

    async expectFormatNotSupportedToast(): Promise<void> {
        await expect(this.page.getByText('Format non supporté')).toBeVisible();
    }

    async search(query: string): Promise<void> {
        await this.searchInput.fill(query);
    }

    async expectMediaCardVisible(altText: string): Promise<void> {
        await expect(this.page.getByAltText(altText)).toBeVisible();
    }

    async selectMedia(altText: string): Promise<void> {
        await this.page.getByAltText(altText).click();
    }

    async expectDetailsPanel(): Promise<void> {
        await expect(
            this.page.getByRole('heading', { name: 'Détails du média' }),
        ).toBeVisible();
    }

    async enterSelectionMode(): Promise<void> {
        await this.page
            .getByRole('button', { name: /Sélectionner|Mode sélection/ })
            .click();
    }

    async bulkDelete(): Promise<void> {
        await this.page
            .getByRole('button', { name: /Supprimer.*sélectionné/ })
            .click();
    }

    async confirmBulkDelete(): Promise<void> {
        const dialog = this.page.getByRole('dialog');
        await expect(dialog.getByText('Confirmer la suppression')).toBeVisible();
        await dialog.getByRole('button', { name: 'Supprimer' }).click();
    }

    async expectBulkDeleteToast(count: number): Promise<void> {
        await expect(
            this.page.getByText(`${count} média(s) supprimé(s)`),
        ).toBeVisible();
    }

    async filterByFolder(folderName: string): Promise<void> {
        await this.page.getByText('Tous les dossiers').click();
        await this.page.getByRole('option', { name: folderName }).click();
    }

    async filterByTag(tagName: string): Promise<void> {
        await this.page.getByText('Tous les tags').click();
        await this.page.getByRole('option', { name: tagName }).click();
    }
}

export class AdminMediaTagsPage {
    readonly heading: Locator;
    readonly createButton: Locator;
    readonly emptyState: Locator;

    constructor(private readonly page: Page) {
        this.heading = page.getByRole('heading', { name: 'Tags Media', level: 1 });
        this.createButton = page.getByRole('button', { name: /Créer un tag/ });
        this.emptyState = page.getByText('Aucun tag');
    }

    async goto(): Promise<void> {
        await this.page.goto('/admin/media/tags');
    }

    async expectLoaded(): Promise<void> {
        await expect(this.heading).toBeVisible();
    }

    async clickCreate(): Promise<void> {
        await this.createButton.click();
    }

    async fillTagForm(name: string): Promise<void> {
        const dialog = this.page.getByRole('dialog');
        await dialog.getByLabel('Nom').fill(name);
    }

    async submitTagForm(): Promise<void> {
        const dialog = this.page.getByRole('dialog');
        await dialog.getByRole('button', { name: /Créer|Mettre à jour/ }).click();
    }

    async clickEditTag(name: string): Promise<void> {
        await this.page
            .getByRole('button', { name: `Éditer ${name}` })
            .click();
    }

    async clickDeleteTag(name: string): Promise<void> {
        await this.page
            .getByRole('button', { name: `Supprimer ${name}` })
            .click();
    }

    async confirmDelete(): Promise<void> {
        const dialog = this.page.getByRole('alertdialog');
        await dialog.getByRole('button', { name: 'Supprimer' }).click();
    }

    async expectTagCreateToast(): Promise<void> {
        await expect(this.page.getByText('Tag créé')).toBeVisible();
    }

    async expectTagDeleteToast(): Promise<void> {
        await expect(this.page.getByText('Tag supprimé')).toBeVisible();
    }

    async expectTagVisible(name: string): Promise<void> {
        await expect(this.page.getByText(name).first()).toBeVisible();
    }
}

export class AdminMediaFoldersPage {
    readonly heading: Locator;
    readonly createButton: Locator;
    readonly emptyState: Locator;

    constructor(private readonly page: Page) {
        this.heading = page.getByRole('heading', {
            name: 'Dossiers Media',
            level: 1,
        });
        this.createButton = page.getByRole('button', {
            name: /Créer un dossier/,
        });
        this.emptyState = page.getByText('Aucun dossier');
    }

    async goto(): Promise<void> {
        await this.page.goto('/admin/media/folders');
    }

    async expectLoaded(): Promise<void> {
        await expect(this.heading).toBeVisible();
    }

    async clickCreate(): Promise<void> {
        await this.createButton.click();
    }

    async fillFolderForm(name: string): Promise<void> {
        const dialog = this.page.getByRole('dialog');
        await dialog.getByLabel('Nom').fill(name);
    }

    async submitFolderForm(): Promise<void> {
        const dialog = this.page.getByRole('dialog');
        await dialog.getByRole('button', { name: /Créer|Mettre à jour/ }).click();
    }

    async clickEditFolder(name: string): Promise<void> {
        await this.page
            .getByRole('button', { name: `Éditer ${name}` })
            .click();
    }

    async clickDeleteFolder(name: string): Promise<void> {
        await this.page
            .getByRole('button', { name: `Supprimer ${name}` })
            .click();
    }

    async confirmDelete(): Promise<void> {
        const dialog = this.page.getByRole('alertdialog');
        await dialog.getByRole('button', { name: 'Supprimer' }).click();
    }

    async expectFolderCreateToast(): Promise<void> {
        await expect(this.page.getByText('Dossier créé')).toBeVisible();
    }

    async expectFolderDeleteToast(): Promise<void> {
        await expect(this.page.getByText('Dossier supprimé')).toBeVisible();
    }

    async expectFolderVisible(name: string): Promise<void> {
        await expect(this.page.getByText(name).first()).toBeVisible();
    }
}
