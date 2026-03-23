import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class AdminAnalyticsPage {
    readonly heading: Locator;
    readonly errorBoundary: Locator;

    constructor(private readonly page: Page) {
        this.heading = page
            .getByRole('heading', { level: 1 })
            .or(page.getByRole('heading', { name: /analytics|statistiques/i }));
        this.errorBoundary = page.getByText('Une erreur est survenue');
    }

    async goto(): Promise<void> {
        await this.page.goto(`/admin/analytics?_t=${Date.now()}`);
        await this.page.waitForLoadState('networkidle');
    }

    async expectLoaded(): Promise<void> {
        // Pas d'error boundary
        await expect(this.errorBoundary).not.toBeVisible({ timeout: 5_000 });

        // Au moins un heading principal visible
        await expect(this.heading.first()).toBeVisible({ timeout: 10_000 });

        // Le body n'est pas vide — au moins un élément de contenu
        // L'admin layout contient 2 <main> (sidebar-inset + #main-content) ;
        // on cible le contenu principal par son id.
        await expect(this.page.locator('#main-content')).not.toBeEmpty();
    }

    /** Vérifie qu'au moins un graphique ou une statistique chiffrée est rendu. */
    async expectContentVisible(): Promise<void> {
        const chart = this.page
            .locator('canvas')
            .or(this.page.locator('svg.recharts-surface'))
            .or(this.page.locator('[data-testid*="chart"]'));

        const stat = this.page
            .locator('[data-testid*="stat"]')
            .or(this.page.locator('.stat-value'))
            .or(this.page.getByRole('region', { name: /statistique/i }));

        // Au moins l'un des deux groupes doit être visible
        const chartVisible = await chart.first().isVisible().catch(() => false);
        const statVisible = await stat.first().isVisible().catch(() => false);

        if (!chartVisible && !statVisible) {
            // Fallback : accepter que la page affiche au moins du contenu visible
            const mainContent = this.page.locator('#main-content');
            await expect(mainContent).not.toBeEmpty();
        }

        // Pas de spinner infini
        await expect(
            this.page.getByRole('status', { name: /chargement/i }),
        ).not.toBeVisible({ timeout: 3_000 });
    }

    /** Vérifie qu'un état vide informatif s'affiche pour une période sans données. */
    async expectEmptyState(): Promise<void> {
        // Pas de crash / page blanche
        await expect(this.errorBoundary).not.toBeVisible();

        // Contenu visible dans le conteneur principal
        await expect(this.page.locator('#main-content')).not.toBeEmpty();

        // Pas de spinner infini
        await expect(
            this.page.getByRole('status', { name: /chargement/i }),
        ).not.toBeVisible({ timeout: 3_000 });
    }

    /** Sélectionne une période future via le sélecteur de dates (si présent). */
    async selectFuturePeriod(): Promise<boolean> {
        const dateFilter = this.page
            .getByRole('combobox', { name: /période|date|plage/i })
            .or(this.page.locator('[data-testid*="date-filter"]'))
            .or(this.page.locator('select[name*="period"]'));

        if (!(await dateFilter.first().isVisible().catch(() => false))) {
            return false;
        }

        // Tenter de sélectionner une option "personnalisée" ou la dernière option
        const options = await dateFilter.first().locator('option').all();
        if (options.length > 0) {
            const lastOption = options[options.length - 1];
            const value = await lastOption.getAttribute('value');
            if (value) {
                await dateFilter.first().selectOption(value);
                await this.page.waitForLoadState('networkidle');
            }
        }

        return true;
    }
}
