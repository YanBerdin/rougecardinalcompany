import type { Locator, Page } from '@playwright/test';

/**
 * Page Object Model pour /auth/setup-account.
 *
 * Le flux attendu :
 *   1. Naviguer vers le lien d'invitation (qui redirige vers setup-account
 *      avec `#access_token=...&refresh_token=...&type=invite`).
 *   2. Le `useEffect` de la page consomme le hash et établit la session.
 *   3. Le formulaire `SetupAccountForm` s'affiche.
 */
export class SetupAccountPage {
    readonly heading: Locator;
    readonly passwordInput: Locator;
    readonly confirmPasswordInput: Locator;
    readonly submitButton: Locator;
    readonly errorContainer: Locator;

    constructor(readonly page: Page) {
        this.heading = page.getByRole('heading', { name: /activer votre compte/i });
        this.passwordInput = page.getByLabel('Mot de passe', { exact: true });
        this.confirmPasswordInput = page.getByLabel('Confirmer le mot de passe');
        this.submitButton = page.getByRole('button', { name: /finaliser l'inscription/i });
        this.errorContainer = page.locator('.bg-destructive\\/10');
    }

    /**
     * Suit le lien d'invitation puis attend l'apparition du formulaire.
     */
    async openInviteLink(inviteLink: string): Promise<void> {
        await this.page.goto(inviteLink, { waitUntil: 'networkidle' });
        await this.heading.waitFor({ state: 'visible' });
        await this.submitButton.waitFor({ state: 'visible' });
    }

    async fillPassword(password: string, confirmation = password): Promise<void> {
        await this.passwordInput.click();
        await this.passwordInput.fill(password);
        await this.confirmPasswordInput.click();
        await this.confirmPasswordInput.fill(confirmation);
    }

    async submit(): Promise<void> {
        await this.submitButton.click();
    }
}
