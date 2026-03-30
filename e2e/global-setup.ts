/**
 * Playwright Global Setup
 * Validates environment prerequisites before running E2E tests.
 * Runs once before all tests.
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.e2e') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://localhost:54321';
const SUPABASE_HEALTH_URL = `${SUPABASE_URL}/rest/v1/`;

async function checkSupabaseLocal(): Promise<void> {
    const isLocal =
        SUPABASE_URL.includes('localhost') || SUPABASE_URL.includes('127.0.0.1');

    if (!isLocal) {
        console.log(`ℹ️  Supabase distant détecté (${SUPABASE_URL}) — pas de vérification locale.`);
        return;
    }

    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 3_000);

        const res = await fetch(SUPABASE_HEALTH_URL, {
            signal: controller.signal,
            headers: { 'Content-Type': 'application/json' },
        }).finally(() => clearTimeout(timer));

        // Supabase REST répond toujours avec une réponse HTTP valide (même sans clé)
        if (!res.ok && res.status !== 401) {
            throw new Error(`HTTP ${res.status}`);
        }

        console.log(`✅ Supabase local opérationnel (${SUPABASE_URL})`);
    } catch (err: unknown) {
        const isRefused =
            err instanceof Error &&
            (err.message.includes('ECONNREFUSED') ||
                err.message.includes('fetch failed') ||
                err.name === 'AbortError');

        const hint = isRefused
            ? 'Connexion refusée — Supabase local n\'est pas démarré.'
            : `Erreur inattendue : ${err instanceof Error ? err.message : String(err)}`;

        throw new Error(
            `\n\n❌ SUPABASE LOCAL INACCESSIBLE\n` +
            `   URL testée : ${SUPABASE_HEALTH_URL}\n` +
            `   Cause       : ${hint}\n\n` +
            `   👉 Lancez Supabase avant les tests :\n` +
            `      pnpm dlx supabase start\n\n` +
            `   Puis relancez :\n` +
            `      pnpm run e2e:admin\n`,
        );
    }
}

async function checkEnvVars(): Promise<void> {
    const required = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'SUPABASE_SERVICE_ROLE_KEY',
        'E2E_ADMIN_EMAIL',
        'E2E_ADMIN_PASSWORD',
    ];

    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
        throw new Error(
            `\n\n❌ VARIABLES D'ENVIRONNEMENT MANQUANTES\n` +
            `   Fichier attendu : .env.e2e\n` +
            `   Variables manquantes :\n` +
            missing.map((k) => `      • ${k}`).join('\n') +
            `\n\n   👉 Copiez .env.e2e.example et renseignez les valeurs.\n`,
        );
    }
}

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';
const SUPABASE_DB_URL = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';

/**
 * Initialize database state for E2E tests.
 * Ensures required toggles and configurations are enabled.
 */
async function initializeTestDatabase(): Promise<void> {
    const isLocal =
        SUPABASE_URL.includes('localhost') || SUPABASE_URL.includes('127.0.0.1');

    if (!isLocal) {
        console.log('ℹ️  Supabase distant — pas d\'initialisation BDD.');
        return;
    }

    try {
        // Dynamic import to avoid bundling pg in browser
        const { Client } = await import('pg');
        const client = new Client({ connectionString: SUPABASE_DB_URL });
        await client.connect();

        // Enable contact newsletter toggle for E2E tests
        await client.query(`
            INSERT INTO public.configurations_site (key, value, description, category)
            VALUES (
                'display_toggle_contact_newsletter',
                '{"enabled": true}',
                'Display newsletter signup form on contact page',
                'contact_display'
            )
            ON CONFLICT (key)
            DO UPDATE SET value = '{"enabled": true}'
        `);

        await client.end();
        console.log('✅ Base de données initialisée (toggle newsletter activé)');
    } catch (err: unknown) {
        console.warn(
            `⚠️  Échec initialisation BDD : ${err instanceof Error ? err.message : String(err)}`,
        );
        // Non bloquant - les tests peuvent continuer si la BDD est déjà OK
    }
}

/**
 * Warmup Next.js dev mode by triggering compilation of key pages.
 * Uses fetch() to request pages — this triggers server-side compilation
 * so subsequent test navigations find pages already compiled and cached.
 */
async function warmupNextjsServer(): Promise<void> {
    const WARMUP_TIMEOUT_MS = 60_000;
    const pagesToWarm = ['/', '/auth/login'];

    console.log('🔥 Warmup Next.js dev mode — compilation des pages...');

    for (const pagePath of pagesToWarm) {
        const start = Date.now();
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), WARMUP_TIMEOUT_MS);

        try {
            const res = await fetch(`${BASE_URL}${pagePath}`, {
                signal: controller.signal,
            }).finally(() => clearTimeout(timer));
            console.log(`   ✓ ${pagePath} (${res.status}, ${Date.now() - start}ms)`);
        } catch (err: unknown) {
            clearTimeout(timer);
            const msg = err instanceof Error ? err.message : String(err);
            console.warn(`   ⚠️  ${pagePath} — warmup échoué après ${Date.now() - start}ms : ${msg}`);
        }
    }

    console.log('✅ Warmup terminé\n');
}

export default async function globalSetup(): Promise<void> {
    console.log('\n🔍 Playwright Global Setup — vérification des prérequis...\n');

    await checkEnvVars();
    await checkSupabaseLocal();
    await initializeTestDatabase();
    await warmupNextjsServer();

    console.log('✅ Prérequis OK — démarrage des tests\n');
}
