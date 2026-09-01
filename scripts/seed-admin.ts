import 'dotenv/config';

import { createClient } from '@supabase/supabase-js';
import { env } from '../lib/env.js';

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SECRET_KEY
);

/**
 * Script pour créer un administrateur par défaut après un reset de la BDD
 * Usage: pnpm exec tsx scripts/seed-admin.ts
 */
async function seedAdmin() {
  console.log('🌱 Création de l\'administrateur par défaut...');

  // Configuration de l'admin par défaut
  const adminEmail = 'admin@rougecardinal.com';
  const adminPassword = 'AdminRouge2025!';// Mot de passe temporaire - changez-le après connexion !

  try {
    // 1. Créer l'utilisateur dans Supabase Auth
    console.log(`📧 Création de l'utilisateur: ${adminEmail}`);
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // Confirmer automatiquement l'email
      user_metadata: {
        role: 'admin',
        display_name: 'Administrateur'
      },
      app_metadata: {
        role: 'admin'
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('ℹ️  L\'administrateur existe déjà, mise à jour du rôle...');

        // Récupérer l'utilisateur existant
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existingUser = existingUsers.users.find(u => u.email === adminEmail);

        if (existingUser) {
          // Promouvoir en admin
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            {
              app_metadata: { role: 'admin' },
              user_metadata: {
                ...existingUser.user_metadata,
                role: 'admin'
              }
            }
          );

          if (updateError) {
            console.error('❌ Erreur lors de la promotion:', updateError);
            return;
          }

          console.log('✅ Administrateur promu avec succès!');
          console.log(`👤 ID: ${existingUser.id}`);
          console.log(`📧 Email: ${adminEmail}`);
        }
        return;
      }

      console.error('❌ Erreur lors de la création:', authError);
      return;
    }

    console.log('✅ Administrateur créé avec succès!');
    console.log(`👤 ID: ${authData.user.id}`);
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Mot de passe: ${adminPassword}`);
    console.log('');
    console.log('🔐 Vous pouvez maintenant vous connecter avec ces identifiants.');

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

// Exécuter le script
seedAdmin();