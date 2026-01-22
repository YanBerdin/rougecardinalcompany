#!/usr/bin/env tsx
/**
 * Script pour créer l'utilisateur admin LOCAL (Supabase dev)
 * Usage: pnpm exec tsx scripts/create-admin-user-local.ts
 * 
 * ⚠️ Ce script utilise les credentials Supabase LOCAL (http://127.0.0.1:54321)
 * 
 * Configuration:
 * 1. Créer un fichier .env.local à la racine du projet
 * 2. Ajouter les variables:
 *    SUPABASE_LOCAL_URL=http://127.0.0.1:54321
 *    SUPABASE_LOCAL_SERVICE_KEY=<votre_service_key_local>
 * 
 * Pour obtenir le service key local:
 * $ supabase status
 * service_role key: sb_secret_...
 */
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

// ✅ Credentials LOCAL depuis .env.local
const SUPABASE_URL = process.env.SUPABASE_LOCAL_URL;
const SERVICE_KEY = process.env.SUPABASE_LOCAL_SERVICE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('❌ Missing environment variables!');
    console.error('Please create a .env.local file with:');
    console.error('  SUPABASE_LOCAL_URL=http://127.0.0.1:54321');
    console.error('  SUPABASE_LOCAL_SERVICE_KEY=<your_service_key>');
    console.error('\nTo get the service key, run: supabase status');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

async function createAdminUser() {
    const email = 'yandevformation@gmail.com';
    const password = 'AdminRouge2025!'; // Mot de passe temporaire

    console.log('🔧 Creating admin user in LOCAL Supabase...\n');
    console.log(`🌐 URL: ${SUPABASE_URL}`);
    console.log(`📧 Email: ${email}\n`);

    try {
        // 1. Vérifier si l'utilisateur existe déjà
        console.log('📝 Step 1: Checking if user exists...');
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

        if (listError) throw listError;

        const existingUser = users.find(u => u.email === email);

        if (existingUser) {
            console.log(`⚠️  User ${email} already exists with ID: ${existingUser.id}`);
            console.log('\n🔄 Updating existing user to admin...');

            // Mettre à jour l'utilisateur existant
            const { error: updateError } = await supabase.auth.admin.updateUserById(
                existingUser.id,
                {
                    app_metadata: { role: 'admin' },
                    user_metadata: { role: 'admin' },
                    email_confirm: true,
                }
            );

            if (updateError) throw updateError;

            console.log('✅ User updated to admin');

            // Créer/mettre à jour le profil
            console.log('\n📝 Step 2: Creating/updating profile...');
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    user_id: existingUser.id,
                    display_name: 'Administrateur',
                    role: 'admin',
                }, {
                    onConflict: 'user_id'
                });

            if (profileError) throw profileError;

            console.log('✅ Profile created/updated');

            // Vérifier
            const { data: profile } = await supabase
                .from('profiles')
                .select('user_id, role, display_name')
                .eq('user_id', existingUser.id)
                .single();

            console.log('\n✅ SUCCESS! Admin user configured:');
            console.log(`\n   📧 Email: ${email}`);
            console.log(`   👤 User ID: ${existingUser.id}`);
            console.log(`   🔐 Profile role: ${profile?.role || 'MISSING!'}`);
            console.log(`   📝 Display name: ${profile?.display_name || 'MISSING!'}`);
            console.log(`\n🚀 Studio URL: http://127.0.0.1:54323/project/default/auth/users`);

            return;
        }

        // 2. Créer le nouvel utilisateur
        console.log('📝 Step 1: Creating new user...');
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm l'email
            app_metadata: { role: 'admin' },
            user_metadata: { role: 'admin' },
        });

        if (createError) throw createError;
        if (!newUser.user) {
            throw new Error('User creation returned no user object');
        }

        console.log(`✅ User created: ${newUser.user.id}`);

// 3. Créer/mettre à jour le profil dans public.profiles
    console.log('\n📝 Step 2: Creating/updating profile in public.profiles...');
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        user_id: newUser.user.id,
        display_name: 'Administrateur',
        role: 'admin',
      }, {
        onConflict: 'user_id'
            });

        if (profileError) throw profileError;

        console.log('✅ Profile created');

        // 4. Vérifier que tout est OK
        console.log('\n📝 Step 3: Verifying...');

        const { data: profile, error: verifyError } = await supabase
            .from('profiles')
            .select('user_id, role, display_name')
            .eq('user_id', newUser.user.id)
            .single();

        if (verifyError) throw verifyError;

        console.log('\n✅ SUCCESS! Admin user created:');
        console.log(`\n   📧 Email: ${email}`);
        console.log(`   🔒 Password: ${password} (CHANGE THIS AFTER FIRST LOGIN!)`);
        console.log(`   👤 User ID: ${newUser.user.id}`);
        console.log(`   🔐 Profile role: ${profile.role}`);
        console.log(`   📝 Display name: ${profile.display_name}`);
        console.log('\n🚀 Next steps:');
        console.log('   1. Login with these credentials');
        console.log('   2. Access admin dashboard: http://localhost:3000/admin');
        console.log('   3. Studio URL: http://127.0.0.1:54323/project/default/auth/users');

    } catch (error) {
        console.error('\n❌ Error:', error);
        process.exit(1);
    }
}

createAdminUser();
