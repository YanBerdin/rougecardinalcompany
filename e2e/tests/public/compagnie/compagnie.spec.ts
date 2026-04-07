import { test, expect } from '../compagnie/compagnie.fixtures';
import { MembreEquipeFactory } from '@/e2e/factories';

const MEMBER_NAME = '[TEST] Marie Dupont E2E';
const MEMBER_ROLE = 'Comédienne';
const MEMBER_BIO = '[TEST] Bio longue pour le test de la modale Playwright.';

test.describe('Page Compagnie — Tests publics P0', () => {
    // PUB-COMP-001 : La page charge avec les sections principales
    test('PUB-COMP-001 — La page charge avec les sections attendues', async ({
        compagniePage,
    }) => {
        // 1. Vérifier que la page est chargée
        await compagniePage.expectLoaded();

        // 2. Vérifier la présence des sections hero, historique et équipe
        await compagniePage.expectSections();
    });
});

test.describe('Page Compagnie — Tests publics P1 — Modale membre', () => {
    test.afterEach(async () => {
        await MembreEquipeFactory.cleanup();
    });

    // PUB-COMP-002 : La modale d'un membre affiche sa biographie complète
    test('PUB-COMP-002 — La modale d\'un membre affiche sa biographie complète', async ({
        compagniePage,
    }) => {
        // Setup : créer un membre actif avec description via factory
        await MembreEquipeFactory.create({
            name: MEMBER_NAME,
            role: MEMBER_ROLE,
            description: MEMBER_BIO,
            active: true,
        });

        // Recharger la page pour inclure le nouveau membre
        await compagniePage.goto();

        // Ouvrir la modale via le bouton "Voir le profil de …"
        await compagniePage.openMemberModal(MEMBER_NAME);

        // Vérifier le contenu de la modale (nom + biographie)
        await compagniePage.expectMemberModalVisible(MEMBER_NAME, MEMBER_BIO);

        // Fermer la modale via Escape
        await compagniePage.closeMemberModal();
    });
});
