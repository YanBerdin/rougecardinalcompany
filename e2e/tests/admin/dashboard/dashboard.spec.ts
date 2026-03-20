// spec: specs/PLAN_DE_TEST_COMPLET.md — Section 7: Dashboard Admin

import { test, expect } from './dashboard.fixtures';

test.describe('Dashboard Admin', () => {
    // --- P0 ---

    test('ADM-DASH-001 — Chargement du dashboard', async ({ dashboardPage }) => {
        // 1. Naviguer vers /admin (fait par la fixture)
        await dashboardPage.expectLoaded();

        // 2. Le tableau de bord s'affiche avec statistiques (cartes récapitulatives)
        await dashboardPage.expectStatCardsVisible();
    });

    test('ADM-DASH-002 — Navigation sidebar', async ({ dashboardPage }) => {
        // 1. Vérifier tous les liens du sidebar
        await dashboardPage.expectLoaded();

        await expect(dashboardPage.getSidebarLink('Tableau de bord')).toBeVisible();
        await expect(dashboardPage.getSidebarLink('Équipe')).toBeVisible();
        await expect(dashboardPage.getSidebarLink('Spectacles')).toBeVisible();
        await expect(dashboardPage.getSidebarLink('Agenda')).toBeVisible();
        await expect(dashboardPage.getSidebarLink('Lieux')).toBeVisible();
        await expect(dashboardPage.getSidebarLink('Presse')).toBeVisible();
        await expect(dashboardPage.getSidebarLink('Médiathèque')).toBeVisible();
        await expect(dashboardPage.getSidebarLink('Audit Logs')).toBeVisible();
    });

    // --- P1 ---

    test('ADM-DASH-003 — Lien "Retour au site publique"', async ({ dashboardPage, page }) => {
        // 1. Cliquer sur "Retour au site publique"
        await dashboardPage.expectLoaded();
        await dashboardPage.clickBackToSite();

        // 2. Redirection vers / (page publique)
        await expect(page).toHaveURL('/');
    });
});
