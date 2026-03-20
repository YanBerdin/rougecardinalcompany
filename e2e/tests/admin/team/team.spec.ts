// spec: specs/PLAN_DE_TEST_COMPLET.md — Section 8: Équipe

import { test, expect } from './team.fixtures';
import { MembreEquipeFactory } from '@/e2e/factories';

const MEMBER_NAME = '[TEST] Jean Dupont E2E';
const MEMBER_ROLE = 'Danseur';

test.describe('Gestion de l\'Équipe', () => {
    test.afterEach(async () => {
        await MembreEquipeFactory.cleanup();
    });

    // --- P0 ---

    test('ADM-TEAM-001 — Liste des membres', async ({ teamPage }) => {
        // 1. Naviguer vers /admin/team (fait par la fixture)
        await teamPage.expectLoaded();

        // 2. La liste des membres s'affiche en cartes avec photo, nom, rôle, statut
        await expect(teamPage.heading).toBeVisible();
        await expect(teamPage.addMemberLink).toBeVisible();
    });

    test('ADM-TEAM-002 — Ajouter un membre', async ({ teamPage, page }) => {
        // 1. Cliquer "Ajouter un membre"
        await teamPage.clickAddMember();

        // 2. Remplir nom, rôle, bio
        await teamPage.fillTeamMemberForm({ name: MEMBER_NAME, role: MEMBER_ROLE });

        // 3. Sauvegarder
        await teamPage.submitTeamMemberForm();

        // 4. Le nouveau membre apparaît dans la liste, toast de succès
        await expect(page.getByText(/succès|créé|enregistré/i).first()).toBeVisible({ timeout: 5_000 });
        await teamPage.goto();
        await teamPage.expectMemberVisible(MEMBER_NAME);
    });

    test('ADM-TEAM-003 — Modifier un membre', async ({ teamPage, page }) => {
        // Setup : créer un membre via factory
        const member = await MembreEquipeFactory.create({ name: MEMBER_NAME, role: MEMBER_ROLE });
        await teamPage.goto();

        // 1. Cliquer "Modifier" sur le membre
        await teamPage.editMember(member.name);
        const updatedRole = 'Metteur en scène';
        await teamPage.fillTeamMemberForm({ name: member.name, role: updatedRole });

        // 2. Sauvegarder
        await teamPage.submitTeamMemberForm();

        // 3. La carte affiche le rôle mis à jour
        await expect(page.getByText(/succès|mis à jour/i).first()).toBeVisible({ timeout: 5_000 });
        await teamPage.goto();
        await expect(teamPage.getMemberCard(MEMBER_NAME).getByText(updatedRole)).toBeVisible();
    });

    test('ADM-TEAM-004 — Désactiver un membre', async ({ teamPage, page }) => {
        // Setup : créer un membre
        const member = await MembreEquipeFactory.create({ name: MEMBER_NAME, role: MEMBER_ROLE });
        await teamPage.goto();

        // 1. Cliquer "Désactiver" sur le membre
        await teamPage.clickMemberAction(member.name, 'Désactiver');

        // 2. Confirmer
        await teamPage.confirmDialog('Désactiver');

        // 3. Le membre passe en inactif (showInactive s'active automatiquement)
        await expect(page.getByText(/désactivé/i).first()).toBeVisible({ timeout: 5_000 });
        await teamPage.expectMemberInactive(MEMBER_NAME);
    });

    // --- P1 ---

    test('ADM-TEAM-005 — Afficher membres inactifs', async ({ teamPage }) => {
        // Setup : créer un membre inactif
        const member = await MembreEquipeFactory.create({
            name: MEMBER_NAME,
            role: MEMBER_ROLE,
            active: false,
        });
        await teamPage.goto();

        // 1. Activer le toggle "Afficher inactifs"
        await teamPage.toggleShowInactive();

        // 2. Les membres inactifs apparaissent avec indicateur visuel
        await teamPage.expectMemberVisible(member.name);
    });

    test.describe.serial('Désactiver puis Réactiver', () => {
        test('ADM-TEAM-006 — Réactiver un membre', async ({ teamPage }) => {
            // Setup : créer un membre inactif
            const member = await MembreEquipeFactory.create({
                name: MEMBER_NAME,
                role: MEMBER_ROLE,
                active: false,
            });
            await teamPage.goto();

            // 1. Afficher les inactifs
            await teamPage.toggleShowInactive();
            await teamPage.expectMemberVisible(member.name);

            // 2. Cliquer "Réactiver" sur le membre inactif
            await teamPage.clickMemberAction(member.name, 'Réactiver');
            await teamPage.confirmDialog('Réactiver');

            // 3. Le membre redevient actif
            await teamPage.goto();
            await teamPage.expectMemberVisible(member.name);
        });
    });

    test('ADM-TEAM-007 — Validation — Nom vide', async ({ teamPage, page }) => {
        // 1. Ouvrir le formulaire d'ajout
        await teamPage.clickAddMember();

        // 2. Laisser le nom vide, tenter de sauvegarder
        await teamPage.fillTeamMemberForm({ name: '', role: MEMBER_ROLE });
        await teamPage.submitTeamMemberForm();

        // 3. Erreur de validation, sauvegarde bloquée
        const currentUrl = page.url();
        await expect(page.getByRole('button', { name: /Créer|Sauvegarder|Enregistrer/i })).toBeVisible();
        // La page ne redirige pas vers la liste
        await expect(page).toHaveURL(currentUrl);
    });

    test('ADM-TEAM-008 — Impact public — Membre désactivé masqué', async ({ teamPage, page }) => {
        // Setup : créer un membre inactif
        await MembreEquipeFactory.create({
            name: MEMBER_NAME,
            role: MEMBER_ROLE,
            active: false,
        });

        // 1. Naviguer vers /compagnie (section Équipe)
        await page.goto('/compagnie');
        await page.waitForLoadState('load');

        // 2. Le membre désactivé n'apparaît pas sur la page publique
        await expect(page.getByText(MEMBER_NAME)).not.toBeVisible();
    });
});
