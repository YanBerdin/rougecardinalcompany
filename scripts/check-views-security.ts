#!/usr/bin/env tsx
/**
 * Script: Check Views Security Configuration
 * 
 * Purpose:
 * - Test public views are accessible via anon role
 * - Test admin views are NOT accessible via anon role
 * - Validate RLS enforcement through SECURITY INVOKER
 * 
 * Usage:
 *   DOTENV_CONFIG_PATH=.env.local pnpm exec tsx scripts/check-views-security.ts
 * 
 * Requirements:
 *   - Complete .env.local file (T3 Env validates all variables)
 * 
 * Note: Since PostgREST doesn't expose pg_views, we test security
 *       indirectly by checking view accessibility per role.
 */

// CRITICAL: Load .env.local BEFORE any other imports (tsx doesn't auto-load like Next.js)
import 'dotenv/config';

import { createClient } from '@supabase/supabase-js';
import { env } from '../lib/env';

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = env.SUPABASE_SECRET_KEY;
const SUPABASE_ANON_KEY = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;

const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
});

const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false }
});

interface TestResult {
    name: string;
    passed: boolean;
    message: string;
}

const PUBLIC_VIEWS = [
    'communiques_presse_public',
    'articles_presse_public',
    'popular_tags',
    'categories_hierarchy',
];

const ADMIN_VIEWS = [
    'communiques_presse_dashboard',
    'membres_equipe_admin',
    'compagnie_presentation_sections_admin',
    'partners_admin',
    'content_versions_detailed',
    'messages_contact_admin',
    'analytics_summary',
];

const ADMIN_BASE_TABLES_WITH_ACTIVE_FILTER = [
    'membres_equipe',
    'compagnie_presentation_sections',
];

async function testPublicViewAccess(viewName: string): Promise<TestResult> {
    const { data, error } = await anonClient
        .from(viewName)
        .select('*')
        .limit(1);

    if (error) {
        return {
            name: `Public view: ${viewName}`,
            passed: false,
            message: `❌ Not accessible to anon: ${error.message}`
        };
    }

    return {
        name: `Public view: ${viewName}`,
        passed: true,
        message: `✅ Accessible (${data?.length ?? 0} rows)`
    };
}

async function testAdminViewBlocked(viewName: string): Promise<TestResult> {
    const { data, error } = await anonClient
        .from(viewName)
        .select('*')
        .limit(1);

    if (error) {
        return {
            name: `Admin view blocked: ${viewName}`,
            passed: true,
            message: `✅ Access denied: ${error.code}`
        };
    }

    if (data && data.length > 0) {
        return {
            name: `Admin view blocked: ${viewName}`,
            passed: false,
            message: `🚨 DATA EXPOSED to anon (${data.length} rows)!`
        };
    }

    return {
        name: `Admin view blocked: ${viewName}`,
        passed: true,
        message: `✅ Empty result (RLS or no data)`
    };
}

async function testBaseTableActiveFilter(tableName: string): Promise<TestResult> {
    const { data, error } = await anonClient
        .from(tableName)
        .select('id, active')
        .limit(10);

    if (error) {
        return {
            name: `Base table: ${tableName}`,
            passed: false,
            message: `❌ Error querying table: ${error.message}`
        };
    }

    const inactiveRows = data?.filter(row => row.active === false) ?? [];
    
    if (inactiveRows.length > 0) {
        return {
            name: `Base table: ${tableName}`,
            passed: false,
            message: `🚨 INACTIVE ROWS EXPOSED to anon (${inactiveRows.length} inactive)`
        };
    }

    return {
        name: `Base table: ${tableName}`,
        passed: true,
        message: `✅ Only active rows visible (${data?.length ?? 0} rows)`
    };
}

async function checkViewsSecurity() {
    console.log('🔍 Checking Views Security Configuration\n');
    console.log('='.repeat(50) + '\n');

    const results: TestResult[] = [];

    console.log('📋 Testing PUBLIC views (should be accessible to anon):\n');
    for (const view of PUBLIC_VIEWS) {
        const result = await testPublicViewAccess(view);
        results.push(result);
        console.log(`   ${result.message} - ${view}`);
    }

    console.log('\n📋 Testing ADMIN views (should be BLOCKED for anon):\n');
    for (const view of ADMIN_VIEWS) {
        const result = await testAdminViewBlocked(view);
        results.push(result);
        console.log(`   ${result.message} - ${view}`);
    }

    console.log('\n📋 Testing BASE TABLES with active filter (anon should see only active=true):\n');
    for (const table of ADMIN_BASE_TABLES_WITH_ACTIVE_FILTER) {
        const result = await testBaseTableActiveFilter(table);
        results.push(result);
        console.log(`   ${result.message} - ${table}`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Summary\n');

    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;

    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📈 Total:  ${results.length}`);

    if (failed > 0) {
        console.log('\n🚨 SECURITY ISSUES DETECTED!\n');
        results.filter(r => !r.passed).forEach(r => {
            console.log(`   - ${r.name}: ${r.message}`);
        });
        process.exit(1);
    }

    console.log('\n✅ All views are properly secured with SECURITY INVOKER!\n');
    process.exit(0);
}

checkViewsSecurity().catch((err) => {
    console.error('❌ Fatal error:', err);
    process.exit(1);
});
