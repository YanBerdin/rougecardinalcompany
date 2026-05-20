/**
 * E2E — Activation de compte via invitation (TASK096 Phase 5 Step 14).
 *
 * Vérifie l'invariant anti-escalade de privilèges :
 *   - Un utilisateur invité avec `app_metadata.role = 'editor'` est redirigé
 *     vers `/admin` après avoir défini son mot de passe et peut y accéder
 *     sans erreur 42501.
 *   - Un utilisateur invité sans rôle élevé (défaut `'user'`) est redirigé
 *     vers `/` et n'a aucun accès au backoffice.
 */
import { test, expect } from './invite-setup.fixtures';
import {
    createInvitedUser,
    deleteInvitedUser,
    type InvitedUser,
} from '@/e2e/helpers/auth-invite';

const STRONG_PASSWORD = 'Str0ngPass!word';

test.describe('Activation de compte via invitation', () => {
    const createdUsers: InvitedUser[] = [];

    test.afterEach(async () => {
        while (createdUsers.length > 0) {
            const user = createdUsers.pop();
            if (user) {
                await deleteInvitedUser(user.userId).catch(() => undefined);
            }
        }
    });

    test('INVITE-SETUP-001 — utilisateur invité (rôle user) → redirection vers /', async ({
        setupAccountPage,
        page,
    }) => {
        const invited = await createInvitedUser('user');
        createdUsers.push(invited);

        await setupAccountPage.openInviteLink(invited.inviteLink);
        await expect(setupAccountPage.heading).toBeVisible();

        await setupAccountPage.fillPassword(STRONG_PASSWORD);
        await setupAccountPage.submit();

        await page.waitForURL((url) => url.pathname === '/', { timeout: 15_000 });
        expect(new URL(page.url()).pathname).toBe('/');
    });

    test('INVITE-SETUP-002 — utilisateur invité (rôle editor) → redirection vers /admin sans erreur 42501', async ({
        setupAccountPage,
        page,
    }) => {
        const invited = await createInvitedUser('editor');
        createdUsers.push(invited);

        await setupAccountPage.openInviteLink(invited.inviteLink);
        await expect(setupAccountPage.heading).toBeVisible();

        await setupAccountPage.fillPassword(STRONG_PASSWORD);
        await setupAccountPage.submit();

        await page.waitForURL((url) => url.pathname.startsWith('/admin'), {
            timeout: 15_000,
        });
        expect(new URL(page.url()).pathname.startsWith('/admin')).toBe(true);

        // Aucun message d'erreur PostgreSQL 42501 (insufficient privilege) ne
        // doit apparaître dans le rendu admin.
        await expect(page.getByText(/42501/i)).toHaveCount(0);
    });

    test('INVITE-SETUP-003 — mot de passe faible refusé par la validation client', async ({
        setupAccountPage,
        page,
    }) => {
        const invited = await createInvitedUser('user');
        createdUsers.push(invited);

        await setupAccountPage.openInviteLink(invited.inviteLink);
        await setupAccountPage.fillPassword('weakpass');
        await setupAccountPage.submit();

        // Pas de redirection : on reste sur /auth/setup-account.
        await page.waitForTimeout(500);
        expect(new URL(page.url()).pathname).toBe('/auth/setup-account');
    });

    test("INVITE-SETUP-004 — confirmation différente refusée", async ({
        setupAccountPage,
        page,
    }) => {
        const invited = await createInvitedUser('user');
        createdUsers.push(invited);

        await setupAccountPage.openInviteLink(invited.inviteLink);
        await setupAccountPage.fillPassword(STRONG_PASSWORD, 'Different1!Password');
        await setupAccountPage.submit();

        await page.waitForTimeout(500);
        expect(new URL(page.url()).pathname).toBe('/auth/setup-account');
    });
});
