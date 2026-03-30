import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class HomePage {
    readonly heroCarousel: Locator;
    readonly navHeader: Locator;
    readonly showsSection: Locator;
    readonly newsSection: Locator;
    readonly newsletterSection: Locator;
    readonly newsletterEmailInput: Locator;
    readonly newsletterSubmitButton: Locator;
    readonly newsletterError: Locator;
    readonly newsletterSuccess: Locator;

    constructor(private readonly page: Page) {
        this.heroCarousel = page.getByRole('region', {
            name: 'Diaporama des spectacles à l\'affiche',
        });
        this.navHeader = page.getByRole('navigation');
        this.showsSection = page.locator('[aria-labelledby="shows-heading"]');
        this.newsSection = page.locator('[aria-labelledby="news-heading"]');
        this.newsletterSection = page.locator(
            '[aria-labelledby="newsletter-heading"]',
        );
        this.newsletterEmailInput = page.locator('#email-address');
        this.newsletterSubmitButton = page.getByRole('button', {
            name: "S'inscrire",
        });
        this.newsletterError = this.newsletterSection.locator('[role="alert"]');
        this.newsletterSuccess = page.getByText('Merci pour votre inscription !');
    }

    async goto(): Promise<void> {
        await this.page.goto('/', { waitUntil: 'networkidle' });
    }

    async expectLoaded(): Promise<void> {
        await expect(this.heroCarousel).toBeVisible();
    }

    async expectNavLinks(): Promise<void> {
        const links = [
            'Accueil',
            'La Compagnie',
            'Spectacles',
            'Agenda',
            'Presse',
            'Contact',
        ];
        for (const name of links) {
            await expect(this.navHeader.getByRole('link', { name })).toBeVisible();
        }
    }

    async subscribeNewsletter(email: string): Promise<void> {
        await this.newsletterEmailInput.fill(email);
        await this.newsletterSubmitButton.click();
    }

    async expectNewsletterError(message: string): Promise<void> {
        await expect(this.newsletterError).toContainText(message);
    }

    async expectNewsletterSuccess(): Promise<void> {
        await expect(this.newsletterSuccess).toBeVisible();
    }
}
