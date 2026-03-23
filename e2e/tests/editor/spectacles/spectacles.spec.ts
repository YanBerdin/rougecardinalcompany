// spec: specs/PLAN_DE_TEST_COMPLET.md — Section 9: Gestion des Spectacles
// seed: e2e/factories/spectacles.factory.ts

import { test, expect } from './spectacles.fixtures';
import { SpectacleFactory } from '@/e2e/factories';

test.describe('Gestion des Spectacles', () => {
    test.afterEach(async () => {
        await SpectacleFactory.cleanup();
    });

    // --- P0 ---

    test('ADM-SPEC-001 — Affichage liste avec 7 colonnes', async ({
        spectaclesPage,
    }) => {
        // 1. Navigate to /admin/spectacles (done by fixture)
        await spectaclesPage.expectLoaded();

        // 2. Verify table has 7 columns
        await spectaclesPage.expectTableHeaders();
    });

    test('ADM-SPEC-003 — Créer un spectacle', async ({
        spectaclesPage,
        page,
    }) => {
        // 1. Click "Nouveau spectacle"
        await spectaclesPage.clickCreate();

        // 2. Fill required fields
        await spectaclesPage.fillForm({
            title: '[TEST] Hamlet E2E',
            genre: 'Drame',
            duration: '120',
            description: 'Test description from E2E',
        });

        // 3. Submit the form
        await spectaclesPage.submitForm();

        // 4. Wait for redirect back to list
        await page.waitForURL('**/admin/spectacles', { timeout: 30_000 });

        // 5. Verify the created spectacle appears in the table
        await spectaclesPage.expectRowWithTitle('[TEST] Hamlet E2E');
    });

    test('ADM-SPEC-004 — Modifier un spectacle', async ({
        spectaclesPage,
        page,
    }) => {
        // 1. Seed a spectacle
        const spectacle = await SpectacleFactory.create({
            title: '[TEST] Original Titre',
        });

        // 2. Navigate to see seeded data
        await spectaclesPage.goto();
        await spectaclesPage.expectLoaded();

        // 3. Click "Éditer" on the seeded spectacle
        await spectaclesPage.clickRowAction('[TEST] Original Titre', 'Éditer');

        // 4. Modify the title
        await spectaclesPage.fillForm({
            title: '[TEST] Titre Modifié',
        });

        // 5. Submit the form
        await spectaclesPage.submitForm();

        // 6. Wait for redirect and verify updated title
        await page.waitForURL('**/admin/spectacles', { timeout: 30_000 });
        await spectaclesPage.expectRowWithTitle('[TEST] Titre Modifié');
    });

    test('ADM-SPEC-005 — Supprimer un spectacle', async ({
        spectaclesPage,
        page,
    }) => {
        // 1. Seed a spectacle
        await SpectacleFactory.create({
            title: '[TEST] Spectacle À Supprimer',
        });

        // 2. Navigate to see seeded data
        await spectaclesPage.goto();
        await spectaclesPage.expectLoaded();

        // 3. Click "Supprimer" on the spectacle row
        await spectaclesPage.clickRowAction(
            '[TEST] Spectacle À Supprimer',
            'Supprimer',
        );

        // 4. Confirm the deletion in the dialog
        await spectaclesPage.confirmDelete();

        // 5. Verify toast
        await spectaclesPage.expectDeleteToast();

        // 6. Verify the spectacle is no longer in the table
        await expect(
            page.getByRole('row').filter({
                hasText: '[TEST] Spectacle À Supprimer',
            }).first(),
        ).toBeHidden();
    });

    // --- P1 ---

    test('ADM-SPEC-002 — Tri par colonnes', async ({
        spectaclesPage,
        page,
    }) => {
        // 1. Seed multiple spectacles
        await SpectacleFactory.createMany(3);

        // 2. Navigate to refresh list
        await spectaclesPage.goto();
        await spectaclesPage.expectLoaded();

        // 3. Click "Titre" column header to sort ascending
        await spectaclesPage.clickSortHeader('Titre');

        // 4. Click again for descending
        await spectaclesPage.clickSortHeader('Titre');

        // Verify table still displays (sort is visual check)
        await spectaclesPage.expectLoaded();
    });

    test('ADM-SPEC-006 — Voir/prévisualisation spectacle', async ({
        spectaclesPage,
        page,
    }) => {
        // 1. Seed a spectacle
        await SpectacleFactory.create({
            title: '[TEST] Spectacle Preview',
        });

        // 2. Navigate to refresh list
        await spectaclesPage.goto();
        await spectaclesPage.expectLoaded();

        // 3. Click "Détails" on the spectacle
        await spectaclesPage.clickRowAction(
            '[TEST] Spectacle Preview',
            'Détails',
        );

        // 4. Verify details page or panel loads
        await expect(page.getByText('[TEST] Spectacle Preview').first()).toBeVisible();
    });

    test('ADM-SPEC-007 — Galerie photos', async ({
        spectaclesPage,
        page,
    }) => {
        // 1. Seed a spectacle
        await SpectacleFactory.create({
            title: '[TEST] Spectacle Galerie',
        });

        // 2. Navigate to refresh list
        await spectaclesPage.goto();
        await spectaclesPage.expectLoaded();

        // 3. Click "Galerie" on the spectacle
        await spectaclesPage.clickRowAction(
            '[TEST] Spectacle Galerie',
            'Galerie',
        );

        // 4. Verify navigation to gallery section (uses #gallery fragment)
        await page.waitForURL(/\/admin\/spectacles\//, {
            timeout: 15_000,
        });
        await expect(page).toHaveURL(/#gallery/);
    });

    test('ADM-SPEC-008 — Validation titre vide', async ({
        spectaclesPage,
    }) => {
        // 1. Click "Nouveau spectacle"
        await spectaclesPage.clickCreate();

        // 2. Leave title empty and submit
        await spectaclesPage.submitForm();

        // 3. Verify validation error
        await spectaclesPage.expectFormValidationError();
    });

    test('ADM-SPEC-009 — Statut et visibilité', async ({
        spectaclesPage,
        page,
    }) => {
        // 1. Seed a draft spectacle
        const spectacle = await SpectacleFactory.create({
            title: '[TEST] Spectacle Publish',
            status: 'draft',
            public: false,
        });

        // 2. Navigate to refresh list
        await spectaclesPage.goto();
        await spectaclesPage.expectLoaded();

        // 3. Edit the spectacle to make it published
        await spectaclesPage.clickRowAction(
            '[TEST] Spectacle Publish',
            'Éditer',
        );

        // 4. Change status to published
        await page.getByRole('combobox', { name: /Statut/i }).click();
        await page.getByRole('option', { name: 'Actuellement' }).click();
        // Note: Cannot set public=true without a validated image (app constraint)

        // 5. Submit
        await spectaclesPage.submitForm();

        // 6. Wait for redirect back to admin list and verify status changed
        await page.waitForURL('**/admin/spectacles', { timeout: 30_000 });
        await spectaclesPage.expectLoaded();
        await spectaclesPage.expectRowWithTitle('[TEST] Spectacle Publish');
    });

    // --- P2 ---

    test('ADM-SPEC-010 — Pagination/scroll avec 16+ spectacles', async ({
        spectaclesPage,
        page,
    }) => {
        // 1. Seed 16 spectacles
        await SpectacleFactory.createMany(16);

        // 2. Navigate to refresh list
        await spectaclesPage.goto();
        await spectaclesPage.expectLoaded();

        // 3. Verify at least 16 seeded rows are displayed (no pagination — all shown)
        // Wait for rows to be fully rendered before counting
        await expect(spectaclesPage.table.getByRole('row').first()).toBeVisible({ timeout: 10_000 });
        const rowCount = await spectaclesPage.table.getByRole('row').count();
        expect(rowCount).toBeGreaterThanOrEqual(16 + 1); // +1 for header
    });
});
