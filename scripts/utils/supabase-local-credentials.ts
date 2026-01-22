/**
 * Supabase Local Credentials Loader
 * 
 * Centralized utility for loading Supabase local development credentials.
 * Uses environment variables from .env.local to avoid hardcoded credentials.
 * 
 * @usage
 * ```typescript
 * import { getLocalCredentials } from './utils/supabase-local-credentials';
 * 
 * const { url, publishableKey, serviceKey } = getLocalCredentials();
 * const supabase = createClient(url, serviceKey);
 * ```
 * 
 * @security
 * - Credentials are loaded from .env.local (gitignored)
 * - Falls back to default values with warning for quick testing
 * - Never commit credentials directly in code
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local - REQUIRED for security
config({ path: resolve(process.cwd(), '.env.local') });

export interface SupabaseLocalCredentials {
    url: string;
    publishableKey: string;
    serviceKey: string;
}

/**
 * Get Supabase local development credentials
 * 
 * Requires .env.local file with:
 * - SUPABASE_LOCAL_URL
 * - SUPABASE_LOCAL_PUBLISHABLE_KEY  
 * - SUPABASE_LOCAL_SERVICE_KEY
 * 
 * @throws Error if any credential is missing
 * @returns Local Supabase credentials
 */
export function getLocalCredentials(options?: { silent?: boolean }): SupabaseLocalCredentials {
    const url = process.env.SUPABASE_LOCAL_URL;
    const publishableKey = process.env.SUPABASE_LOCAL_PUBLISHABLE_KEY;
    const serviceKey = process.env.SUPABASE_LOCAL_SERVICE_KEY;

    // Strict validation - no fallbacks for security
    const missing: string[] = [];
    if (!url) missing.push('SUPABASE_LOCAL_URL');
    if (!publishableKey) missing.push('SUPABASE_LOCAL_PUBLISHABLE_KEY');
    if (!serviceKey) missing.push('SUPABASE_LOCAL_SERVICE_KEY');

    if (missing.length > 0) {
        throw new Error(
            `❌ Missing required environment variables: ${missing.join(', ')}\n\n` +
            `📝 Setup instructions:\n` +
            `   1. Copy template: cp .env.local.example .env.local\n` +
            `   2. Get keys: pnpm dlx supabase status\n` +
            `   3. Update .env.local with your local keys\n\n` +
            `⚠️  .env.local is gitignored - never commit credentials!`
        );
    }

    return {
        url: url as string,
        publishableKey: publishableKey as string,
        serviceKey: serviceKey as string,
    };
}

/**
 * Validate that credentials are for local development only
 * Throws error if URL points to production/cloud
 */
export function validateLocalOnly(url: string): void {
    if (!url.includes('127.0.0.1') && !url.includes('localhost')) {
        throw new Error(
            `🔴 SECURITY ERROR: Attempting to use local credentials with non-local URL: ${url}\n` +
            `Local credentials should only be used with localhost URLs.\n` +
            `For production, use environment variables with proper Supabase Cloud credentials.`
        );
    }
}
