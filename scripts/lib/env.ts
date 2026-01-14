/**
 * Environment helper for standalone scripts
 * 
 * ⚠️ This file is for scripts running OUTSIDE Next.js runtime.
 * For Next.js app code, always use `import { env } from "@/lib/env"`.
 * 
 * Scripts cannot use @t3-oss/env-nextjs because it depends on Next.js runtime.
 * This helper provides similar validation for standalone scripts.
 */

import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local from project root
dotenv.config({ path: join(__dirname, "..", "..", ".env.local") });

// Schema for script environment variables
const scriptEnvSchema = z.object({
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    SUPABASE_SECRET_KEY: z.string().min(1),
    // Optional: for backup scripts
    SUPABASE_DB_URL: z.string().url().optional(),
    TEST_DB_URL: z.string().url().optional(),
});

type ScriptEnv = z.infer<typeof scriptEnvSchema>;

function validateScriptEnv(): ScriptEnv {
    const result = scriptEnvSchema.safeParse({
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
        SUPABASE_DB_URL: process.env.SUPABASE_DB_URL,
        TEST_DB_URL: process.env.TEST_DB_URL,
    });

    if (!result.success) {
        console.error("❌ Variables d'environnement manquantes ou invalides:");
        result.error.issues.forEach((issue) => {
            console.error(`   - ${issue.path.join(".")}: ${issue.message}`);
        });
        process.exit(1);
    }

    return result.data;
}

export const scriptEnv = validateScriptEnv();
