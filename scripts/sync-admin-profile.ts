#!/usr/bin/env tsx
/**
 * Script pour créer/mettre à jour le profil admin dans public.profiles
 * Usage: pnpm exec tsx scripts/sync-admin-profile.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function syncAdminProfile() {
  const email = 'yandevformation@gmail.com';

  console.log('🔧 Syncing admin profile...\n');

  try {
    // 1. Récupérer l'utilisateur
    console.log('📝 Step 1: Finding user...');
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) throw listError;
    
    const user = users.find(u => u.email === email);
    if (!user) {
      console.error(`❌ User ${email} not found in auth.users`);
      process.exit(1);
    }

    console.log(`✅ Found user: ${user.id}`);

    // 2. Mettre à jour app_metadata et user_metadata
    console.log('\n📝 Step 2: Updating user metadata...');
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        app_metadata: { role: 'admin' },
        user_metadata: { role: 'admin' },
      }
    );

    if (updateError) throw updateError;
    console.log('✅ Metadata updated');

    // 3. Créer/mettre à jour le profil
    console.log('\n📝 Step 3: Creating/updating profile in public.profiles...');
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        user_id: user.id,
        role: 'admin',
        display_name: 'Admin',
      }, {
        onConflict: 'user_id',
      });

    if (profileError) throw profileError;
    console.log('✅ Profile synced');

    // 4. Vérifier
    console.log('\n📝 Step 4: Verifying...');
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    console.log('\n✅ SUCCESS! Admin profile synced:\n');
    console.log(`   📧 Email: ${email}`);
    console.log(`   👤 User ID: ${user.id}`);
    console.log(`   🔐 app_metadata.role: admin`);
    console.log(`   🔐 user_metadata.role: admin`);
    console.log(`   🔐 profiles.role: ${profile?.role}`);

    console.log('\n🚀 Next steps:');
    console.log('   1. Logout from the app if you are logged in');
    console.log('   2. Login again to get a new JWT token with role: admin');
    console.log('   3. Access admin dashboard: http://localhost:3000/admin');

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

syncAdminProfile();
