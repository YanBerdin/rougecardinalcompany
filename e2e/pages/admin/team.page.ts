import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class AdminTeamPage {
    readonly heading: Locator;
    readonly addMemberLink: Locator;
    readonly showInactiveToggle: Locator;
    readonly emptyState: Locator;
    readonly memberGrid: Locator;

    constructor(private readonly page: Page) {
        this.heading = page.getByRole('heading', { name: "Gestion de l'équipe" });
        this.addMemberLink = page.getByRole('link', { name: /Ajouter un membre/i });
        this.showInactiveToggle = page.getByRole('switch', { name: /Afficher.*inacti/i }).or(
            page.getByText(/Afficher.*inacti/i),
        );
        this.emptyState = page.getByText('Aucun membre trouvé');
        this.memberGrid = page.locator('.grid').first();
    }

    async goto(): Promise<void> {
        await this.page.goto(`/admin/team?_t=${Date.now()}`);
    }

    async expectLoaded(): Promise<void> {
        await expect(this.heading).toBeVisible();
    }

    async clickAddMember(): Promise<void> {
        await this.addMemberLink.click();
        await this.page.waitForURL('**/admin/team/new');
    }

    async fillTeamMemberForm(data: { name: string; role?: string; description?: string }): Promise<void> {
        await this.page.getByLabel(/Nom \*/i).fill(data.name);
        if (data.role) {
            await this.page.getByLabel(/Rôle/i).fill(data.role);
        }
        if (data.description) {
            await this.page.getByLabel(/Description/i).fill(data.description);
        }
    }

    async submitTeamMemberForm(): Promise<void> {
        await this.page.getByRole('button', { name: /Créer|Sauvegarder|Enregistrer/i }).click();
    }

    getMemberCard(name: string): Locator {
        return this.page.locator('[class*="card"]').filter({ hasText: name });
    }

    async clickMemberAction(name: string, action: 'Modifier' | 'Désactiver' | 'Réactiver' | 'Supprimer'): Promise<void> {
        const card = this.getMemberCard(name);
        await card.getByRole('button', { name: action }).click();
    }

    async confirmDialog(action: 'Désactiver' | 'Réactiver' | 'Supprimer'): Promise<void> {
        const dialog = this.page.getByRole('alertdialog').or(this.page.getByRole('dialog'));
        await dialog.getByRole('button', { name: action }).click();
    }

    async toggleShowInactive(): Promise<void> {
        const switchEl = this.page.getByRole('switch').first();
        await switchEl.click();
    }

    async expectMemberVisible(name: string): Promise<void> {
        await expect(this.getMemberCard(name)).toBeVisible();
    }

    async expectMemberNotVisible(name: string): Promise<void> {
        await expect(this.getMemberCard(name)).not.toBeVisible();
    }

    async expectMemberInactive(name: string): Promise<void> {
        const card = this.getMemberCard(name);
        await expect(card).toBeVisible();
        await expect(card.getByRole('button', { name: 'Réactiver' })).toBeVisible({ timeout: 10_000 });
    }

    async editMember(name: string): Promise<void> {
        const card = this.getMemberCard(name);
        await card.getByRole('button', { name: 'Modifier' }).click();
        await this.page.waitForURL('**/edit');
    }
}
