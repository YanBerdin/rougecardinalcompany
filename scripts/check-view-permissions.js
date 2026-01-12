/**
 * Script pour donner les permissions admin sur les vues
 * et vérifier la configuration RLS
 */
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });
dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error('Missing required env variables');
}

const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function checkViewPermissions() {
  console.log('🔍 Vérification des vues admin\n');

  // 1. Lister toutes les vues
  console.log('1️⃣ Vues existantes:');
  const { data: views, error: viewsError } = await adminClient
    .from('information_schema.views')
    .select('table_schema, table_name')
    .or('table_name.eq.communiques_presse_dashboard,table_name.eq.analytics_summary');

  if (viewsError) {
    console.log('⚠️  Erreur lors de la récupération des vues');
    console.log('   Utilisation de requête directe SQL...\n');
    
    // Essayer avec une requête RPC custom
    const viewNames = [
      'communiques_presse_dashboard',
      'analytics_summary',
      'spectacles_publics',
      'evenements_agenda',
    ];

    for (const viewName of viewNames) {
      const { count, error } = await adminClient
        .from(viewName)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${viewName}: ${error.message}`);
      } else {
        console.log(`✅ ${viewName}: ${count ?? 0} ligne(s)`);
      }
    }
  } else {
    console.log(views);
  }

  // 2. Vérifier les définitions des vues dans les schémas
  console.log('\n2️⃣ Vérification des fichiers schéma:');
  const schemaFiles = [
    'supabase/schemas/41_views_communiques.sql',
    'supabase/schemas/13_analytics_events.sql',
  ];

  console.log('   Fichiers à vérifier:');
  schemaFiles.forEach((file) => console.log(`   - ${file}`));

  // 3. Instructions de correction
  console.log('\n3️⃣ SOLUTION:');
  console.log('   Le problème vient de auth.uid() qui retourne NULL avec service role.');
  console.log('   La fonction is_admin() ne peut pas détecter l\'admin dans ce contexte.\n');

  console.log('   Pour tester avec un utilisateur authentifié:');
  console.log('   1. Connectez-vous sur /admin/debug-auth');
  console.log('   2. La page affichera is_admin() = TRUE si le profil a role=\'admin\'');
  console.log('   3. Les vues admin seront accessibles si les policies sont correctes\n');

  console.log('   Pour corriger les vues admin, vérifiez:');
  console.log('   - Les vues ont SECURITY INVOKER (pas DEFINER)');
  console.log('   - Les policies utilisent: (select public.is_admin())');
  console.log('   - Les GRANTs donnent accès à authenticated role');
}

checkViewPermissions().catch(console.error);
