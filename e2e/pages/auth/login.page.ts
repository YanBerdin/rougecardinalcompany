import type { Locator, Page } from '@playwright/test';

export class LoginPage {
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly submitButton: Locator;
    readonly signUpLink: Locator;
    readonly forgotPasswordLink: Locator;
    readonly errorMessage: Locator;

    constructor(readonly page: Page) {
        this.emailInput = page.getByLabel('Email');
        this.passwordInput = page.getByLabel('Password');
        this.submitButton = page.getByRole('button', { name: /login/i });
        this.signUpLink = page.getByRole('link', { name: /sign up/i });
        this.forgotPasswordLink = page.getByRole('link', {
            name: /forgot your password/i,
        });
        this.errorMessage = page.locator('#form-error[role="alert"]');
    }

    async goto(): Promise<void> {
        await this.page.goto('/auth/login', {
            waitUntil: 'networkidle',
        });
        await this.submitButton.waitFor({ state: 'visible' });
    }

    async login(email: string, password: string): Promise<void> {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.submitButton.click();
    }
}
