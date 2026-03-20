import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class AdminDashboardPage {
    readonly heading: Locator;
    readonly sidebar: Locator;
    readonly backToSiteLink: Locator;

    constructor(private readonly page: Page) {
        this.heading = page.getByRole('heading', { name: 'Tableau de bord' });
        this.sidebar = page.locator('nav[aria-label="Navigation admin"]').or(
            page.locator('[data-testid="admin-sidebar"]'),
        );
        this.backToSiteLink = page.getByRole('link', { name: /Retour au site publique/i });
    }

    async goto(): Promise<void> {
        await this.page.goto(`/admin?_t=${Date.now()}`);
    }

    async expectLoaded(): Promise<void> {
        await expect(this.heading).toBeVisible();
        await this.expandSidebar();
    }

    /** Expand the sidebar if it is currently collapsed. */
    async expandSidebar(): Promise<void> {
        const sidebar = this.page.locator('[data-sidebar="sidebar"]').first();
        await sidebar.waitFor({ timeout: 5_000 });
        const state = await sidebar.getAttribute('data-state');
        if (state !== 'expanded') {
            await this.page.locator('[data-sidebar="trigger"]').first().click();
            await this.page.waitForTimeout(400); // sidebar animation
        }
    }

    async expectStatCardsVisible(): Promise<void> {
        // StatsCard renders <Link aria-label="Voir les statistiques : …"><Card>…</Card></Link>
        const cards = this.page.locator('a[aria-label*="statistiques"]');
        await expect(cards.first()).toBeVisible();
    }

    async clickBackToSite(): Promise<void> {
        await this.backToSiteLink.click();
        await this.page.waitForURL('/');
    }

    getSidebarLink(name: string | RegExp): Locator {
        return this.page.locator('[data-sidebar="sidebar"]').first().getByRole('link', { name });
    }
}
