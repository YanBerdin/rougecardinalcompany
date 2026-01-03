#!/usr/bin/env tsx
/*
 * Test views as an authenticated non-admin user.
 * Usage:
 *   DOTENV_CONFIG_PATH=.env pnpm exec tsx scripts/test-views-security-authenticated.ts
 */
import 'dotenv/config';

import { createClient } from '@supabase/supabase-js';
import { env } from '../lib/env';

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;
const serviceKey = env.SUPABASE_SECRET_KEY;

const adminClient = createClient(url, serviceKey);
const anonClient = createClient(url, anonKey);

async function ensureTestUser(email: string, password: string) {
    try {
        const { data, error } = await adminClient.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { role: 'user', display_name: 'Test User' },
            app_metadata: { role: 'user' },
        });

        if (error) {
            if (error.message && error.message.includes('already registered')) {
                // find existing user id
                const { data: list } = await adminClient.auth.admin.listUsers();
                const existing = list.users.find(u => u.email === email);
                if (existing) {
                    console.log('ℹ️  Test user already exists, using existing account');
                    return true;
                }
            }
            console.error('❌ createUser error:', error.message || error);
            return false;
        }

        console.log('✅ Test user created:', data.user?.email);
        return true;
    } catch (err) {
        console.error('❌ Exception creating test user:', err);
        return false;
    }
}

async function signInAndTest(email: string, password: string) {
    // sign in
    const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
        email,
        password,
    });

    if (signInError) {
        console.error('❌ Sign-in failed:', signInError.message);
        process.exit(1);
    }

    const accessToken = signInData.session?.access_token;
    if (!accessToken) {
        console.error('❌ No access token after sign-in');
        process.exit(1);
    }

    // create client with auth header
    const authClient = createClient(url, anonKey, {
        global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });

    console.log('\n🧪 Running view tests as authenticated non-admin:', email, '\n');

    let allPassed = true;

    // PUBLIC views should be accessible
    const checks = [
        { name: 'articles_presse_public', select: 'id, title' },
        { name: 'communiques_presse_public', select: 'id, title' },
        { name: 'popular_tags', select: 'id, name' },
        { name: 'categories_hierarchy', select: 'id, name' },
    ];

    for (const c of checks) {
        try {
            const { data, error } = await authClient.from(c.name).select(c.select).limit(5);
            if (error) {
                console.error(`   ❌ ${c.name} error:`, error.message);
                allPassed = false;
            } else {
                console.log(`   ✅ ${c.name}: ${data?.length || 0} rows`);
            }
        } catch (err) {
            console.error(`   ❌ ${c.name} exception:`, err);
            allPassed = false;
        }
    }

    // ADMIN view should be denied
    try {
        const { data, error } = await authClient.from('communiques_presse_dashboard').select('id').limit(1);
        if (error) {
            if (error.message.includes('permission denied')) {
                console.log('   ✅ Admin view correctly denied to non-admin');
            } else {
                console.error('   ❌ Unexpected error on admin view:', error.message);
                allPassed = false;
            }
        } else {
            console.error('   ❌ Security issue: admin view accessible to non-admin!', data);
            allPassed = false;
        }
    } catch (err) {
        console.error('   ❌ Exception testing admin view:', err);
        allPassed = false;
    }

    console.log('\n' + '='.repeat(60));
    if (allPassed) {
        console.log('✅ Authenticated non-admin tests passed');
        process.exit(0);
    } else {
        console.log('❌ Some authenticated tests failed');
        process.exit(1);
    }
}

async function main() {
    const email = process.env.TEST_NONADMIN_EMAIL || `test.user+${Date.now()}@rougecardinal.local`;
    const password = process.env.TEST_NONADMIN_PASSWORD || 'Test123!';

    const ok = await ensureTestUser(email, password);
    if (!ok) process.exit(1);

    await signInAndTest(email, password);
}

main().catch((e) => {
    console.error('❌ Fatal:', e);
    process.exit(1);
});
