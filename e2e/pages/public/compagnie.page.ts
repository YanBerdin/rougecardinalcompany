import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class CompagniePage {
    readonly heroHeading: Locator;

    constructor(private readonly page: Page) {
        this.heroHeading = page.locator('#heading-hero');
    }

    async goto(): Promise<void> {
        await this.page.goto('/compagnie', { waitUntil: 'networkidle' });
    }

    async expectLoaded(): Promise<void> {
        await expect(this.page).toHaveURL(/\/compagnie\/?$/);
        await expect(this.page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 15_000 });
    }

    async expectSections(): Promise<void> {
        const sectionIds = [
            'heading-hero',
            'heading-history',
            'heading-team',
        ];
        for (const id of sectionIds) {
            const section = this.page.locator(`#${id}`);
            if (await section.isVisible()) {
                await expect(section).toBeVisible();
            }
        }
    }

    /**
     * Click the "Voir le profil de …" button on a team member card.
     * Only available when the member has a non-null description.
     */
    async openMemberModal(memberName: string): Promise<void> {
        await this.page
            .getByRole('button', { name: `Voir le profil de ${memberName}` })
            .click();
    }

    /**
     * Assert that the member modal is open and displays the expected content.
     */
    async expectMemberModalVisible(name: string, bio: string): Promise<void> {
        const dialog = this.page.getByRole('dialog');
        await expect(dialog).toBeVisible({ timeout: 5_000 });
        await expect(dialog.getByRole('heading', { name })).toBeVisible();
        await expect(dialog.getByText(bio, { exact: false })).toBeVisible();
    }

    /**
     * Close the currently open member modal via the Escape key.
     */
    async closeMemberModal(): Promise<void> {
        await this.page.keyboard.press('Escape');
        await expect(this.page.getByRole('dialog')).not.toBeVisible({ timeout: 3_000 });
    }
}
