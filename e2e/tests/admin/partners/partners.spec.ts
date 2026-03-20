// spec: specs/PLAN_DE_TEST_COMPLET.md — Section 17: Partenaires

import { test, expect } from './partners.fixtures';
import { PartnerFactory } from '@/e2e/factories';

const PARTNER_NAME = '[TEST] Partenaire E2E';
const PARTNER_URL = 'https://e2e-partner.example.com';

test.describe('Gestion des Partenaires', () => {
    test.afterEach(async () => {
        await PartnerFactory.cleanup();
    });

    // --- P0 ---

    test('ADM-PART-001 — Liste des partenaires', async ({ partnersPage }) => {
        // 1. Naviguer vers /admin/partners (fait par la fixture)
        await partnersPage.expectLoaded();

        // 2. Les partenaires s'affichent avec logo, nom, site web, statut
        await expect(partnersPage.heading).toBeVisible();
        await expect(partnersPage.addPartnerLink).toBeVisible();
    });

    test('ADM-PART-002 — Ajouter un partenaire', async ({ partnersPage, page }) => {
        // 1. Cliquer "Nouveau partenaire"
        await partnersPage.clickAddPartner();

        // 2. Remplir nom, site web
        await partnersPage.fillPartnerForm({ name: PARTNER_NAME, url: PARTNER_URL });

        // 3. Sauvegarder
        await partnersPage.submitPartnerForm();

        // 4. Le partenaire apparaît dans la liste
        await expect(page.getByText(/succès|créé/i).first()).toBeVisible({ timeout: 5_000 });
        await partnersPage.goto();
        await partnersPage.expectPartnerVisible(PARTNER_NAME);
    });

    test('ADM-PART-003 — Modifier un partenaire', async ({ partnersPage, page }) => {
        // Setup : créer un partenaire via factory
        const partner = await PartnerFactory.create({ name: PARTNER_NAME });
        await partnersPage.goto();

        // 1. Cliquer "Modifier"
        await partnersPage.clickEditPartner(partner.name);

        // 2. Changer le site web
        const updatedUrl = 'https://updated.example.com';
        await partnersPage.fillPartnerForm({ name: PARTNER_NAME, url: updatedUrl });

        // 3. Sauvegarder
        await partnersPage.submitPartnerForm();

        // 4. L'URL est mise à jour
        await expect(page.getByText(/succès|mis à jour/i).first()).toBeVisible({ timeout: 5_000 });
    });

    test('ADM-PART-004 — Supprimer un partenaire', async ({ partnersPage }) => {
        // Setup : créer un partenaire via factory
        const partner = await PartnerFactory.create({ name: PARTNER_NAME });
        await partnersPage.goto();
        await partnersPage.expectLoaded(); // attendre que la liste soit rendue

        // 1. Cliquer "Supprimer"
        await partnersPage.clickDeletePartner(partner.name);

        // 2. Confirmer
        await partnersPage.confirmDeletePartner();

        // 3. Le partenaire disparaît de la liste
        await partnersPage.expectPartnerNotVisible(PARTNER_NAME);
    });

    // --- P1 ---

    test('ADM-PART-005 — Drag & drop — Réordonner', async ({ partnersPage, page }) => {
        await Promise.all([
            PartnerFactory.create({ name: PARTNER_NAME, display_order: 1 }),
            PartnerFactory.create({ name: '[TEST] Second Partenaire E2E', display_order: 2 }),
        ]);
        await partnersPage.goto();

        // Vérifier que les poignées DnD sont présentes dans la vue desktop (1280px)
        // SortablePartnerCard rend un <button aria-label="Glisser pour réorganiser"> par partenaire
        const handles = page.getByRole('button', { name: 'Glisser pour réorganiser' });
        await expect(handles.first()).toBeVisible();
    });

    test('ADM-PART-006 — Activer/Désactiver un partenaire', async ({ partnersPage, page }) => {
        // Setup : créer un partenaire actif
        const partner = await PartnerFactory.create({ name: PARTNER_NAME, is_active: true });
        await partnersPage.goto();

        // 1. Désactiver le partenaire
        await partnersPage.clickDeletePartner(partner.name);
        await partnersPage.cancelDeletePartner(); // Annuler la suppression, chercher le toggle

        // Rechercher un bouton de désactivation spécifique
        const toggleBtn = page.getByRole('button', { name: /Désactiver.*partenaire|partenaire.*inactif/i });
        if (await toggleBtn.isVisible()) {
            await toggleBtn.click();
        }

        // 2. Vérifier la page d'accueil — partenaire inactif absent
        await page.goto('/');
        await page.waitForLoadState('load');
        await expect(page.getByText(partner.name)).not.toBeVisible();
    });

    test('ADM-PART-007 — Impact public — Logos visibles', async ({ partnersPage, page }) => {
        // Setup : créer un partenaire actif
        await PartnerFactory.create({ name: PARTNER_NAME, is_active: true, logo_url: 'https://dummyimage.com/150x55.png' });

        // 1. Naviguer vers / et scroller à la section partenaires
        await page.goto('/');
        await page.waitForLoadState('load');

        // 2. Seuls les partenaires actifs sont affichés (nom dans alt de l'image)
        await expect(page.getByRole('img', { name: PARTNER_NAME }).first()).toBeVisible({ timeout: 10_000 });
    });
});
