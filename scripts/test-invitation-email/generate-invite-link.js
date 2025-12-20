#!/usr/bin/env node
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });
dotenv.config();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node scripts/generate-invite-link.js user@example.com');
    process.exit(2);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000/auth/setup-account';

  if (!url || !serviceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in environment.');
    process.exit(2);
  }

  const supabase = createClient(url, serviceKey);

  try {
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'invite',
      email,
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error) {
      console.error('generateLink error:', error);
      process.exit(3);
    }

    console.log('Invite link generated:');
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Unexpected error:', err?.message ?? err);
    process.exit(4);
  }
}

main();
