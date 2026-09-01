/**
 * Tests de non-régression : interdit l'escalade de rôle via
 * `supabase.auth.updateUser({ data: { role: 'admin' } })`.
 *
 * Cas couvert (Step 15 / TASK096) :
 *  - Un utilisateur authentifié (rôle `editor`) tente d'écrire
 *    `role = 'admin'` dans son `user_metadata` via l'endpoint Auth standard.
 *  - Le serveur accepte l'écriture dans `user_metadata` (comportement Supabase
 *    natif), mais cette donnée n'est JAMAIS considérée comme autoritaire :
 *      - `app_metadata.role` (server-signed JWT) reste `editor`.
 *      - `profiles.role` reste `editor`.
 *
 * Le test n'utilise pas de navigateur (test API pur) pour rester rapide.
 */
import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

import {
    createInvitedUser,
    deleteInvitedUser,
    type InvitedUser,
} from '../../../helpers/auth-invite';
import { supabaseAdmin } from '../../../helpers/db';

const STRONG_PASSWORD = 'Str0ngPass!word';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

test.describe('Non-régression : interdiction d\'escalade de rôle', () => {
    let invited: InvitedUser | null = null;

    test.afterEach(async () => {
        if (invited) {
            await deleteInvitedUser(invited.userId).catch(() => undefined);
            invited = null;
        }
    });

    test('ROLE-ESC-001 — updateUser({data:{role:"admin"}}) n\'altère ni app_metadata.role ni profiles.role', async () => {
        // 1. Provisionner un utilisateur invité avec rôle `editor`
        invited = await createInvitedUser('editor');

        // 2. Lui poser un mot de passe + confirmer l'email via admin
        const { error: passwordError } =
            await supabaseAdmin.auth.admin.updateUserById(invited.userId, {
                password: STRONG_PASSWORD,
                email_confirm: true,
            });
        expect(passwordError, 'set password should succeed').toBeNull();

        // 3. Connexion via le client anon (simule un usage front)
        const anonClient = createClient(SUPABASE_URL, ANON_KEY, {
            auth: { autoRefreshToken: false, persistSession: false },
        });
        const { data: signInData, error: signInError } =
            await anonClient.auth.signInWithPassword({
                email: invited.email,
                password: STRONG_PASSWORD,
            });
        expect(signInError, 'signInWithPassword should succeed').toBeNull();
        expect(signInData.session).not.toBeNull();

        // 4. Tentative d'escalade via user_metadata
        const { error: updateError } = await anonClient.auth.updateUser({
            data: { role: 'admin' },
        });
        // L'API accepte l'écriture dans user_metadata (pas une erreur côté serveur)
        expect(updateError).toBeNull();

        // 5. Vérifier que l'app_metadata.role reste 'editor'
        const { data: refreshedAuth, error: getUserError } =
            await supabaseAdmin.auth.admin.getUserById(invited.userId);
        expect(getUserError, 'admin.getUserById should succeed').toBeNull();
        expect(refreshedAuth.user?.app_metadata?.role).toBe('editor');

        // user_metadata peut contenir la valeur 'admin' (écriture acceptée)
        // mais elle n'est JAMAIS lue côté autorisation (Step 5 + Step 13).
        expect(refreshedAuth.user?.user_metadata?.role).toBe('admin');

        // 6. Vérifier que profiles.role reste 'editor' (jamais synchronisé
        //    depuis user_metadata après le retrait du fallback SQL).
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('user_id', invited.userId)
            .single();
        expect(profileError, 'profiles select should succeed').toBeNull();
        expect(profile?.role).toBe('editor');
    });
});
