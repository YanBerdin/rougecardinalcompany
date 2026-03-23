// spec: specs/PLAN_DE_TEST_COMPLET.md — Section 20: Admin — Analytics

import { test, expect } from './analytics.fixtures';

test.describe('Admin — Analytics', () => {
    // --- P0 ---

    test('ADM-ANALYTICS-001 — La page charge sans erreur', async ({ analyticsPage, page }) => {
        // 1. Naviguer vers /admin/analytics (fait par la fixture via goto + networkidle)
        // 2. Vérifier : pas d'error boundary, heading visible, body non vide
        await analyticsPage.expectLoaded();

        // Le contenu principal contient du contenu visible
        await expect(page.locator('#main-content')).not.toBeEmpty();
    });

    // --- P2 ---

    test('ADM-ANALYTICS-002 — Contenu affiché si données présentes', async ({ analyticsPage }) => {
        // 1. Naviguer vers /admin/analytics (fait par la fixture)
        // 2. Attendre networkidle (fait par la fixture)
        await analyticsPage.expectLoaded();

        // Vérifie qu'au moins un graphique ou une statistique est visible,
        // ou que l'état vide s'affiche gracieusement (sans crash ni spinner infini)
        await analyticsPage.expectContentVisible();
    });

    test('ADM-ANALYTICS-003 — État vide gracieux', async ({ analyticsPage }) => {
        // 1. Naviguer vers /admin/analytics (fait par la fixture)

        // 2. Tenter de sélectionner une période sans données (ex. période future)
        await analyticsPage.selectFuturePeriod();

        // Résultat attendu :
        // - Un état vide informatif s'affiche (texte ou illustration)
        // - Pas de crash, pas de page blanche
        // - Le body contient du contenu visible
        await analyticsPage.expectEmptyState();
    });
});
