#!/usr/bin/env tsx
/**
 * Test TASK033 - Audit Logs on Production Cloud
 * 
 * Verifies that the migration was successfully applied to the cloud database.
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
  log('yellow', '   TASK033 - Cloud Database Verification');
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
  
  log('cyan', `\n🌐 Testing Cloud Database: ${supabaseUrl}`);
  
  // Create service role client (cloud database)
  const supabase = createClient(
    supabaseUrl,
    supabaseKey,
    {
      auth: { persistSession: false }
    }
  );
  
  log('cyan', '\n🔍 TEST 1: Check expires_at column on CLOUD');
  
  try {
    // Try to select expires_at from logs_audit
    const { data, error } = await supabase
      .from('logs_audit')
      .select('id, expires_at')
      .limit(1);
    
    if (error) {
      log('red', `❌ Failed: ${error.message}`);
    } else {
      log('green', '✅ expires_at column exists on cloud');
      if (data && data.length > 0) {
        log('blue', `   Sample expires_at: ${data[0].expires_at}`);
      } else {
        log('blue', '   No data yet (table empty)');
      }
    }
  } catch (error) {
    log('red', `❌ Error: ${error instanceof Error ? error.message : 'Unknown'}`);
  }
  
  log('cyan', '\n🔍 TEST 2: Check logs_audit table access on CLOUD');
  log('blue', '   (Note: get_audit_logs_with_email RPC requires auth.uid() → cannot be called');
  log('blue', '    from a service-role-only context. Querying table directly instead.)');
  
  try {
    const { data, error, count } = await supabase
      .from('logs_audit')
      .select('id, action, table_name, created_at, expires_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      log('red', `❌ Table query failed: ${error.message}`);
    } else {
      log('green', '✅ logs_audit table is accessible via service role');
      log('blue', `   Total rows: ${count ?? 0}`);
      log('blue', `   Rows returned: ${data?.length ?? 0}`);
      
      if (data && data.length > 0) {
        const firstLog = data[0];
        log('blue', `   Sample: ${firstLog.action} on ${firstLog.table_name} at ${firstLog.created_at}`);
      }
    }
  } catch (error) {
    log('red', `❌ Error: ${error instanceof Error ? error.message : 'Unknown'}`);
  }
  
  log('cyan', '\n🔍 TEST 3: Check cleanup function on CLOUD');
  
  try {
    const { data, error } = await supabase
      .rpc('cleanup_expired_audit_logs');
    
    if (error) {
      log('red', `❌ Cleanup function failed: ${error.message}`);
    } else {
      log('green', '✅ cleanup_expired_audit_logs function works on cloud');
      log('blue', `   Deleted ${data || 0} expired log(s)`);
    }
  } catch (error) {
    log('red', `❌ Error: ${error instanceof Error ? error.message : 'Unknown'}`);
  }
  
  log('yellow', '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('green', '✨ Cloud database tests completed!');
  log('cyan', '\n📋 Next steps:');
  log('blue', '   1. Deploy to production (Vercel)');
  log('blue', '   2. Test UI at https://your-domain.com/admin/audit-logs');
  log('blue', '   3. Verify filters, pagination, and CSV export work');
  log('blue', '   4. Set up cron job for cleanup_expired_audit_logs()');
  log('yellow', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch((error) => {
  log('red', `\n❌ Fatal error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  process.exit(1);
});
