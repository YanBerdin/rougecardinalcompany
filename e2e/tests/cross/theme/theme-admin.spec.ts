// spec: specs/PLAN_DE_TEST_COMPLET.md — Section 21.3 Thème dark/light (admin)
// Cas couverts : CROSS-THEME-003
// Pré-requis : storageState admin (projet cross-admin dans playwright.config.ts)

import { test, expect } from './theme-admin.fixtures';

test.describe('Thème dark/light — Admin', () => {
    // CROSS-THEME-003 — Interface admin lisible en thème sombre
    test('CROSS-THEME-003 — Interface admin lisible et fonctionnelle en thème sombre', async ({
        page,
    }) => {
        await page.goto('/admin', { waitUntil: 'domcontentloaded' });

        // 1. Le tableau de bord est chargé
        await expect(page.getByRole('heading', { name: 'Tableau de bord' })).toBeVisible();

        // 2. Ouvrir le ThemeSwitcher dans le header admin
        const themeSwitcherButton = page.getByRole('button', { name: /theme/i });
        await expect(themeSwitcherButton).toBeVisible();
        await themeSwitcherButton.click();

        // 3. Sélectionner le thème sombre
        const darkOption = page.getByRole('menuitemradio', { name: /dark|sombre/i });
        await expect(darkOption).toBeVisible();
        await darkOption.click();

        // 4. Le thème sombre est actif (<html class="dark">)
        await expect(page.locator('html')).toHaveClass(/dark/);

        // 5. Les éléments principaux de l'admin restent visibles et lisibles
        await expect(page.getByRole('heading', { name: 'Tableau de bord' })).toBeVisible();

        // 6. La sidebar est toujours présente
        const sidebar = page.locator('[data-sidebar="sidebar"]').first();
        await expect(sidebar).toBeVisible();

        // 7. Le contenu principal est accessible (#main-content)
        // Utiliser #main-content au lieu de getByRole('main') car l'admin a 2 éléments <main>
        await expect(page.locator('#main-content')).toBeVisible();
    });
});
