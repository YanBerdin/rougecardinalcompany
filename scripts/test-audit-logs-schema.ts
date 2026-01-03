#!/usr/bin/env tsx
/**
 * Test script for TASK033 - Audit Logs Database Schema
 * 
 * Verifies:
 * 1. expires_at column exists
 * 2. RPC function get_audit_logs_with_email exists
 * 3. Basic data retrieval works
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

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

async function main() {
  log('yellow', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('yellow', '   TASK033 - Database Schema Verification');
  log('yellow', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    log('red', '❌ Missing environment variables');
    log('yellow', 'Make sure .env.local contains:');
    log('blue', '   NEXT_PUBLIC_SUPABASE_URL');
    log('blue', '   SUPABASE_SECRET_KEY');
    process.exit(1);
  }
  
  // Create service role client (bypasses RLS for testing)
  const supabase = createClient(
    supabaseUrl,
    supabaseKey,
    {
      auth: { persistSession: false }
    }
  );
  
  log('cyan', '\n🔍 TEST 1: Check expires_at column');
  
  try {
    // Try to select expires_at from logs_audit
    const { data, error } = await supabase
      .from('logs_audit')
      .select('id, expires_at')
      .limit(1);
    
    if (error) {
      log('red', `❌ Failed: ${error.message}`);
    } else {
      log('green', '✅ expires_at column exists');
      if (data && data.length > 0) {
        log('blue', `   Sample expires_at: ${data[0].expires_at}`);
      }
    }
  } catch (error) {
    log('red', `❌ Error: ${error instanceof Error ? error.message : 'Unknown'}`);
  }
  
  log('cyan', '\n🔍 TEST 2: Check RPC function');
  
  try {
    const { data, error } = await supabase
      .rpc('get_audit_logs_with_email', {
        p_action: null,
        p_table_name: null,
        p_user_id: null,
        p_date_from: null,
        p_date_to: null,
        p_search: null,
        p_page: 1,
        p_limit: 5
      });
    
    if (error) {
      log('red', `❌ RPC failed: ${error.message}`);
    } else {
      log('green', '✅ get_audit_logs_with_email RPC works');
      log('blue', `   Total count: ${data?.total_count || 0}`);
      log('blue', `   Logs returned: ${data?.logs?.length || 0}`);
      
      if (data?.logs && data.logs.length > 0) {
        const firstLog = data.logs[0];
        log('blue', `   Sample: ${firstLog.action} on ${firstLog.table_name} by ${firstLog.user_email || 'unknown'}`);
      }
    }
  } catch (error) {
    log('red', `❌ Error: ${error instanceof Error ? error.message : 'Unknown'}`);
  }
  
  log('cyan', '\n🔍 TEST 3: Get distinct table names');
  
  try {
    const { data, error } = await supabase
      .from('logs_audit')
      .select('table_name')
      .order('table_name');
    
    if (error) {
      log('red', `❌ Failed: ${error.message}`);
    } else {
      const uniqueTables = [...new Set(data?.map(row => row.table_name) || [])];
      log('green', '✅ Table names retrieved');
      log('blue', `   Tables with logs: ${uniqueTables.join(', ')}`);
    }
  } catch (error) {
    log('red', `❌ Error: ${error instanceof Error ? error.message : 'Unknown'}`);
  }
  
  log('cyan', '\n🔍 TEST 4: Test filtering by action');
  
  try {
    const { data, error } = await supabase
      .rpc('get_audit_logs_with_email', {
        p_action: 'INSERT',
        p_table_name: null,
        p_user_id: null,
        p_date_from: null,
        p_date_to: null,
        p_search: null,
        p_page: 1,
        p_limit: 5
      });
    
    if (error) {
      log('red', `❌ Failed: ${error.message}`);
    } else {
      log('green', '✅ Action filter works');
      log('blue', `   INSERT actions found: ${data?.total_count || 0}`);
    }
  } catch (error) {
    log('red', `❌ Error: ${error instanceof Error ? error.message : 'Unknown'}`);
  }
  
  log('yellow', '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('green', '✨ Database schema tests completed!');
  log('cyan', '\n📋 Next steps:');
  log('blue', '   1. Start dev server: pnpm dev');
  log('blue', '   2. Login as admin user');
  log('blue', '   3. Visit http://localhost:3001/admin/audit-logs');
  log('blue', '   4. Test UI filters, pagination, and CSV export');
  log('yellow', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch((error) => {
  log('red', `\n❌ Fatal error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  process.exit(1);
});
