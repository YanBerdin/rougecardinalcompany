import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env.e2e') });

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';

export default defineConfig({
    testDir: './e2e/tests',
    globalSetup: './e2e/global-setup.ts',
    timeout: 45_000,
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: 1,
    reporter: [['html', { open: 'never' }]],

    use: {
        baseURL: BASE_URL,
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        navigationTimeout: 20_000,
    },

    projects: [
        // --- Auth setup (run first) ---
        {
            name: 'setup-admin',
            testMatch: 'auth/admin.setup.ts',
        },
        {
            name: 'setup-editor',
            testMatch: 'auth/editor.setup.ts',
        },
        {
            name: 'setup-user',
            testMatch: 'auth/user.setup.ts',
        },

        // --- Auth tests (no storageState, tests login/signup/forgot flows) ---
        {
            name: 'chromium-auth',
            use: { ...devices['Desktop Chrome'] },
            testMatch: 'auth/**/*.spec.ts',
        },

        // --- Public tests (no auth required) ---
        {
            name: 'chromium-public',
            use: { ...devices['Desktop Chrome'] },
            testMatch: 'public/**/*.spec.ts',
        },

        // --- Editor CRUD tests (depend on editor auth setup) ---
        {
            name: 'editor',
            use: {
                ...devices['Desktop Chrome'],
                storageState: path.join(__dirname, 'e2e/.auth/editor.json'),
            },
            testMatch: 'editor/**/*.spec.ts',
            dependencies: ['setup-editor'],
        },

        // --- Admin CRUD tests (depend on admin auth setup) ---
        {
            name: 'admin',
            use: {
                ...devices['Desktop Chrome'],
                storageState: path.join(__dirname, 'e2e/.auth/admin.json'),
            },
            testMatch: 'admin/**/*.spec.ts',
            dependencies: ['setup-admin'],
        },

        // --- Permissions tests (depend on auth setup) ---
        {
            name: 'permissions',
            use: { ...devices['Desktop Chrome'] },
            testMatch: 'permissions/**/*.spec.ts',
            dependencies: ['setup-admin', 'setup-editor', 'setup-user'],
        },

        // --- Cross-cutting tests: responsive (public), accessibility, theme (public) ---
        {
            name: 'cross-public',
            use: { ...devices['Desktop Chrome'] },
            testMatch: [
                'cross/responsive/responsive-public.spec.ts',
                'cross/accessibility/accessibility.spec.ts',
                'cross/theme/theme-public.spec.ts',
            ],
        },
        // --- Cross-cutting tests requiring admin auth: admin responsive + theme ---
        {
            name: 'cross-admin',
            use: {
                ...devices['Desktop Chrome'],
                storageState: path.join(__dirname, 'e2e/.auth/admin.json'),
            },
            testMatch: [
                'cross/responsive/responsive-admin.spec.ts',
                'cross/theme/theme-admin.spec.ts',
            ],
            dependencies: ['setup-admin'],
        },
    ],

    webServer: {
        command: 'pnpm dev',
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        env: {
            ...process.env,
            // Désactiver Sentry en E2E pour éviter le bruit ETIMEDOUT dans les logs
            NEXT_PUBLIC_SENTRY_ENABLED: 'false',
        },
    },
});
