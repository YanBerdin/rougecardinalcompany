/**
 * Script de diagnostic pour les vues admin
 * Teste la fonction is_admin() et les permissions
 */
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });
dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SECRET_KEY;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !ANON_KEY) {
  throw new Error('Missing required env variables');
}

const USER_ID = '1616b6fc-95b4-4931-b7e1-e9717def4164';

// Client avec service role (bypass RLS)
const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Client avec anon key (RLS activé)
const anonClient = createClient(SUPABASE_URL, ANON_KEY);

async function diagnoseAdminViews() {
  console.log('🔍 Diagnostic des vues admin\n');
  console.log('='.repeat(60));

  // 1. Vérifier le profil avec service role
  console.log('\n1️⃣ Vérification du profil (service role):');
  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .select('user_id, display_name, role')
    .eq('user_id', USER_ID)
    .single();

  if (profileError) {
    console.error('❌ Erreur:', profileError.message);
  } else {
    console.log(`✅ Profil trouvé: ${profile.display_name}`);
    console.log(`   Role: ${profile.role}`);
  }

  // 2. Tester is_admin() avec service role
  console.log('\n2️⃣ Test is_admin() (service role):');
  const { data: isAdminService, error: isAdminServiceError } =
    await adminClient.rpc('is_admin');

  if (isAdminServiceError) {
    console.error('❌ Erreur:', isAdminServiceError.message);
  } else {
    console.log(`   is_admin() retourne: ${isAdminService}`);
  }

  // 3. Tester les vues admin avec service role
  console.log('\n3️⃣ Test vues admin (service role):');

  const { data: dashboardService, error: dashboardServiceError } =
    await adminClient
      .from('communiques_presse_dashboard')
      .select('id, title')
      .limit(3);

  if (dashboardServiceError) {
    console.error('❌ communiques_presse_dashboard:');
    console.error(`   Code: ${dashboardServiceError.code}`);
    console.error(`   Message: ${dashboardServiceError.message}`);
  } else {
    console.log(
      `✅ communiques_presse_dashboard: ${dashboardService?.length ?? 0} ligne(s)`
    );
  }

  const { data: analyticsService, error: analyticsServiceError } =
    await adminClient
      .from('analytics_summary')
      .select('event_type, total_events')
      .limit(3);

  if (analyticsServiceError) {
    console.error('\n❌ analytics_summary:');
    console.error(`   Code: ${analyticsServiceError.code}`);
    console.error(`   Message: ${analyticsServiceError.message}`);
  } else {
    console.log(
      `✅ analytics_summary: ${analyticsService?.length ?? 0} ligne(s)`
    );
  }

  // 4. Vérifier les policies RLS sur les vues
  console.log('\n4️⃣ Vérification des policies RLS:');
  const { data: policies, error: policiesError } = await adminClient.rpc(
    'exec_sql',
    {
      query: `
        SELECT 
          schemaname, 
          tablename, 
          policyname, 
          permissive, 
          roles, 
          cmd
        FROM pg_policies 
        WHERE tablename IN ('communiques_presse_dashboard', 'analytics_summary')
        ORDER BY tablename, policyname;
      `,
    }
  );

  if (policiesError) {
    console.log('⚠️  Impossible de vérifier les policies (fonction exec_sql non disponible)');
  } else if (policies && policies.length > 0) {
    console.log(`   Trouvé ${policies.length} policy/policies:`);
    policies.forEach((p) => {
      console.log(`   - ${p.tablename}.${p.policyname} (${p.cmd})`);
    });
  } else {
    console.log('⚠️  Aucune policy trouvée sur les vues');
  }

  // 5. Vérifier la définition de is_admin()
  console.log('\n5️⃣ Vérification de la fonction is_admin():');
  const { data: functionDef, error: functionDefError } = await adminClient.rpc(
    'exec_sql',
    {
      query: `
        SELECT 
          p.proname as function_name,
          pg_get_functiondef(p.oid) as definition
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' 
        AND p.proname = 'is_admin';
      `,
    }
  );

  if (functionDefError) {
    console.log('⚠️  Impossible de vérifier la définition (fonction exec_sql non disponible)');
  } else if (functionDef && functionDef.length > 0) {
    console.log('✅ Fonction is_admin() trouvée');
    console.log('\nDéfinition:');
    console.log(functionDef[0].definition);
  } else {
    console.log('❌ Fonction is_admin() non trouvée!');
  }

  // 6. Résumé et recommandations
  console.log('\n' + '='.repeat(60));
  console.log('📝 RÉSUMÉ:');
  console.log('='.repeat(60));

  if (profile?.role === 'admin') {
    console.log('✅ Profil admin confirmé');
  } else {
    console.log('❌ Profil admin NON confirmé');
  }

  if (!dashboardServiceError && !analyticsServiceError) {
    console.log('✅ Vues admin accessibles avec service role');
  } else {
    console.log('❌ Vues admin NON accessibles même avec service role');
  }

  console.log('\n💡 RECOMMANDATIONS:');

  if (dashboardServiceError || analyticsServiceError) {
    console.log('\n1. Vérifier que les vues existent:');
    console.log('   SELECT * FROM information_schema.views');
    console.log("   WHERE table_name IN ('communiques_presse_dashboard', 'analytics_summary');");

    console.log('\n2. Vérifier les permissions sur les vues:');
    console.log('   \\dp communiques_presse_dashboard');
    console.log('   \\dp analytics_summary');

    console.log('\n3. Recréer les vues avec SECURITY INVOKER:');
    console.log('   CREATE OR REPLACE VIEW communiques_presse_dashboard');
    console.log('   WITH (security_invoker = true) AS ...');
  }

  if (profile?.role === 'admin' && (dashboardServiceError || analyticsServiceError)) {
    console.log('\n⚠️  Le profil a le rôle admin mais les vues sont inaccessibles.');
    console.log('   Ceci suggère un problème avec:');
    console.log('   - Les RLS policies sur les vues');
    console.log('   - La configuration SECURITY INVOKER/DEFINER');
    console.log('   - Les permissions GRANT sur les vues ou tables sous-jacentes');
  }
}

diagnoseAdminViews().catch(console.error);
