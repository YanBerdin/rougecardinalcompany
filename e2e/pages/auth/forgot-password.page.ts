import type { Locator, Page } from '@playwright/test';

export class ForgotPasswordPage {
    readonly emailInput: Locator;
    readonly submitButton: Locator;
    readonly successCard: Locator;
    readonly errorMessage: Locator;

    constructor(readonly page: Page) {
        this.emailInput = page.getByLabel('Email');
        this.submitButton = page.getByRole('button', {
            name: /send reset email/i,
        });
        this.successCard = page.getByText('Check Your Email');
        this.errorMessage = page.locator('.text-red-500');
    }

    async goto(): Promise<void> {
        await this.page.goto('/auth/forgot-password', {
            waitUntil: 'networkidle',
        });
        await this.submitButton.waitFor({ state: 'visible' });
    }
}
