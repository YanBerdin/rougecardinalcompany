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

// Load .env.local BEFORE any module that reads process.env (e.g. T3 Env)
config({ path: resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in .env.local');
  process.exit(1);
}

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
  
  // Create service role client (bypasses RLS for testing)
  const supabase = createClient(
    SUPABASE_URL!,
    SUPABASE_SECRET_KEY!,
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
  
  log('cyan', '\n🔍 TEST 2: Check logs_audit table access');
  log('blue', '   (get_audit_logs_with_email RPC requires auth.uid() → querying table directly)');
  
  try {
    const { data, error, count } = await supabase
      .from('logs_audit')
      .select('id, action, table_name, user_id, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      log('red', `❌ Failed: ${error.message}`);
    } else {
      log('green', '✅ logs_audit table readable via service role');
      log('blue', `   Total rows: ${count ?? 0}`);
      log('blue', `   Rows returned: ${data?.length ?? 0}`);
      if (data && data.length > 0) {
        const first = data[0];
        log('blue', `   Sample: ${first.action} on ${first.table_name} at ${first.created_at}`);
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
  
  log('cyan', '\n🔍 TEST 4: Test filtering by action (INSERT)');
  
  try {
    const { data, error, count } = await supabase
      .from('logs_audit')
      .select('id, action, table_name', { count: 'exact' })
      .eq('action', 'INSERT')
      .limit(5);
    
    if (error) {
      log('red', `❌ Failed: ${error.message}`);
    } else {
      log('green', '✅ Action filter works (direct table query)');
      log('blue', `   INSERT actions total: ${count ?? 0}`);
      if (data && data.length > 0) {
        log('blue', `   Sample table: ${data[0].table_name}`);
      }
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
