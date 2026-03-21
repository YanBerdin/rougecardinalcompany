// spec: specs/PLAN_DE_TEST_COMPLET.md — Section 21.3 Thème dark/light
// Cas couverts : CROSS-THEME-001, CROSS-THEME-002
// Prérequis : ThemeSwitcher avec button[title="Theme"] + role=menuitemradio

import { test, expect } from './theme-public.fixtures';

test.describe('Thème dark/light — Site public', () => {
    // CROSS-THEME-001 — Basculer thème clair → sombre
    test('CROSS-THEME-001 — Basculer vers le thème sombre via ThemeSwitcher', async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });

        // 1. Ouvrir le dropdown ThemeSwitcher (button avec title="Theme")
        const themeSwitcherButton = page.getByRole('button', { name: /theme/i });
        await expect(themeSwitcherButton).toBeVisible();
        await themeSwitcherButton.click();

        // 2. Sélectionner le thème sombre
        const darkOption = page.getByRole('menuitemradio', { name: /dark|sombre/i });
        await expect(darkOption).toBeVisible();
        await darkOption.click();

        // 3. Vérifier que la classe "dark" est sur <html>
        await expect(page.locator('html')).toHaveClass(/dark/);
    });

    // CROSS-THEME-002 — Persistance du thème après rechargement
    test('CROSS-THEME-002 — Persistance du thème sombre après rechargement de la page', async ({
        page,
    }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });

        // 1. Activer le thème sombre
        const themeSwitcherButton = page.getByRole('button', { name: /theme/i });
        await themeSwitcherButton.click();
        const darkOption = page.getByRole('menuitemradio', { name: /dark|sombre/i });
        await darkOption.click();
        await expect(page.locator('html')).toHaveClass(/dark/);

        // 2. Recharger la page
        await page.reload({ waitUntil: 'domcontentloaded' });

        // 3. Le thème sombre doit être préservé (next-themes stocke en localStorage)
        await expect(page.locator('html')).toHaveClass(/dark/);
    });
});
