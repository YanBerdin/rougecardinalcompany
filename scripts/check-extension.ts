#!/usr/bin/env tsx
/**
 * Vérifie si l'extension `pg_net` est installée sur la base distante
 * Usage: pnpm exec tsx scripts/check-extension.ts
 */

//TODO: ❌ Impossible d'interroger pg_extension via Supabase client. Détails: Could not find the table 'public.pg_extension' in the schema cache

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

async function main() {
  console.log('🔎 Vérification de la présence de l\'extension pg_net sur la base distante...');

  try {
    // tenter une sélection depuis pg_extension (catalogue). Certaines API Rest peuvent refuser l'accès,
    // la requête est protégée et on gère proprement l'erreur si elle survient.
    const { data, error } = await supabase
      .from('pg_extension')
      .select('extname')
      .eq('extname', 'pg_net')
      .limit(1);

    if (error) {
      console.log('   ❌ Impossible d\'interroger pg_extension via Supabase client. Détails:', error.message);
      console.log('   ℹ️ Résultat: vérifier via Supabase Dashboard SQL Editor ou la CLI `supabase migration list`');
      process.exit(3);
    }

    if (data && data.length > 0) {
      console.log('   ✅ L\'extension `pg_net` est installée.');
      console.log('   📌 Exemple:', data[0]);
      process.exit(0);
    }

    console.log('   ⚠️ L\'extension `pg_net` n\'est pas trouvée (ou n\'existe pas).');
    process.exit(1);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log('   ❌ Erreur inattendue:', msg);
    process.exit(4);
  }
}

main();
