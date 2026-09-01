#!/usr/bin/env tsx
/**
 * Script: Check Role Invariant
 *
 * Vérifie l'invariant de sécurité du rôle d'autorisation :
 * `auth.users.raw_app_meta_data->>'role'` doit toujours être NULL ou appartenir
 * à la whitelist `('user', 'editor', 'admin')`.
 *
 * Toute autre valeur est un signe potentiel d'injection ou de corruption et
 * doit échouer le build CI (exit code 1).
 *
 * Usage :
 *   pnpm exec tsx scripts/check-role-invariant.ts
 *
 * Variables d'environnement requises :
 *   - INVARIANT_DB_URL : chaîne `postgres://...` ciblant la base à auditer
 *     (par défaut : Supabase local `postgres://postgres:postgres@127.0.0.1:54322/postgres`).
 *
 * Note : on n'utilise PAS `SUPABASE_DB_URL` pour éviter une collision avec d'autres
 * usages projet où cette variable peut contenir l'URL HTTPS du projet Supabase.
 */
import 'dotenv/config';
import { Client } from 'pg';

const ALLOWED_ROLES = ['user', 'editor', 'admin'] as const;

async function main(): Promise<void> {
    const connectionString =
        process.env.INVARIANT_DB_URL ??
        'postgres://postgres:postgres@127.0.0.1:54322/postgres';

    if (!connectionString.startsWith('postgres://') && !connectionString.startsWith('postgresql://')) {
        console.error(
            `❌ INVARIANT_DB_URL doit être une chaîne postgres://... (reçu: ${connectionString.slice(0, 16)}...).`,
        );
        process.exit(2);
    }

    const client = new Client({ connectionString });
    await client.connect();

    try {
        const result = await client.query<{
            id: string;
            email: string | null;
            role_value: string | null;
        }>(
            `select id::text as id,
                    email,
                    raw_app_meta_data->>'role' as role_value
             from auth.users
             where raw_app_meta_data ? 'role'
               and (raw_app_meta_data->>'role') is not null
               and (raw_app_meta_data->>'role') not in ('user','editor','admin');`
        );

        if (result.rowCount && result.rowCount > 0) {
            console.error(
                `❌ Invariant violé : ${result.rowCount} utilisateur(s) avec un rôle hors whitelist ${JSON.stringify(
                    ALLOWED_ROLES,
                )}.`,
            );
            for (const row of result.rows) {
                console.error(
                    `  - user_id=${row.id} email=${row.email ?? '<none>'} role=${row.role_value}`,
                );
            }
            process.exit(1);
        }

        console.log(
            `✅ Invariant respecté : aucun utilisateur avec app_metadata.role hors whitelist (${ALLOWED_ROLES.join(', ')}).`,
        );
    } finally {
        await client.end();
    }
}

main().catch((error: unknown) => {
    console.error('❌ Erreur lors de la vérification de l\'invariant :', error);
    process.exit(2);
});
