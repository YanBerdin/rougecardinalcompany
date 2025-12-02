#!/usr/bin/env tsx
/**
 * Script pour créer un utilisateur admin local
 * Usage: pnpm exec tsx scripts/create-local-admin.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SECRET_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createLocalAdmin() {
  const email = 'yandevformation@gmail.com';
  const password = 'admin123'; // Changez ce mot de passe !

  console.log('🔧 Creating local admin user...\n');

  try {
    // 1. Créer l'utilisateur dans auth.users
    console.log('📝 Step 1: Creating auth user...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: {
        role: 'admin',
      },
      user_metadata: {
        role: 'admin',
      },
    });

    if (authError) {
      // Si l'utilisateur existe déjà, récupérer son ID
      if (authError.message.includes('already registered')) {
        console.log('⚠️  User already exists, fetching ID...');
        const { data: users, error: listError } = await supabase.auth.admin.listUsers();
        
        if (listError) throw listError;
        
        const existingUser = users.users.find(u => u.email === email);
        if (!existingUser) throw new Error('User exists but could not be found');

        console.log(`✅ Found existing user: ${existingUser.id}`);

        // Mettre à jour les metadata
        console.log('🔄 Updating user metadata...');
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          existingUser.id,
          {
            app_metadata: { role: 'admin' },
            user_metadata: { role: 'admin' },
          }
        );

        if (updateError) throw updateError;

        // 2. Créer ou mettre à jour le profil
        console.log('\n📝 Step 2: Creating/updating profile...');
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            user_id: existingUser.id,
            role: 'admin',
            display_name: 'Admin',
          }, {
            onConflict: 'user_id',
          });

        if (profileError) throw profileError;

        console.log('\n✅ SUCCESS! Admin user updated:\n');
        console.log(`   📧 Email: ${email}`);
        console.log(`   🔑 Password: ${password}`);
        console.log(`   👤 User ID: ${existingUser.id}`);
        console.log(`   🔐 Role: admin (in app_metadata, user_metadata, and profiles.role)`);
        return;
      }
      
      throw authError;
    }

    if (!authData.user) {
      throw new Error('User creation succeeded but no user returned');
    }

    console.log(`✅ Auth user created: ${authData.user.id}`);

    // 2. Créer le profil dans public.profiles
    console.log('\n📝 Step 2: Creating profile...');
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        role: 'admin',
        display_name: 'Admin',
      });

    if (profileError) {
      console.error('❌ Profile creation failed:', profileError);
      throw profileError;
    }

    console.log('✅ Profile created');

    // 3. Vérifier que tout est OK
    console.log('\n📝 Step 3: Verifying setup...');
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();

    console.log('\n✅ SUCCESS! Admin user created:\n');
    console.log(`   📧 Email: ${email}`);
    console.log(`   🔑 Password: ${password}`);
    console.log(`   👤 User ID: ${authData.user.id}`);
    console.log(`   🔐 Role: admin (in app_metadata, user_metadata, and profiles.role)`);
    console.log(`   📋 Profile:`, profile);

    console.log('\n🚀 Next steps:');
    console.log('   1. Go to http://localhost:3000/auth/login');
    console.log(`   2. Login with: ${email} / ${password}`);
    console.log('   3. Access admin dashboard: http://localhost:3000/admin');

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

createLocalAdmin();
