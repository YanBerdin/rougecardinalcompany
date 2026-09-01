#!/usr/bin/env tsx
/*
 * Test views as an authenticated non-admin user.
 * Usage:
 *   DOTENV_CONFIG_PATH=.env pnpm exec tsx scripts/test-views-security-authenticated.ts
 */
import 'dotenv/config';

import { createClient } from '@supabase/supabase-js';
import { env } from '../lib/env.js';

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;
const serviceKey = env.SUPABASE_SECRET_KEY;

const adminClient = createClient(url, serviceKey);
const anonClient = createClient(url, anonKey);

async function ensureTestUser(email: string, password: string) {
    try {
        // Security: role MUST be set only in app_metadata (signed JWT, server-only).
        // user_metadata may carry profile data (display_name) but never authorization.
        const { data, error } = await adminClient.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { display_name: 'Test User' },
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

    // ADMIN views should be denied (7 views total)
    // ✅ COMPORTEMENT ATTENDU : Les vues admin doivent retourner "permission denied" (42501)
    // ✅ SÉCURITÉ : Si une vue admin retourne des données, c'est une FAILLE DE SÉCURITÉ
    console.log('\n🔒 Testing admin views access (should be denied - EXPECTED BEHAVIOR):\n');

    const adminViews = [
        'membres_equipe_admin',
        'compagnie_presentation_sections_admin',
        'partners_admin',
        'content_versions_detailed',
        'messages_contact_admin',
        'analytics_summary',
        'analytics_summary_90d',
    ];

    // Test function-based admin endpoint separately (communiques_presse_dashboard is now a function)
    try {
        const { data, error } = await authClient.rpc('communiques_presse_dashboard');

        if (error) {
            // Expected: permission denied or explicit error message
            if (error.message.includes('permission denied') || error.message.includes('admin access required')) {
                console.log(`   ✅ communiques_presse_dashboard (function): correctly denied`);
            } else {
                console.error(`   ❌ communiques_presse_dashboard (function): unexpected error - ${error.message}`);
                allPassed = false;
            }
        } else {
            // NOT EXPECTED: function returned data
            console.error(`   ❌ communiques_presse_dashboard (function): SECURITY ISSUE - returns ${Array.isArray(data) ? data.length + ' rows' : 'data'} instead of permission denied`);
            allPassed = false;
        }
    } catch (err: any) {
        if (err.message && (err.message.includes('permission denied') || err.message.includes('admin access required'))) {
            console.log(`   ✅ communiques_presse_dashboard (function): correctly denied`);
        } else {
            console.error(`   ❌ communiques_presse_dashboard (function) exception:`, err.message || err);
            allPassed = false;
        }
    }

    for (const viewName of adminViews) {
        try {
            // Use '*' to avoid issues with views that don't have 'id' column (e.g., analytics_summary)
            const { data, error } = await authClient.from(viewName).select('*').limit(1);

            if (error) {
                // Expected: permission denied (42501 code)
                if (error.message.includes('permission denied') || error.code === '42501') {
                    console.log(`   ✅ ${viewName}: correctly denied`);
                } else {
                    console.error(`   ❌ ${viewName}: unexpected error - ${error.message}`);
                    allPassed = false;
                }
            } else {
                // NOT EXPECTED: view returned data or empty array
                if (Array.isArray(data) && data.length === 0) {
                    console.error(`   ❌ ${viewName}: SECURITY ISSUE - returns empty array instead of permission denied`);
                    allPassed = false;
                } else {
                    console.error(`   ❌ ${viewName}: CRITICAL SECURITY ISSUE - accessible to non-admin! Data:`, data);
                    allPassed = false;
                }
            }
        } catch (err) {
            console.error(`   ❌ ${viewName}: exception -`, err);
            allPassed = false;
        }
    }

    console.log('\n' + '='.repeat(60));
    if (allPassed) {
        console.log('✅ All security tests passed');
        console.log('   • Public views: accessible ✅');
        console.log('   • Admin views: correctly denied (permission denied) ✅');
        console.log('\n💡 Note: "permission denied" errors are EXPECTED and indicate');
        console.log('   proper security enforcement (RLS + SECURITY INVOKER).');
        process.exit(0);
    } else {
        console.log('❌ Some security tests failed - REVIEW REQUIRED');
        console.log('   Check for views that should be denied but return data.');
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
