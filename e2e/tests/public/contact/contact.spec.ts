import { test, expect } from '../contact/contact.fixtures';

test.describe('Page Contact — Tests publics P0', () => {
    test.describe.configure({ mode: 'serial' });

    // PUB-CONTACT-001 : La page charge avec le formulaire et le sidebar
    test('PUB-CONTACT-001 — La page charge avec formulaire et sidebar', async ({
        contactPage,
    }) => {
        // 1. Vérifier que le formulaire est chargé
        await contactPage.expectLoaded();

        // 2. Vérifier que le sidebar est visible
        await contactPage.expectSidebarVisible();
    });

    // CONTACT-002 : Champs vides → le bouton d'envoi est désactivé
    test('CONTACT-002 — Champs vides, bouton envoi désactivé', async ({
        contactPage,
    }) => {
        // 1. Vérifier que le bouton est désactivé par défaut
        await expect(contactPage.submitButton).toBeDisabled();
    });

    // CONTACT-004 : Champs obligatoires manquants → messages de validation
    test('CONTACT-004 — Champs manquants affichent les erreurs', async ({
        contactPage,
    }) => {
        // 1. Remplir uniquement l'email (les autres champs requis manquent)
        await contactPage.emailInput.fill('test@example.com');

        // 2. Cocher le consentement pour permettre la soumission
        await contactPage.consentCheckbox.click();

        // 3. Soumettre le formulaire
        await contactPage.submit();

        // 4. Vérifier le message d'erreur (le serveur retourne la première erreur zod)
        await contactPage.expectValidationError('Le prénom est requis');
    });

    // CONTACT-003 : Email invalide → message de validation
    test('CONTACT-003 — Email invalide affiche erreur de validation', async ({
        contactPage,
    }) => {
        // 1. Remplir le formulaire avec un email invalide
        await contactPage.fillValidForm({ email: 'email-invalide' });

        // 2. Soumettre le formulaire
        await contactPage.submit();

        // 3. Vérifier le message d'erreur de validation email
        await contactPage.expectValidationError(
            "L'adresse email est invalide",
        );
    });

    // CONTACT-001 : Soumission valide du formulaire → succès (en dernier pour éviter le rate-limit)
    test('CONTACT-001 — Soumission valide affiche le message de succès', async ({
        contactPage,
    }) => {
        // 1. Remplir le formulaire avec des données valides
        await contactPage.fillValidForm();

        // 2. Soumettre le formulaire
        await contactPage.submit();

        // 3. Vérifier le message de succès
        await contactPage.expectSuccess();
    });
});

test.describe('Newsletter — Tests publics P0', () => {
    // NEWS-002 : Email invalide dans la newsletter → message d'erreur (en premier)
    test('NEWS-002 — Newsletter avec email invalide affiche erreur', async ({
        contactPage,
        page,
    }) => {
        // 1. Remplir avec un email invalide
        await contactPage.newsletterInput.fill('pas-un-email');

        // 2. Cliquer sur le bouton S'inscrire
        await contactPage.newsletterButton.click();

        // 3. Vérifier le message d'erreur
        await expect(
            page.locator('#newsletter-error-contact'),
        ).toBeVisible({ timeout: 15_000 });
    });

    // NEWS-001 : Inscription newsletter valide → succès
    test('NEWS-001 — Inscription newsletter valide sur la page contact', async ({
        contactPage,
        page,
    }) => {
        // 1. Remplir le champ email de la newsletter (email unique pour éviter le rate-limiter)
        const uniqueEmail = `e2e-${Date.now()}@example.com`;
        await contactPage.newsletterInput.fill(uniqueEmail);

        // 2. Cliquer sur le bouton S'inscrire
        await contactPage.newsletterButton.click();

        // 3. Vérifier le message de succès
        await expect(
            page.getByText('Merci pour votre inscription !'),
        ).toBeVisible({ timeout: 15_000 });
    });
});
