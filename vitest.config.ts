import { defineConfig } from "vitest/config";
import path from "node:path";

const alias = { "@": path.resolve(__dirname, ".") };

export default defineConfig({
    resolve: { alias },
    test: {
        projects: [
            {
                resolve: { alias },
                test: {
                    name: "unit",
                    environment: "node",
                    include: ["__tests__/**/*.test.{ts,tsx}"],
                    exclude: ["__tests__/integration/**"],
                    // Unit tests must not depend on a developer's local .env files.
                    env: {
                        SKIP_ENV_VALIDATION: "1",
                        NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
                        EMAIL_FROM: "noreply@test.local",
                        EMAIL_CONTACT: "contact@test.local",
                    },
                },
            },
            {
                // Opt-in (`pnpm test:integration`): needs a local Supabase + .env.e2e.
                resolve: { alias },
                test: {
                    name: "integration",
                    environment: "node",
                    include: ["__tests__/integration/**/*.test.ts"],
                    testTimeout: 30_000,
                    hookTimeout: 60_000,
                    // Shared database state: parallel files would interfere with each other.
                    fileParallelism: false,
                },
            },
        ],
        coverage: {
            provider: "v8",
            reporter: ["text", "html", "lcov"],
            // Only unit-testable layers. DAL, server actions, hooks and services
            // are covered by the integration and E2E suites instead.
            include: [
                "lib/auth/**",
                "lib/constants/**",
                "lib/forms/**",
                "lib/i18n/**",
                "lib/schemas/**",
                "lib/tables/**",
                "lib/utils/**",
                "emails/**",
            ],
            exclude: ["lib/**/index.ts"],
        },
    },
});
