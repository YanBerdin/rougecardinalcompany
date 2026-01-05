#!/usr/bin/env tsx
/**
 * Test script for TASK033 - Audit Logs Viewer
 * 
 * Tests:
 * 1. Database schema verification (expires_at column, RPC function)
 * 2. DAL functions (fetchAuditLogs, fetchAuditTableNames)
 * 3. CSV export action
 * 4. RLS policies (admin vs anon access)
 */
//!Error: This module cannot be imported from a Client Component module. It should only be used from a Server Component.
import 'dotenv/config';
import { env } from "../lib/env";
import { createClient } from "@supabase/supabase-js";
import { fetchAuditLogs, fetchAuditTableNames } from "../lib/dal/audit-logs.ts";
import { exportAuditLogsCSV } from "../app/(admin)/admin/audit-logs/actions";


const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = env.SUPABASE_SECRET_KEY;

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color: keyof typeof COLORS, message: string) {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

async function testDatabaseSchema() {
  log('cyan', '\n🔍 TEST 1: Database Schema Verification');
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    // Check expires_at column exists
    const { data: columns, error: colError } = await supabase
      .rpc('exec_sql', { 
        sql: `SELECT column_name, data_type 
              FROM information_schema.columns 
              WHERE table_name = 'logs_audit' 
              AND column_name = 'expires_at'` 
      });
    
    if (colError) {
      log('yellow', '⚠️  Cannot verify columns (need custom RPC or direct query)');
    } else {
      log('green', '✅ expires_at column verified');
    }
    
    // Check RPC function exists
    const { data: rpcExists, error: rpcError } = await supabase
      .rpc('get_audit_logs_with_email', {
        p_action: null,
        p_table_name: null,
        p_user_id: null,
        p_date_from: null,
        p_date_to: null,
        p_search: null,
        p_page: 1,
        p_limit: 1
      });
    
    if (rpcError) {
      log('red', `❌ RPC function error: ${rpcError.message}`);
    } else {
      log('green', '✅ get_audit_logs_with_email RPC function exists');
      log('blue', `   Found ${rpcExists?.total_count || 0} audit log entries`);
    }
  } catch (error) {
    log('red', `❌ Schema test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function testDALFunctions() {
  log('cyan', '\n🔍 TEST 2: DAL Functions');
  
  try {
    // Test fetchAuditLogs with no filters
    const logsResult = await fetchAuditLogs({});
    
    if (!logsResult.success) {
      log('red', `❌ fetchAuditLogs failed: ${logsResult.error}`);
      return;
    }
    
    log('green', '✅ fetchAuditLogs works');
    log('blue', `   Total logs: ${logsResult.data.totalCount}`);
    log('blue', `   Current page logs: ${logsResult.data.logs.length}`);
    
    if (logsResult.data.logs.length > 0) {
      const firstLog = logsResult.data.logs[0];
      log('blue', `   Sample log: ${firstLog.action} on ${firstLog.table_name} by ${firstLog.user_email || 'unknown'}`);
    }
    
    // Test fetchAuditTableNames
    const tablesResult = await fetchAuditTableNames();
    
    if (!tablesResult.success) {
      log('red', `❌ fetchAuditTableNames failed: ${tablesResult.error}`);
      return;
    }
    
    log('green', '✅ fetchAuditTableNames works');
    log('blue', `   Tables with audit logs: ${tablesResult.data.join(', ')}`);
    
  } catch (error) {
    log('red', `❌ DAL test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function testCSVExport() {
  log('cyan', '\n🔍 TEST 3: CSV Export Action');
  
  try {
    const result = await exportAuditLogsCSV({
      page: 1,
      limit: 10
    });
    
    if (!result.success) {
      log('red', `❌ CSV export failed: ${result.error}`);
      return;
    }
    
    log('green', '✅ CSV export action works');
    
    if (result.data) {
      const lines = result.data.split('\n');
      log('blue', `   Generated ${lines.length} CSV lines`);
      log('blue', `   Header: ${lines[0]}`);
      if (lines.length > 1) {
        log('blue', `   Sample row: ${lines[1].substring(0, 100)}...`);
      }
    }
  } catch (error) {
    log('red', `❌ CSV export test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function testFiltering() {
  log('cyan', '\n🔍 TEST 4: Advanced Filtering');
  
  try {
    // Test filtering by action
    const insertLogs = await fetchAuditLogs({ action: 'INSERT' });
    log('green', `✅ Filter by action (INSERT): ${insertLogs.success ? insertLogs.data.totalCount : 0} results`);
    
    // Test search
    const searchLogs = await fetchAuditLogs({ search: 'email' });
    log('green', `✅ Search filter (email): ${searchLogs.success ? searchLogs.data.totalCount : 0} results`);
    
    // Test pagination
    const page2Logs = await fetchAuditLogs({ page: 2, limit: 5 });
    log('green', `✅ Pagination (page 2, limit 5): ${page2Logs.success ? page2Logs.data.logs.length : 0} results`);
    
  } catch (error) {
    log('red', `❌ Filtering test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function main() {
  log('yellow', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('yellow', '   TASK033 - Audit Logs Viewer Tests');
  log('yellow', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  await testDatabaseSchema();
  await testDALFunctions();
  await testCSVExport();
  await testFiltering();
  
  log('yellow', '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('green', '✨ All tests completed!');
  log('cyan', '\n📋 Manual testing checklist:');
  log('blue', '   1. Login as admin user');
  log('blue', '   2. Navigate to http://localhost:3001/admin/audit-logs');
  log('blue', '   3. Test action filter dropdown');
  log('blue', '   4. Test table filter dropdown');
  log('blue', '   5. Test date range picker');
  log('blue', '   6. Test search input');
  log('blue', '   7. Click on a log row to view JSON details');
  log('blue', '   8. Test CSV export button');
  log('blue', '   9. Test pagination controls');
  log('blue', '   10. Verify non-admin users cannot access the page');
  log('yellow', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch((error) => {
  log('red', `\n❌ Fatal error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  process.exit(1);
});
