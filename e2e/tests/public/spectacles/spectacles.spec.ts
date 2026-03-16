import { test, expect } from '../spectacles/spectacles.fixtures';

test.describe('Page Spectacles — Tests publics P0', () => {
    // PUB-SPEC-001 : La grille de spectacles charge avec des cartes visibles
    test('PUB-SPEC-001 — La grille de spectacles affiche les cartes', async ({
        spectaclesPage,
    }) => {
        // 1. Vérifier que la page est chargée
        await spectaclesPage.expectLoaded();

        // 2. Vérifier que les cartes de spectacles sont visibles
        await spectaclesPage.expectSpectacleCardsVisible();
    });

    // PUB-SPEC-002 : Cliquer sur une carte mène à la page détail
    test('PUB-SPEC-002 — Clic sur une carte ouvre la page détail', async ({
        spectaclesPage,
    }) => {
        // 1. Vérifier que la page est chargée
        await spectaclesPage.expectLoaded();

        // 2. Cliquer sur le premier spectacle
        await spectaclesPage.clickFirstSpectacle();

        // 3. Vérifier que la page détail est chargée
        await spectaclesPage.expectDetailPageLoaded();
    });
});
