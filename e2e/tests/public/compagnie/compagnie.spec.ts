import { test, expect } from '../compagnie/compagnie.fixtures';

test.describe('Page Compagnie — Tests publics P0', () => {
    // PUB-COMP-001 : La page charge avec les sections principales
    test('PUB-COMP-001 — La page charge avec les sections attendues', async ({
        compagniePage,
    }) => {
        // 1. Vérifier que la page est chargée
        await compagniePage.expectLoaded();

        // 2. Vérifier la présence des sections hero, historique et équipe
        await compagniePage.expectSections();
    });
});
