// spec: specs/PLAN_DE_TEST_COMPLET.md — section 6.2
// seed: none (public auth pages)

import { test, expect } from './signup.fixtures';

test.describe('Inscription (Sign-up)', () => {
    // AUTH-SIGNUP-001 : 3 champs affichés + bouton Sign up
    test('AUTH-SIGNUP-001 — Affiche email, password, repeat password et bouton', async ({
        signupPage,
    }) => {
        // 1. Vérifier que les 3 champs sont visibles
        await expect(signupPage.emailInput).toBeVisible();
        await expect(signupPage.passwordInput).toBeVisible();
        await expect(signupPage.repeatPasswordInput).toBeVisible();

        // 2. Vérifier que le bouton Sign up est visible
        await expect(signupPage.submitButton).toBeVisible();
    });

    // AUTH-SIGNUP-002 : Mots de passe non concordants → erreur
    test('AUTH-SIGNUP-002 — Mots de passe différents affichent une erreur', async ({
        signupPage,
    }) => {
        // 1. Saisir email valide et deux mots de passe différents
        await signupPage.fillForm(
            'test-signup@example.com',
            'Test1234!',
            'AutreMotDePasse',
        );

        // 2. Cliquer sur Sign up
        await signupPage.submitButton.click();

        // 3. Vérifier le message d'erreur « Passwords do not match »
        await expect(signupPage.errorMessage.first()).toBeVisible({
            timeout: 5_000,
        });
        await expect(signupPage.errorMessage.first()).toContainText(
            /passwords do not match/i,
        );
    });

    // AUTH-SIGNUP-003 : Mot de passe trop court → erreur
    test('AUTH-SIGNUP-003 — Mot de passe trop court affiche une erreur', async ({
        signupPage,
    }) => {
        // 1. Saisir email valide et mot de passe court
        await signupPage.fillForm('test-signup@example.com', 'abc', 'abc');

        // 2. Soumettre le formulaire
        await signupPage.submitButton.click();

        // 3. Vérifier le message d'erreur sur la longueur
        await expect(signupPage.errorMessage.first()).toBeVisible({
            timeout: 5_000,
        });
    });

    // AUTH-SIGNUP-004 : Lien Login → /auth/login
    test('AUTH-SIGNUP-004 — Lien Login redirige vers /auth/login', async ({
        signupPage,
    }) => {
        // 1. Cliquer sur le lien "Login"
        await signupPage.loginLink.click();

        // 2. Vérifier la navigation vers /auth/login
        await signupPage.page.waitForURL('**/auth/login**');
        expect(signupPage.page.url()).toContain('/auth/login');
    });
});
