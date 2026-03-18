// spec: specs/PLAN_DE_TEST_COMPLET.md — Section 10: Gestion Agenda
// seed: e2e/factories/evenements.factory.ts

import { test, expect } from './agenda.fixtures';
import { EvenementFactory, SpectacleFactory, LieuFactory } from '@/e2e/factories';

test.describe('Gestion Agenda', () => {
    test.afterEach(async () => {
        await EvenementFactory.cleanup();
        await SpectacleFactory.cleanup();
        await LieuFactory.cleanup();
    });

    // --- P0 ---

    test('ADM-AGENDA-001 — Affichage liste avec 5 colonnes', async ({
        agendaPage,
        page,
    }) => {
        // 1. Seed an event so the table renders (empty state hides table)
        await EvenementFactory.createWithDependencies();

        // 2. Reload to display the seeded data
        await page.reload();
        await agendaPage.expectLoaded();

        // 3. Verify table has 5 columns
        await agendaPage.expectTableHeaders();
    });

    test('ADM-AGENDA-002 — Créer un événement', async ({
        agendaPage,
        page,
    }) => {
        // 1. Seed dependencies
        const spectacle = await SpectacleFactory.create({
            title: '[TEST] Spectacle Agenda',
            status: 'published',
        });
        const lieu = await LieuFactory.create({
            nom: '[TEST] Lieu Agenda',
        });

        // 2. Reload to see seeded data in selectors
        await page.reload();
        await agendaPage.expectLoaded();

        // 3. Click "Nouvel Événement"
        await agendaPage.clickCreate();

        // 4. Fill the event form
        await agendaPage.fillForm({
            spectacle: spectacle.title,
            dateDebut: '2026-06-15',
            startTime: '20:00',
            lieu: lieu.nom,
        });

        // 5. Submit
        await agendaPage.submitForm();

        // 6. Wait for redirect and verify
        await page.waitForURL('**/admin/agenda', { timeout: 30_000 });
        await agendaPage.expectRowWithSpectacle('[TEST] Spectacle Agenda');
    });

    test('ADM-AGENDA-003 — Modifier un événement', async ({
        agendaPage,
        page,
    }) => {
        // 1. Seed event with dependencies
        const { evenement, spectacle } =
            await EvenementFactory.createWithDependencies();

        // 2. Reload
        await page.reload();
        await agendaPage.expectLoaded();

        // 3. Click "Modifier"
        await agendaPage.clickRowAction(spectacle.title, 'Modifier');

        // 4. Change date (datetime-local needs YYYY-MM-DDTHH:MM)
        await page
            .getByLabel(/Date début/i)
            .fill('2026-09-20T20:00');

        // 5. Submit
        await agendaPage.submitForm();

        // 6. Wait for redirect
        await page.waitForURL('**/admin/agenda', { timeout: 30_000 });
    });

    test('ADM-AGENDA-004 — Supprimer un événement', async ({
        agendaPage,
        page,
    }) => {
        // 1. Seed event
        const { spectacle } =
            await EvenementFactory.createWithDependencies();

        // 2. Reload
        await page.reload();
        await agendaPage.expectLoaded();

        // 3. Click "Supprimer"
        await agendaPage.clickRowAction(spectacle.title, 'Supprimer');

        // 4. Confirm
        await agendaPage.confirmDelete();

        // 5. Verify toast
        await agendaPage.expectDeleteToast();

        // 6. Verify row is gone
        await expect(
            page.getByRole('row').filter({ hasText: spectacle.title }),
        ).toBeHidden();
    });

    // --- P1 ---

    test('ADM-AGENDA-005 — Impact public après création', async ({
        agendaPage,
        page,
    }) => {
        // 1. Seed a published spectacle with a public event
        const spectacle = await SpectacleFactory.create({
            title: '[TEST] Spectacle Public Agenda',
            status: 'published',
            public: true,
        });
        const lieu = await LieuFactory.create({
            nom: '[TEST] Lieu Public Agenda',
        });

        // 2. Reload and create event
        await page.reload();
        await agendaPage.expectLoaded();
        await agendaPage.clickCreate();

        await agendaPage.fillForm({
            spectacle: spectacle.title,
            dateDebut: '2026-12-01',
            startTime: '19:30',
            lieu: lieu.nom,
        });
        await agendaPage.submitForm();
        await page.waitForURL('**/admin/agenda', { timeout: 30_000 });

        // 3. Verify the event appears on public agenda
        await page.goto('/agenda');
        await expect(
            page.getByText('[TEST] Spectacle Public Agenda'),
        ).toBeVisible();
    });

    test('ADM-AGENDA-006 — Sélecteurs spectacle et lieu', async ({
        agendaPage,
        page,
    }) => {
        // 1. Seed dependencies
        const spectacle = await SpectacleFactory.create({
            title: '[TEST] Spectacle Selector',
            status: 'published',
        });
        const lieu = await LieuFactory.create({
            nom: '[TEST] Lieu Selector',
        });

        // 2. Reload and click create
        await page.reload();
        await agendaPage.expectLoaded();
        await agendaPage.clickCreate();

        // 3. Verify spectacle selector lists the seeded spectacle
        const spectacleSelect = page.getByLabel(/Spectacle/i);
        await expect(spectacleSelect).toBeVisible();

        // 4. Verify lieu selector lists the seeded lieu
        const lieuSelect = page.getByLabel(/Lieu/i);
        await expect(lieuSelect).toBeVisible();
    });
});
