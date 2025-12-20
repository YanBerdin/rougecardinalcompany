#!/usr/bin/env node
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// load .env.local first if present, then fallback to .env
dotenv.config({ path: '.env.local' });
dotenv.config();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node scripts/find-auth-user.js user@example.com');
    process.exit(2);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

  if (!url || !serviceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in environment.');
    process.exit(2);
  }

  const supabase = createClient(url, serviceKey);

  const perPage = 1000;
  let page = 1;
  console.log(`Searching for email: ${email}`);

  while (true) {
    try {
      // use admin.listUsers with pagination
      const res = await supabase.auth.admin.listUsers({ page, perPage });
      const users = res.data?.users ?? [];

      for (const u of users) {
        if (u.email && u.email.toLowerCase() === email.toLowerCase()) {
          console.log('FOUND');
          console.log(JSON.stringify({ id: u.id, email: u.email, created_at: u.created_at, email_confirmed_at: u.email_confirmed_at, last_sign_in_at: u.last_sign_in_at, app_metadata: u.app_metadata, user_metadata: u.user_metadata }, null, 2));
          process.exit(0);
        }
      }

      if (users.length < perPage) break;
      page += 1;
    } catch (err) {
      console.error('Error calling admin.listUsers:', err?.message ?? err);
      process.exit(3);
    }
  }

  console.log('NOT FOUND');
  process.exit(0);
}

main();
