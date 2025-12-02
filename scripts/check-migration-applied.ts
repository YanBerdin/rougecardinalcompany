#!/usr/bin/env tsx
/*
  Vérifie si la migration a été appliquée sur la base distante
  - Teste la présence de la vue `messages_contact_admin` (sélect simple)
  - Appelle la fonction `restore_content_version(0)` en RPC (doit renvoyer false si la fonction existe)

  Usage: pnpm exec tsx scripts/check-migration-applied.ts
*/

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing environment variables. Ensure .env.local has NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY (service role).');
  process.exit(2);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function checkView() {
  try {
    const { data, error } = await supabase
      .from('messages_contact_admin')
      .select('id')
      .limit(1);

    if (error) {
      // if view doesn't exist, Postgres returns 400 with message
      return { exists: false, error: error.message };
    }

    return { exists: true, sample: data?.[0] ?? null };
  } catch (err: unknown) {
    return { exists: false, error: err instanceof Error ? err.message : String(err) };
  }
}

async function checkFunction() {
  try {
    // call restore_content_version with a non-existent id (should return false if function exists)
    const { data, error } = await supabase.rpc('restore_content_version', { p_version_id: 0 });
    if (error) {
      return { exists: false, error: error.message };
    }

    return { exists: true, result: data };
  } catch (err: unknown) {
    return { exists: false, error: err instanceof Error ? err.message : String(err) };
  }
}

async function main() {
  console.log('🔎 Vérification de la présence de la vue et de la fonction liées à la migration...');

  const view = await checkView();
  console.log('\n🗂️ Vue `messages_contact_admin`:');
  if (view.exists) {
    console.log('   ✅ présente sur la base distante');
    if (view.sample) console.log('   📌 exemple de ligne:', view.sample);
  } else {
    console.log('   ❌ absente ou inaccessible');
    if (view.error) console.log('   ℹ️ erreur:', view.error);
  }

  const fn = await checkFunction();
  console.log('\n🧩 Fonction `restore_content_version`:');
  if (fn.exists) {
    console.log('   ✅ existe sur la base distante');
    console.log('   📌 résultat de l’appel test:', fn.result);
  } else {
    console.log('   ❌ absente ou appel RPC impossible');
    if (fn.error) console.log('   ℹ️ erreur:', fn.error);
  }

  const applied = (view.exists || fn.exists);
  console.log('\n✅ Conclusion: la migration semble ' + (applied ? 'appliquée (objet trouvé).' : 'non appliquée (objet non trouvé).'));

  process.exit(applied ? 0 : 3);
}

main();
