import type { Locator, Page } from '@playwright/test';

export class SignupPage {
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly repeatPasswordInput: Locator;
    readonly submitButton: Locator;
    readonly loginLink: Locator;
    readonly errorMessage: Locator;

    constructor(readonly page: Page) {
        this.emailInput = page.getByLabel('Email');
        this.passwordInput = page.getByLabel('Password', { exact: true });
        this.repeatPasswordInput = page.getByLabel('Repeat Password');
        this.submitButton = page.getByRole('button', { name: /sign up/i });
        this.loginLink = page.getByRole('link', { name: /login/i });
        this.errorMessage = page.locator('.text-red-500');
    }

    async goto(): Promise<void> {
        await this.page.goto('/auth/sign-up', {
            waitUntil: 'networkidle',
        });
        await this.submitButton.waitFor({ state: 'visible' });
    }

    async fillForm(
        email: string,
        password: string,
        repeatPassword: string,
    ): Promise<void> {
        await this.emailInput.click();
        await this.emailInput.fill(email);
        await this.passwordInput.click();
        await this.passwordInput.fill(password);
        await this.repeatPasswordInput.click();
        await this.repeatPasswordInput.fill(repeatPassword);
    }
}
