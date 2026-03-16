import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class ContactPage {
    readonly formHeading: Locator;
    readonly firstNameInput: Locator;
    readonly lastNameInput: Locator;
    readonly emailInput: Locator;
    readonly phoneInput: Locator;
    readonly reasonTrigger: Locator;
    readonly messageInput: Locator;
    readonly consentCheckbox: Locator;
    readonly submitButton: Locator;
    readonly successHeading: Locator;
    readonly sendAnotherButton: Locator;
    readonly coordinatesCard: Locator;
    readonly contactsCard: Locator;
    readonly newsletterInput: Locator;
    readonly newsletterButton: Locator;

    constructor(private readonly page: Page) {
        this.formHeading = page.getByRole('heading', {
            name: 'Contact',
            level: 1,
        });
        this.firstNameInput = page.locator('#firstName');
        this.lastNameInput = page.locator('#lastName');
        this.emailInput = page.locator('#email');
        this.phoneInput = page.locator('#phone');
        this.reasonTrigger = page.getByRole('combobox', {
            name: 'Motif de votre demande',
        });
        this.messageInput = page.locator('#message');
        this.consentCheckbox = page.locator('#consent');
        this.submitButton = page.getByRole('button', {
            name: 'Envoyer le message',
        });
        this.successHeading = page.getByRole('heading', {
            name: 'Message Envoyé !',
        });
        this.sendAnotherButton = page.getByRole('button', {
            name: 'Envoyer un autre message',
        });
        this.coordinatesCard = page.getByText('Nos Coordonnées');
        this.contactsCard = page.getByText('Contacts Spécialisés');
        this.newsletterInput = page.getByRole('textbox', {
            name: 'Adresse email pour la newsletter',
        });
        this.newsletterButton = page
            .locator('div')
            .filter({ hasText: 'Newsletter' })
            .filter({ has: page.getByRole('textbox', { name: 'Adresse email pour la newsletter' }) })
            .getByRole('button', { name: "S'inscrire" });
    }

    async goto(): Promise<void> {
        await this.page.goto('/contact');
    }

    async expectLoaded(): Promise<void> {
        await expect(this.formHeading).toBeVisible();
    }

    async expectSidebarVisible(): Promise<void> {
        await expect(this.coordinatesCard).toBeVisible();
        await expect(this.contactsCard).toBeVisible();
    }

    async fillValidForm(overrides?: {
        firstName?: string;
        lastName?: string;
        email?: string;
        phone?: string;
        reason?: string;
        message?: string;
    }): Promise<void> {
        const data = {
            firstName: 'Jean',
            lastName: 'Dupont',
            email: `e2e-${Date.now()}@example.com`,
            phone: '0612345678',
            reason: 'Autre',
            message: 'Ceci est un message de test pour le formulaire de contact.',
            ...overrides,
        };

        await this.firstNameInput.fill(data.firstName);
        await this.lastNameInput.fill(data.lastName);
        await this.emailInput.fill(data.email);
        await this.phoneInput.fill(data.phone);
        await this.selectReason(data.reason);
        await this.messageInput.fill(data.message);
        await this.consentCheckbox.click();
    }

    async selectReason(label: string): Promise<void> {
        await this.reasonTrigger.click();
        await this.page.getByRole('option', { name: label }).click();
    }

    async submit(): Promise<void> {
        await expect(this.submitButton).toBeEnabled({ timeout: 5_000 });
        await this.submitButton.click();
    }

    async expectSuccess(): Promise<void> {
        await expect(this.successHeading).toBeVisible({ timeout: 15_000 });
    }

    async expectValidationError(message: string): Promise<void> {
        const alert = this.page.locator('[role="alert"]').filter({ hasText: message });
        await expect(alert).toBeVisible({ timeout: 80_000 });
    }
}
