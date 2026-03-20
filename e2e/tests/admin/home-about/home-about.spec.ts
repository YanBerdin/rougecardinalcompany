// spec: specs/PLAN_DE_TEST_COMPLET.md — Section 16: About / Chiffres clés

import { test, expect } from './home-about.fixtures';
import { CompagnieStatFactory } from '@/e2e/factories';

const STAT_LABEL = '[TEST] Spectacles E2E';
const STAT_VALUE = '99+';

test.describe('About — Chiffres Clés', () => {
    test.afterEach(async () => {
        await CompagnieStatFactory.cleanup();
    });

    // --- P0 ---

    test('ADM-ABOUT-001 — Liste des statistiques', async ({ homeAboutPage }) => {
        // 1. Naviguer vers /admin/home/about (fait par la fixture)
        await homeAboutPage.expectLoaded();

        // 2. Les statistiques s'affichent dans la liste
        await expect(homeAboutPage.addStatButton).toBeVisible();
    });

    test('ADM-ABOUT-002 — Ajouter une statistique', async ({ homeAboutPage, page }) => {
        // 1. Cliquer "Ajouter une statistique"
        await homeAboutPage.clickAddStat();

        // 2. Remplir label et valeur
        await homeAboutPage.fillStatForm({ label: STAT_LABEL, value: STAT_VALUE });

        // 3. Sauvegarder
        await homeAboutPage.submitStatForm();

        // 4. La statistique apparaît dans la liste
        await expect(page.getByText(/succès|créé/i).first()).toBeVisible({ timeout: 5_000 });
        await homeAboutPage.goto();
        await homeAboutPage.expectStatVisible(STAT_LABEL);
    });

    test('ADM-ABOUT-003 — Modifier une statistique', async ({ homeAboutPage, page }) => {
        // Setup : créer une stat via factory
        const stat = await CompagnieStatFactory.create({ label: STAT_LABEL, value: STAT_VALUE });
        await homeAboutPage.goto();

        // 1. Cliquer "Modifier"
        await homeAboutPage.clickEditStat(stat.label);

        // 2. Changer la valeur
        const updatedValue = '150+';
        await homeAboutPage.fillStatForm({ label: STAT_LABEL, value: updatedValue });

        // 3. Sauvegarder
        await homeAboutPage.submitStatForm();

        // 4. La valeur est mise à jour
        await expect(page.getByText(/succès|mise? à jour/i).first()).toBeVisible({ timeout: 5_000 });
        await homeAboutPage.goto();
        await expect(page.getByText(updatedValue).first()).toBeVisible();
    });

    test('ADM-ABOUT-004 — Supprimer une statistique', async ({ homeAboutPage }) => {
        // Setup : créer une stat via factory
        const stat = await CompagnieStatFactory.create({ label: STAT_LABEL, value: STAT_VALUE });
        await homeAboutPage.goto();

        // 1. Cliquer "Supprimer"
        await homeAboutPage.clickDeleteStat(stat.label);

        // 2. Confirmer la suppression
        await homeAboutPage.confirmDeleteStat();

        // 3. La statistique disparaît
        await homeAboutPage.expectStatNotVisible(STAT_LABEL);
    });

    // --- P1 ---

    test('ADM-ABOUT-005 — Impact public — Chiffres visibles', async ({ homeAboutPage, page }) => {
        // Setup : créer une stat active via factory
        await CompagnieStatFactory.create({ label: STAT_LABEL, value: STAT_VALUE, active: true });

        // 1. Naviguer vers / et scroller à la section chiffres
        await page.goto('/');
        await page.waitForLoadState('load');

        // 2. Les statistiques modifiées apparaissent sur la page publique
        await expect(page.getByText(STAT_VALUE).first()).toBeVisible({ timeout: 10_000 });
    });
});
