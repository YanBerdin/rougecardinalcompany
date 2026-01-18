#!/usr/bin/env tsx
/**
 * Test Data Retention System
 * ===========================
 * Tests configuration, manual cleanup, audit trail, and health checks
 * 
 * Usage: pnpm exec tsx scripts/test-data-retention.ts
 * 
 * Requirements:
 * - Local Supabase instance running (pnpm dlx supabase start)
 * - SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

// =====================================================
// Configuration
// =====================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error("❌ Missing environment variables:");
    console.error("   - NEXT_PUBLIC_SUPABASE_URL");
    console.error("   - SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

// =====================================================
// Test Utilities
// =====================================================

function log(emoji: string, message: string, data?: unknown) {
    console.log(`${emoji} ${message}`);
    if (data) {
        console.log(JSON.stringify(data, null, 2));
    }
    console.log();
}

async function assert(condition: boolean, message: string) {
    if (!condition) {
        console.error(`❌ ASSERTION FAILED: ${message}`);
        process.exit(1);
    }
}

// =====================================================
// Test 1: Configuration
// =====================================================

async function testConfiguration() {
    log("📋", "TEST 1: Configuration");

    const { data: configs, error } = await supabase
        .from("data_retention_config")
        .select("*")
        .order("table_name");

    await assert(!error, "Should fetch configurations without error");
    await assert(
        !!configs && configs.length >= 4,
        "Should have at least 4 default configs"
    );

    log("✅", "Configuration test passed", {
        total_configs: configs?.length,
        tables: configs?.map((c) => c.table_name),
    });

    return configs;
}

// =====================================================
// Test 2: Insert Test Data (Expired)
// =====================================================

async function insertTestData() {
    log("🧪", "TEST 2: Inserting test data (expired)");

    // Insert expired audit logs
    const { data: auditLogs, error: auditError } = await supabase
        .from("logs_audit")
        .insert([
            {
                user_id: "00000000-0000-0000-0000-000000000001",
                action: "test_action_1",
                table_name: "test_table",
                created_at: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(), // 200 days ago
                expires_at: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(), // Expired 100 days ago (> 90 retention)
            },
            {
                user_id: "00000000-0000-0000-0000-000000000002",
                action: "test_action_2",
                table_name: "test_table",
                created_at: new Date(Date.now() - 195 * 24 * 60 * 60 * 1000).toISOString(),
                expires_at: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000).toISOString(), // Expired 95 days ago (> 90 retention)
            },
        ])
        .select();

    await assert(!auditError, "Should insert test audit logs");

    log("✅", "Test data inserted", {
        audit_logs_inserted: auditLogs?.length,
    });
}

// =====================================================
// Test 3: Manual Cleanup Execution
// =====================================================

async function testManualCleanup() {
    log("🗑️", "TEST 3: Manual cleanup execution");

    // Test logs_audit cleanup
    const { data: cleanupResult, error: cleanupError } = await supabase.rpc(
        "cleanup_expired_data",
        {
            p_table_name: "logs_audit",
        }
    );

    await assert(!cleanupError, "Cleanup should execute without error");
    await assert(cleanupResult !== null, "Cleanup should return result");
    await assert(
        cleanupResult.status === "success",
        "Cleanup status should be success"
    );
    await assert(
        cleanupResult.deleted >= 2,
        "Should delete at least 2 test rows"
    );

    log("✅", "Manual cleanup test passed", cleanupResult);

    return cleanupResult;
}

// =====================================================
// Test 4: Audit Trail Verification
// =====================================================

async function testAuditTrail() {
    log("📊", "TEST 4: Audit trail verification");

    const { data: auditLogs, error } = await supabase
        .from("data_retention_audit")
        .select("*")
        .order("executed_at", { ascending: false })
        .limit(5);

    await assert(!error, "Should fetch audit logs");
    await assert(
        !!auditLogs && auditLogs.length > 0,
        "Should have at least one audit log"
    );

    const latestLog = auditLogs![0];
    await assert(
        latestLog.table_name === "logs_audit",
        "Latest log should be for logs_audit"
    );
    await assert(latestLog.status === "success", "Status should be success");
    await assert(
        latestLog.rows_deleted >= 0,
        "Should have rows_deleted count"
    );

    log("✅", "Audit trail test passed", {
        total_logs: auditLogs?.length,
        latest_log: latestLog,
    });
}

// =====================================================
// Test 5: Health Check
// =====================================================

async function testHealthCheck() {
    log("🏥", "TEST 5: Health check");

    const { data: healthIssues, error } = await supabase.rpc(
        "check_retention_health"
    );

    await assert(!error, "Health check should execute without error");

    if (healthIssues && healthIssues.length > 0) {
        log("⚠️", "Health issues detected:", healthIssues);
    } else {
        log("✅", "No health issues detected - system healthy");
    }
}

// =====================================================
// Test 6: Monitoring Views
// =====================================================

async function testMonitoringViews() {
    log("👀", "TEST 6: Monitoring views");

    const { data: monitoring, error } = await supabase
        .from("data_retention_monitoring")
        .select("*");

    await assert(!error, "Should fetch monitoring view");
    await assert(!!monitoring && monitoring.length > 0, "Should have monitoring data");

    log("✅", "Monitoring view test passed", {
        total_tables: monitoring?.length,
        sample: monitoring?.[0],
    });

    // Test stats view
    const { data: stats, error: statsError } = await supabase
        .from("data_retention_stats")
        .select("*");

    await assert(!statsError, "Should fetch stats view");

    log("✅", "Stats view test passed", {
        total_tables: stats?.length,
    });
}

// =====================================================
// Test 7: Specific Function Tests
// =====================================================

async function testSpecificFunctions() {
    log("🎯", "TEST 7: Specific cleanup functions");

    // Test newsletter cleanup (will delete 0 if no expired unsubscribes)
    const { data: newsletterResult, error: newsletterError } = await supabase.rpc(
        "cleanup_unsubscribed_newsletter"
    );

    await assert(!newsletterError, "Newsletter cleanup should execute");
    log("✅", "Newsletter cleanup passed", newsletterResult);

    // Test contact messages cleanup (will delete 0 if no old messages)
    const { data: contactResult, error: contactError } = await supabase.rpc(
        "cleanup_old_contact_messages"
    );

    await assert(!contactError, "Contact cleanup should execute");
    log("✅", "Contact messages cleanup passed", contactResult);
}

// =====================================================
// Test 8: Configuration Updates
// =====================================================

async function testConfigurationUpdates() {
    log("⚙️", "TEST 8: Configuration updates");

    // Test toggling enabled status
    const { data: beforeToggle, error: fetchError } = await supabase
        .from("data_retention_config")
        .select("enabled")
        .eq("table_name", "analytics_events")
        .single();

    await assert(!fetchError, "Should fetch config");

    const originalState = beforeToggle!.enabled;

    // Toggle off
    const { error: updateError } = await supabase
        .from("data_retention_config")
        .update({ enabled: false })
        .eq("table_name", "analytics_events");

    await assert(!updateError, "Should update config");

    // Verify
    const { data: afterToggle, error: verifyError } = await supabase
        .from("data_retention_config")
        .select("enabled")
        .eq("table_name", "analytics_events")
        .single();

    await assert(!verifyError, "Should fetch updated config");
    await assert(afterToggle!.enabled === false, "Should be disabled");

    // Restore original state
    await supabase
        .from("data_retention_config")
        .update({ enabled: originalState })
        .eq("table_name", "analytics_events");

    log("✅", "Configuration update test passed");
}

// =====================================================
// Main Test Runner
// =====================================================

async function runAllTests() {
    console.log("=".repeat(60));
    console.log("🧪 DATA RETENTION SYSTEM TEST SUITE");
    console.log("=".repeat(60));
    console.log();

    try {
        await testConfiguration();
        await insertTestData();
        await testManualCleanup();
        await testAuditTrail();
        await testHealthCheck();
        await testMonitoringViews();
        await testSpecificFunctions();
        await testConfigurationUpdates();

        console.log("=".repeat(60));
        console.log("✅ ALL TESTS PASSED");
        console.log("=".repeat(60));
    } catch (error) {
        console.error("=".repeat(60));
        console.error("❌ TEST SUITE FAILED");
        console.error("=".repeat(60));
        console.error(error);
        process.exit(1);
    }
}

// Run tests
runAllTests();
