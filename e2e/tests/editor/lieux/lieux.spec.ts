// spec: specs/PLAN_DE_TEST_COMPLET.md — Section 11: Gestion des Lieux
// seed: e2e/factories/lieux.factory.ts

import { test, expect } from './lieux.fixtures';
import { LieuFactory, EvenementFactory, SpectacleFactory } from '@/e2e/factories';

test.describe('Gestion des Lieux', () => {
    test.afterEach(async () => {
        await EvenementFactory.cleanup();
        await SpectacleFactory.cleanup();
        await LieuFactory.cleanup();
    });

    // --- P0 ---

    test('ADM-LIEU-001 — Affichage liste avec 5 colonnes', async ({
        lieuxPage,
    }) => {
        // 1. Navigate to /admin/lieux (done by fixture)
        await lieuxPage.expectLoaded();

        // 2. Verify table has 5 columns
        await lieuxPage.expectTableHeaders();
    });

    test('ADM-LIEU-002 — Créer un lieu', async ({ lieuxPage, page }) => {
        // 1. Click "Nouveau Lieu"
        await lieuxPage.clickCreate();

        // 2. Fill required fields
        await lieuxPage.fillForm({
            nom: '[TEST] Théâtre du Soleil',
            adresse: '1 Route du Champ de Manœuvre',
            ville: 'Paris',
            codePostal: '75012',
            capacite: '800',
        });

        // 3. Submit
        await lieuxPage.submitForm();

        // 4. Verify toast
        await lieuxPage.expectCreateToast();

        // 5. Verify the lieu appears in the table
        await lieuxPage.expectRowWithNom('[TEST] Théâtre du Soleil');
    });

    test('ADM-LIEU-003 — Modifier un lieu', async ({ lieuxPage, page }) => {
        // 1. Seed a lieu
        await LieuFactory.create({
            nom: '[TEST] Lieu Original',
            capacite: 200,
        });

        // 2. Reload
        await page.reload();
        await lieuxPage.expectLoaded();

        // 3. Click "Modifier"
        await lieuxPage.clickRowAction('[TEST] Lieu Original', 'Modifier');

        // 4. Change capacity
        await lieuxPage.fillForm({ nom: '[TEST] Lieu Original', capacite: '500' });

        // 5. Submit
        await lieuxPage.submitForm();

        // 6. Verify toast
        await lieuxPage.expectUpdateToast();
    });

    test('ADM-LIEU-004 — Supprimer un lieu', async ({ lieuxPage, page }) => {
        // 1. Seed a lieu
        await LieuFactory.create({
            nom: '[TEST] Lieu À Supprimer',
        });

        // 2. Reload
        await page.reload();
        await lieuxPage.expectLoaded();

        // 3. Click "Supprimer"
        await lieuxPage.clickRowAction(
            '[TEST] Lieu À Supprimer',
            'Supprimer',
        );

        // 4. Confirm
        await lieuxPage.confirmDelete();

        // 5. Verify toast
        await lieuxPage.expectDeleteToast();

        // 6. Verify row is gone
        await expect(
            page.getByRole('row').filter({
                hasText: '[TEST] Lieu À Supprimer',
            }),
        ).toBeHidden();
    });

    // --- P1 ---

    test('ADM-LIEU-006 — Validation nom vide', async ({ lieuxPage }) => {
        // 1. Click "Nouveau Lieu"
        await lieuxPage.clickCreate();

        // 2. Leave nom empty and submit
        await lieuxPage.submitForm();

        // 3. Verify validation error
        await lieuxPage.expectFormValidationError();
    });

    test('ADM-LIEU-007 — Suppression lieu avec dépendance', async ({
        lieuxPage,
        page,
    }) => {
        // 1. Seed a lieu used by an event
        const lieu = await LieuFactory.create({
            nom: '[TEST] Lieu Avec Événement',
        });
        const spectacle = await SpectacleFactory.create({
            title: '[TEST] Spectacle Dep Lieu',
        });
        await EvenementFactory.create({
            lieu_id: lieu.id,
            spectacle_id: spectacle.id,
        });

        // 2. Navigate fresh to see seeded data (cache-bust with timestamp)
        await page.goto(`/admin/lieux?_t=${Date.now()}`);
        await lieuxPage.expectLoaded();
        await expect(
            page.getByRole('row').filter({ hasText: '[TEST] Lieu Avec Événement' }),
        ).toBeVisible({ timeout: 15_000 });

        // 3. Attempt to delete
        await lieuxPage.clickRowAction(
            '[TEST] Lieu Avec Événement',
            'Supprimer',
        );
        await lieuxPage.confirmDelete();

        // 4. FK is ON DELETE SET NULL — deletion succeeds, evenement.lieu_id becomes null
        await lieuxPage.expectDeleteToast();
        await expect(
            page.getByRole('row').filter({ hasText: '[TEST] Lieu Avec Événement' }),
        ).toBeHidden();
    });

    // --- P2 ---

    test('ADM-LIEU-005 — Affichage 6+ lieux', async ({
        lieuxPage,
        page,
    }) => {
        // 1. Seed 6 lieux
        await LieuFactory.createMany(6);

        // 2. Reload
        await page.reload();
        await lieuxPage.expectLoaded();

        // 3. Verify at least 6 rows appear
        const rows = page.getByRole('row').filter({ hasText: '[TEST]' });
        await expect(rows).toHaveCount(6);
    });
});
