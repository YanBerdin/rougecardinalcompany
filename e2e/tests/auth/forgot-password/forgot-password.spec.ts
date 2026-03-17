// spec: specs/PLAN_DE_TEST_COMPLET.md — section 6.3
// seed: none (public auth pages)

import { test, expect } from './forgot-password.fixtures';

test.describe('Mot de passe oublié (Forgot Password)', () => {
    // AUTH-FORGOT-001 : Champ Email et bouton Send reset email affichés
    test('AUTH-FORGOT-001 — Affiche champ email et bouton Send reset email', async ({
        forgotPage,
    }) => {
        // 1. Vérifier que le champ email est visible
        await expect(forgotPage.emailInput).toBeVisible();

        // 2. Vérifier que le bouton est visible
        await expect(forgotPage.submitButton).toBeVisible();
    });

    // AUTH-FORGOT-002 : Email valide → confirmation envoi
    test('AUTH-FORGOT-002 — Email valide affiche un message de confirmation', async ({
        forgotPage,
    }) => {
        // 1. Saisir une adresse email valide
        await forgotPage.emailInput.fill('admin@test.com');

        // 2. Cliquer sur Send reset email
        await forgotPage.submitButton.click();

        // 3. Vérifier le message de confirmation « Check Your Email »
        await expect(forgotPage.successCard).toBeVisible({ timeout: 10_000 });
    });

    // AUTH-FORGOT-003 : Email invalide → erreur validation
    test('AUTH-FORGOT-003 — Email invalide bloque la soumission', async ({
        forgotPage,
    }) => {
        // 1. Saisir un format email invalide
        await forgotPage.emailInput.fill('pasunmail');

        // 2. Cliquer sur Send reset email
        await forgotPage.submitButton.click();

        // 3. Vérifier que la validation HTML5 bloque (type=email required)
        const isEmailValid = await forgotPage.emailInput.evaluate(
            (el: HTMLInputElement) => el.validity.valid,
        );
        expect(isEmailValid).toBe(false);
    });
});
