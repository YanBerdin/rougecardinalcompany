import { test, expect } from '../agenda/agenda.fixtures';

test.describe('Page Agenda — Tests publics P0', () => {
    // PUB-AGENDA-001 : La page charge et affiche la liste des événements
    test('PUB-AGENDA-001 — La page charge avec la liste des événements', async ({
        agendaPage,
    }) => {
        // 1. Vérifier que la page est chargée
        await agendaPage.expectLoaded();

        // 2. Vérifier que la liste des événements est visible
        await agendaPage.expectEventListVisible();
    });
});
