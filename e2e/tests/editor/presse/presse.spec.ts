// spec: specs/PLAN_DE_TEST_COMPLET.md — Section 12: Gestion de la Presse
// seed: e2e/factories/presse.factory.ts

import { test, expect } from './presse.fixtures';
import { PressReleaseFactory } from '@/e2e/factories';

test.describe('Gestion de la Presse', () => {
    test.afterEach(async () => {
        await PressReleaseFactory.cleanup();
    });

    // --- P0 ---

    test('ADM-PRESSE-001 — Affichage onglets Communiqués et Articles', async ({
        pressePage,
    }) => {
        // 1. Navigate to /admin/presse (done by fixture)
        await pressePage.expectLoaded();

        // 2. Verify the two tabs visible to editor role
        await expect(pressePage.tabCommuniques).toBeVisible();
        await expect(pressePage.tabArticles).toBeVisible();
        // Note: Contacts tab is admin-only, editor should not see it
    });

    test('ADM-PRESSE-002 — Créer un communiqué de presse', async ({
        pressePage,
        page,
    }) => {
        // 1. Switch to Communiqués tab
        await pressePage.switchToTab('Communiqués');

        // 2. Click "Nouveau communiqué"
        await pressePage.clickCreateCommunique();

        // 3. Fill form
        await pressePage.fillCommuniqueForm({
            title: '[TEST] Communiqué Nouveau Spectacle',
            description: 'La compagnie est heureuse d\'annoncer un nouveau spectacle.',
        });

        // 4. Submit
        await pressePage.submitForm();

        // 5. Verify redirect back to communiqués list or toast
        await page.waitForURL('**/admin/presse**');
        await pressePage.expectCommuniqueVisible(
            '[TEST] Communiqué Nouveau Spectacle',
        );
    });

    test('ADM-PRESSE-003 — Modifier un communiqué', async ({
        pressePage,
        page,
    }) => {
        // 1. Seed a communiqué
        await PressReleaseFactory.create({
            title: '[TEST] Communiqué Original',
        });

        // 2. Reload
        await page.reload();
        await pressePage.expectLoaded();

        // 3. Switch to Communiqués
        await pressePage.switchToTab('Communiqués');

        // 4. Click Modifier on the seeded communiqué
        await pressePage.clickCommuniqueAction(
            '[TEST] Communiqué Original',
            'Modifier',
        );

        // 5. Edit title
        await pressePage.fillCommuniqueForm({
            title: '[TEST] Communiqué Modifié',
        });

        // 6. Submit
        await pressePage.submitForm();

        // 7. Verify updated content
        await page.waitForURL('**/admin/presse**');
        await pressePage.expectCommuniqueVisible(
            '[TEST] Communiqué Modifié',
        );
    });

    test('ADM-PRESSE-004 — Supprimer un communiqué', async ({
        pressePage,
        page,
    }) => {
        // 1. Seed
        await PressReleaseFactory.create({
            title: '[TEST] Communiqué À Supprimer',
        });

        // 2. Reload
        await page.reload();
        await pressePage.expectLoaded();
        await pressePage.switchToTab('Communiqués');

        // 3. Click Supprimer
        await pressePage.clickCommuniqueAction(
            '[TEST] Communiqué À Supprimer',
            'Supprimer',
        );

        // 4. Confirm
        await pressePage.confirmDelete();

        // 5. Verify toast
        await pressePage.expectDeleteToast();

        // 6. Verify the communiqué is gone
        await expect(
            page.getByText('[TEST] Communiqué À Supprimer').first(),
        ).toBeHidden();
    });

    // --- P1 ---

    test('ADM-PRESSE-005 — Publier un communiqué', async ({
        pressePage,
        page,
    }) => {
        // 1. Seed unpublished
        await PressReleaseFactory.create({
            title: '[TEST] Communiqué Non Publié',
            public: false,
        });

        // 2. Reload
        await page.reload();
        await pressePage.expectLoaded();
        await pressePage.switchToTab('Communiqués');

        // 3. Click Publier action
        await pressePage.clickCommuniqueAction(
            '[TEST] Communiqué Non Publié',
            'Publier',
        );

        // 4. Verify publish toast
        await pressePage.expectPublishToast();
    });

    test('ADM-PRESSE-006 — Dépublier un communiqué', async ({
        pressePage,
        page,
    }) => {
        // 1. Seed published
        await PressReleaseFactory.create({
            title: '[TEST] Communiqué Publié',
            public: true,
        });

        // 2. Reload
        await page.reload();
        await pressePage.expectLoaded();
        await pressePage.switchToTab('Communiqués');

        // 3. Click Dépublier action
        await pressePage.clickCommuniqueAction(
            '[TEST] Communiqué Publié',
            'Dépublier',
        );

        // 4. Verify toast
        await pressePage.expectUnpublishToast();
    });

    test('ADM-PRESSE-007 — Prévisualiser un communiqué', async ({
        pressePage,
        page,
    }) => {
        // 1. Seed
        await PressReleaseFactory.create({
            title: '[TEST] Communiqué Préview',
        });

        // 2. Reload
        await page.reload();
        await pressePage.expectLoaded();
        await pressePage.switchToTab('Communiqués');

        // 3. Click Prévisualiser
        await pressePage.clickCommuniqueAction(
            '[TEST] Communiqué Préview',
            'Prévisualiser',
        );

        // 4. Verify navigation to preview or preview dialog open
        const previewContent = page.getByText('[TEST] Communiqué Préview').first();
        await expect(previewContent).toBeVisible();
    });

    test('ADM-PRESSE-008 — Basculer vers onglet Articles', async ({
        pressePage,
    }) => {
        // 1. Page loaded (fixture)
        await pressePage.expectLoaded();

        // 2. Switch to Articles tab
        await pressePage.switchToTab('Articles');

        // 3. Verify the tab is active
        await expect(pressePage.tabArticles).toHaveAttribute(
            'data-state',
            'active',
        );
    });

    // --- P2 ---

    test('ADM-PRESSE-009 — Onglet Contacts non visible pour editor', async ({
        pressePage,
    }) => {
        // Editor role should NOT see the Contacts tab (admin-only)
        await pressePage.expectLoaded();
        await expect(pressePage.tabContacts).toBeHidden();
    });

    test('ADM-PRESSE-010 — Liste vide communiqués', async ({
        pressePage,
        page,
    }) => {
        // With no seeded data (all cleaned), verify empty state or no cards
        await pressePage.expectLoaded();
        await pressePage.switchToTab('Communiqués');

        // Accept either an explicit empty state or no cards visible
        const emptyState = page.getByText(
            /aucun communiqué|pas de communiqué/i,
        );
        const noCards = page
            .locator('.bg-card, [class*="card"]')
            .filter({ hasText: '[TEST]' });

        // Either empty state is shown OR there are no test cards
        const emptyVisible = await emptyState.isVisible().catch(() => false);
        if (!emptyVisible) {
            await expect(noCards).toHaveCount(0);
        }
    });
});
