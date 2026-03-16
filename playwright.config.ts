import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env.e2e') });

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';

export default defineConfig({
    testDir: './e2e/tests',
    timeout: 90_000,
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: 1,
    reporter: [['html', { open: 'never' }]],

    use: {
        baseURL: BASE_URL,
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        navigationTimeout: 45_000,
    },

    projects: [
        {
            name: 'chromium-public',
            use: { ...devices['Desktop Chrome'] },
            testMatch: 'public/**/*.spec.ts',
        },
    ],

    webServer: {
        command: 'pnpm dev',
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
    },
});
