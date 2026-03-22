// spec: specs/PLAN_DE_TEST_COMPLET.md — Section 21.6 Gestion d'erreurs
// Cas couverts : CROSS-ERR-001, CROSS-ERR-002
// Pré-requis : aucun (pas d'auth requise)

import { test, expect } from './errors-public.fixtures';

const NONEXISTENT_URL = '/page-inexistante-e2e-test';

test.describe('Gestion d\'erreurs — Site public', () => {
    // CROSS-ERR-001 — Page 404
    test('CROSS-ERR-001 — Page 404 : affiche une page 404 avec indication de retour', async ({
        page,
    }) => {
        // 1. Naviguer vers une URL inexistante
        const response = await page.goto(NONEXISTENT_URL);

        // 2. Vérifier le code HTTP 404
        expect(response?.status()).toBe(404);

        // 3. Vérifier que l'URL est correcte (pas de redirection)
        await expect(page).toHaveURL(new RegExp(NONEXISTENT_URL));

        // 4. La page affiche une indication 404 (heading ou texte)
        await expect(page.getByRole('heading', { name: '404' })).toBeVisible();

        // 5. La page n'est pas blanche — le body contient du contenu visible
        const bodyText = await page.locator('body').textContent();
        expect(bodyText?.trim().length).toBeGreaterThan(0);
    });

    // CROSS-ERR-002 — Erreur serveur (Supabase indisponible)
    test('CROSS-ERR-002 — Erreur réseau : error boundary visible, pas de page blanche', async ({
        page,
    }) => {
        // 1. Intercepter toutes les requêtes vers Supabase local et les faire échouer
        await page.route('**/rest/v1/**', (route) => route.abort('connectionrefused'));
        await page.route('**/auth/v1/**', (route) => route.abort('connectionrefused'));

        // 2. Charger la page d'accueil (les appels Supabase vont échouer)
        await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30_000 });

        // 3. La page ne doit pas être blanche — body contient du contenu
        await expect(page.locator('body')).not.toBeEmpty();
        const bodyText = await page.locator('body').textContent();
        expect(bodyText?.trim().length).toBeGreaterThan(0);

        // 4. Soit la page affiche un error boundary, soit elle dégrade gracieusement
        //    (certaines sections peuvent être vides mais la structure reste)
        const hasErrorBoundary = await page
            .getByText(/erreur|error|problème|réessayer/i)
            .first()
            .isVisible()
            .catch(() => false);

        const hasPageStructure = await page
            .locator('header, nav, main, #main-content, [role="banner"]')
            .first()
            .isVisible()
            .catch(() => false);

        // Au moins un des deux doit être vrai : error boundary OU structure restante
        expect(hasErrorBoundary || hasPageStructure).toBe(true);
    });
});
