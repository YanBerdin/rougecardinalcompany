// spec: specs/PLAN_DE_TEST_COMPLET.md — Section 21.6 Gestion d'erreurs
// Cas couverts : CROSS-ERR-003
// Pré-requis : storageState admin (projet cross-admin dans playwright.config.ts)

import { test, expect } from './errors-admin.fixtures';

test.describe('Gestion d\'erreurs — Admin', () => {
    // CROSS-ERR-003 — Toast erreur après mutation échouée
    test('CROSS-ERR-003 — Toast erreur : un toast s\'affiche quand une mutation échoue', async ({
        page,
    }) => {
        // 1. Naviguer vers le formulaire de création d'un membre d'équipe
        await page.goto('/admin/team/new', { waitUntil: 'domcontentloaded' });

        // 2. Remplir le champ nom requis
        await page.getByLabel(/Nom/i).fill('[TEST-ERR] E2E Error Test');

        // 3. Intercepter TOUTES les requêtes POST pour retourner une erreur
        //    Le Server Action POST sera intercepté, ce qui fera throw dans le catch
        await page.route('**/*', (route) => {
            if (route.request().method() === 'POST') {
                return route.abort('failed');
            }
            return route.continue();
        });

        // 4. Soumettre le formulaire — la mutation va échouer
        await page.getByRole('button', { name: /Créer|Sauvegarder|Enregistrer/i }).click();

        // 5. Vérifier qu'un toast d'erreur s'affiche
        //    Le catch dans TeamMemberFormWrapper appelle toast.error()
        const toast = page.locator('[data-sonner-toast]').filter({
            hasText: /erreur|échoué|impossible|error|failed|survenue/i,
        });
        await expect(toast).toBeVisible({ timeout: 10_000 });
    });
});
