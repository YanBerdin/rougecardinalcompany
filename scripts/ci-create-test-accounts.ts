/**
 * CI Script: Create E2E test accounts in Supabase local
 *
 * Reads E2E_*_EMAIL / E2E_*_PASSWORD from environment variables,
 * creates (or updates) the 3 test accounts via the Supabase Admin API.
 * Idempotent — safe to run multiple times.
 *
 * Usage: npx tsx scripts/ci-create-test-accounts.ts
 */
import { createClient } from '@supabase/supabase-js';
import { config as loadDotenv } from 'dotenv';

loadDotenv({ path: '.env.test.local' });
loadDotenv({ path: '.env.e2e' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    '❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY',
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

type TestAccount = {
  email: string;
  password: string;
  role: 'admin' | 'editor' | 'user';
};

function buildAccounts(): TestAccount[] {
  const required = [
    ['E2E_ADMIN_EMAIL', 'E2E_ADMIN_PASSWORD', 'admin'],
    ['E2E_EDITOR_EMAIL', 'E2E_EDITOR_PASSWORD', 'editor'],
    ['E2E_USER_EMAIL', 'E2E_USER_PASSWORD', 'user'],
  ] as const;

  return required.map(([emailKey, passKey, role]) => {
    const email = process.env[emailKey];
    const password = process.env[passKey];

    if (!email || !password) {
      console.error(`❌ Missing env: ${emailKey} or ${passKey}`);
      process.exit(1);
    }

    return { email, password, role };
  });
}

async function upsertAccount(account: TestAccount): Promise<void> {
  const { data: listData, error: listError } =
    await supabase.auth.admin.listUsers();

  if (listError) {
    throw new Error(`Failed to list users: ${listError.message}`);
  }

  const existing = listData.users.find((u) => u.email === account.email);

  if (existing) {
    const { error } = await supabase.auth.admin.updateUserById(existing.id, {
      password: account.password,
      app_metadata: { role: account.role },
      user_metadata: { role: account.role },
    });

    if (error) {
      throw new Error(`Failed to update ${account.email}: ${error.message}`);
    }

    console.log(`✅ Updated: ${account.email} (role=${account.role})`);
  } else {
    const { error } = await supabase.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true,
      app_metadata: { role: account.role },
      user_metadata: { role: account.role },
    });

    if (error) {
      throw new Error(`Failed to create ${account.email}: ${error.message}`);
    }

    console.log(`✅ Created: ${account.email} (role=${account.role})`);
  }
}

async function main(): Promise<void> {
  const accounts = buildAccounts();

  for (const account of accounts) {
    await upsertAccount(account);
  }

  console.log('\n✅ All test accounts ready');
}

main().catch((err: unknown) => {
  console.error(
    '❌ Fatal error:',
    err instanceof Error ? err.message : err,
  );
  process.exit(1);
});
