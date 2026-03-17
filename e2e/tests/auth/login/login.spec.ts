// spec: specs/PLAN_DE_TEST_COMPLET.md — section 6.1
// seed: none (public auth pages)

import { test, expect } from './login.fixtures';

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL!;
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD!;

test.describe('Connexion (Login)', () => {
    test.describe.configure({ mode: 'serial' });

    // AUTH-LOGIN-001 : Connexion réussie — Admin → redirection /admin
    test('AUTH-LOGIN-001 — Connexion réussie admin redirige vers /admin', async ({
        loginPage,
    }) => {
        // 1. Saisir email admin et mot de passe, cliquer Login
        await loginPage.login(ADMIN_EMAIL, ADMIN_PASSWORD);

        // 2. Attendre la redirection vers /admin
        await loginPage.page.waitForURL('**/admin**', { timeout: 15_000 });

        // 3. Vérifier que l'URL contient /admin
        expect(loginPage.page.url()).toContain('/admin');
    });

    // AUTH-LOGIN-002 : Mauvais mot de passe → message d'erreur
    test('AUTH-LOGIN-002 — Mauvais mot de passe affiche une erreur', async ({
        loginPage,
    }) => {
        // 1. Saisir email admin avec un mauvais mot de passe
        await loginPage.login(ADMIN_EMAIL, 'MauvaisPassword123');

        // 2. Vérifier que le message d'erreur s'affiche
        await expect(loginPage.errorMessage).toBeVisible({ timeout: 10_000 });
    });

    // AUTH-LOGIN-003 : Email inexistant → message d'erreur
    test('AUTH-LOGIN-003 — Email inexistant affiche une erreur', async ({
        loginPage,
    }) => {
        // 1. Saisir un email inexistant avec un mot de passe
        await loginPage.login('inconnu@test.com', 'UnMotDePasse123');

        // 2. Vérifier que le message d'erreur s'affiche
        await expect(loginPage.errorMessage).toBeVisible({ timeout: 10_000 });
    });

    // AUTH-LOGIN-004 : Champs vides → validation empêche la soumission
    test('AUTH-LOGIN-004 — Champs vides bloquent la soumission', async ({
        loginPage,
    }) => {
        // 1. Cliquer Login sans remplir les champs
        await loginPage.submitButton.click();

        // 2. Vérifier qu'on reste sur la page login
        expect(loginPage.page.url()).toContain('/auth/login');

        // 3. Vérifier que la validation HTML5 bloque (email required)
        const isEmailValid = await loginPage.emailInput.evaluate(
            (el: HTMLInputElement) => el.validity.valid,
        );
        expect(isEmailValid).toBe(false);
    });

    // AUTH-LOGIN-005 : Lien Sign up → /auth/sign-up
    test('AUTH-LOGIN-005 — Lien Sign up redirige vers /auth/sign-up', async ({
        loginPage,
    }) => {
        // 1. Cliquer sur le lien "Sign up"
        await loginPage.signUpLink.click();

        // 2. Vérifier la navigation vers /auth/sign-up
        await loginPage.page.waitForURL('**/auth/sign-up**');
        expect(loginPage.page.url()).toContain('/auth/sign-up');
    });

    // AUTH-LOGIN-006 : Lien Forgot your password → /auth/forgot-password
    test('AUTH-LOGIN-006 — Lien Forgot password redirige vers /auth/forgot-password', async ({
        loginPage,
    }) => {
        // 1. Cliquer sur le lien "Forgot your password?"
        await loginPage.forgotPasswordLink.click();

        // 2. Vérifier la navigation vers /auth/forgot-password
        await loginPage.page.waitForURL('**/auth/forgot-password**');
        expect(loginPage.page.url()).toContain('/auth/forgot-password');
    });

    // AUTH-LOGIN-007 : Persistance de session après reload
    test('AUTH-LOGIN-007 — Session persiste après rechargement de page', async ({
        loginPage,
    }) => {
        // 1. Se connecter avec des identifiants valides
        await loginPage.login(ADMIN_EMAIL, ADMIN_PASSWORD);
        await loginPage.page.waitForURL('**/admin**', { timeout: 15_000 });

        // 2. Recharger la page (simule fermeture/réouverture onglet)
        await loginPage.page.reload({ waitUntil: 'domcontentloaded' });

        // 3. Vérifier qu'on est toujours sur /admin
        expect(loginPage.page.url()).toContain('/admin');
    });
});
