#!/usr/bin/env tsx
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { env } from '../lib/env';

const adminClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY);

async function main() {
    const email = process.env.EMAIL || process.argv[2];
    if (!email) {
        console.error('Usage: EMAIL=foo@bar pnpm exec tsx scripts/inspect-user.ts');
        process.exit(1);
    }

    const { data } = await adminClient.auth.admin.listUsers();
    const user = data.users.find(u => u.email === email);
    if (!user) {
        console.error('User not found:', email);
        process.exit(1);
    }

    console.log('User id:', user.id);
    console.log('Email:', user.email);
    console.log('App metadata:', JSON.stringify(user.app_metadata, null, 2));
    console.log('User metadata:', JSON.stringify(user.user_metadata, null, 2));
}

main().catch(e => { console.error(e); process.exit(1); });
