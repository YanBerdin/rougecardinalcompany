import { test, expect } from '../home/home.fixtures';

test.describe('Page Accueil — Tests publics P0', () => {
    // PUB-HOME-001 : La page d'accueil charge et affiche le héro carousel
    test('PUB-HOME-001 — La page charge et affiche le hero carousel', async ({
        homePage,
    }) => {
        // 1. Vérifier que la page est chargée
        await homePage.expectLoaded();

        // 2. Vérifier que le hero carousel est visible
        await expect(homePage.heroCarousel).toBeVisible();
    });

    // PUB-HOME-009 : Le header de navigation affiche tous les liens
    test('PUB-HOME-009 — Le header de navigation contient tous les liens', async ({
        homePage,
    }) => {
        // 1. Vérifier que le header de navigation est visible
        await expect(homePage.navHeader).toBeVisible();

        // 2. Vérifier que les 6 liens de navigation sont présents
        await homePage.expectNavLinks();
    });
});
