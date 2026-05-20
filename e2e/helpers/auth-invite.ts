/**
 * Helpers d'invitation pour les tests E2E.
 *
 * Utilise `supabaseAdmin.auth.admin.generateLink` (service_role) pour générer
 * un lien d'invitation directement, sans dépendre d'Inbucket. Permet aussi de
 * fixer le rôle dans `app_metadata` (seule source autoritaire) après création.
 */
import { supabaseAdmin } from './db';

export type InvitedRole = 'user' | 'editor' | 'admin';

export interface InvitedUser {
    userId: string;
    email: string;
    inviteLink: string;
}

/**
 * Crée un utilisateur invité avec un rôle défini dans `app_metadata.role`.
 *
 * @param role Rôle cible à inscrire dans `app_metadata` (jamais dans user_metadata).
 * @returns Identifiant, email généré et lien d'invitation utilisable par Playwright.
 */
export async function createInvitedUser(role: InvitedRole): Promise<InvitedUser> {
    const email = `e2e-invite-${role}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}@example.test`;

    const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/setup-account`;

    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
        type: 'invite',
        email,
        options: { redirectTo },
    });

    if (error || !data?.user || !data.properties?.action_link) {
        throw new Error(
            `generateLink(invite) failed: ${error?.message ?? 'unknown error'}`,
        );
    }

    const userId = data.user.id;

    if (role !== 'user') {
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            userId,
            { app_metadata: { role } },
        );
        if (updateError) {
            await supabaseAdmin.auth.admin.deleteUser(userId);
            throw new Error(
                `updateUserById(app_metadata.role) failed: ${updateError.message}`,
            );
        }
    }

    // Supabase local ignore `redirectTo` si l'URL n'est pas whitelistée et
    // redirige vers SITE_URL (http://127.0.0.1:3000/) avec les tokens dans le
    // fragment. On suit manuellement le verify pour extraire ce fragment et
    // reconstruire un lien direct vers /auth/setup-account.
    const verifyResponse = await fetch(data.properties.action_link, {
        redirect: 'manual',
    });
    const location = verifyResponse.headers.get('location');
    if (!location) {
        await supabaseAdmin.auth.admin.deleteUser(userId);
        throw new Error(
            `generateLink(invite): verify did not return Location header (status ${verifyResponse.status})`,
        );
    }
    const hashIndex = location.indexOf('#');
    if (hashIndex === -1) {
        await supabaseAdmin.auth.admin.deleteUser(userId);
        throw new Error(`generateLink(invite): no fragment in Location: ${location}`);
    }
    const fragment = location.slice(hashIndex + 1);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://127.0.0.1:3000';
    const inviteLink = `${siteUrl}/auth/setup-account#${fragment}`;

    return {
        userId,
        email,
        inviteLink,
    };
}

/**
 * Supprime un utilisateur de test. À appeler dans un `afterEach` ou
 * équivalent pour ne pas polluer la base locale.
 */
export async function deleteInvitedUser(userId: string): Promise<void> {
    await supabaseAdmin.auth.admin.deleteUser(userId);
}
