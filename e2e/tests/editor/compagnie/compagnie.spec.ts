// spec: specs/PLAN_DE_TEST_COMPLET.md — Section 13: Gestion de la Compagnie
// seed: none (sections pre-exist in database)

import { test, expect } from './compagnie.fixtures';

const SECTION_LABELS = [
    'Héro',
    'Histoire',
    'Citation',
    'Mission',
    'Valeurs',
    'Équipe',
] as const;

test.describe('Gestion de la Compagnie', () => {
    // --- P0 ---

    test('ADM-COMP-001 — Affichage 2 onglets (Présentation / Valeurs)', async ({
        compagniePage,
    }) => {
        // 1. Navigate to /admin/compagnie (done by fixture)
        await compagniePage.expectLoaded();

        // 2. Verify both tabs are visible
        await compagniePage.expectTwoTabs();
    });

    test('ADM-COMP-002 — Liste des 6 sections de présentation', async ({
        compagniePage,
    }) => {
        // 1. Page loaded
        await compagniePage.expectLoaded();

        // 2. Verify Présentation tab is active by default
        await expect(compagniePage.tabPresentation).toHaveAttribute(
            'data-state',
            'active',
        );

        // 3. Verify 6 sections displayed
        await compagniePage.expectSectionCount(6);

        // 4. Verify all section kinds are visible
        await compagniePage.expectSectionKinds([...SECTION_LABELS]);
    });

    test('ADM-COMP-003 — Modifier une section (Histoire)', async ({
        compagniePage,
        page,
    }) => {
        // 1. Page loaded
        await compagniePage.expectLoaded();

        // 2. Click "Modifier" on the Histoire section
        await compagniePage.clickEditSection('Histoire');

        // 3. Verify a form/dialog opens (expect title or content field)
        const formDialog = page.getByRole('dialog').or(
            page.locator('form'),
        );
        await expect(formDialog.first()).toBeVisible();

        // 4. Find a text input and modify content
        const titleField = page.getByLabel(/Titre|Title/i).first();
        if (await titleField.isVisible()) {
            await titleField.fill('[TEST] Histoire Modifiée');
        }
    });

    // --- P1 ---

    test('ADM-COMP-004 — Basculer vers onglet Valeurs', async ({
        compagniePage,
    }) => {
        // 1. Page loaded
        await compagniePage.expectLoaded();

        // 2. Switch to Valeurs
        await compagniePage.switchToTab('Valeurs');

        // 3. Verify tab is active
        await expect(compagniePage.tabValeurs).toHaveAttribute(
            'data-state',
            'active',
        );
    });

    test('ADM-COMP-005 — Section active affiche badge "Actif"', async ({
        compagniePage,
    }) => {
        // 1. Page loaded
        await compagniePage.expectLoaded();

        // 2. At least one section should have the "Actif" badge
        // Check the Héro section which is typically active
        await compagniePage.expectSectionActive('Héro');
    });

    // --- P2 ---

    test('ADM-COMP-006 — Lien Visualiser vers site public', async ({
        compagniePage,
        page,
    }) => {
        // 1. Page loaded
        await compagniePage.expectLoaded();

        // 2. Click Visualiser
        await compagniePage.clickVisualiser();

        // 3. Verify navigation to a public-facing page
        await expect(page).toHaveURL(/\/(compagnie|a-propos|about)/);
    });
});
