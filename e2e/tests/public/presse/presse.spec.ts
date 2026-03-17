import { test, expect } from '../presse/presse.fixtures';

test.describe('Page Presse — Tests publics P0', () => {
    // PUB-PRESSE-001 : La page charge et affiche le contenu presse
    test('PUB-PRESSE-001 — La page charge avec le contenu presse', async ({
        pressePage,
    }) => {
        // 1. Vérifier que la page est chargée
        await pressePage.expectLoaded();

        // 2. Vérifier la présence de la section revue de presse
        await expect(pressePage.revueDePresse).toBeVisible();
    });
});
