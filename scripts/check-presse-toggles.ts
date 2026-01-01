import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY; // Use service role key for admin access

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variables d\'environnement manquantes');
    console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
    console.error('SUPABASE_SECRET_KEY:', !!supabaseKey);
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPresseToggles() {
    console.log('🔍 Vérification des toggles presse_display...\n');

    const { data: allData, error } = await supabase
        .from('configurations_site')
        .select('key, category, description, value')
        .order('key');

    if (error) {
        console.error('❌ Erreur:', error.message);
        process.exit(1);
    }

    // Filter client-side for presse_display
    const data = allData?.filter(t => t.category === 'presse_display') || [];

    if (!data || data.length === 0) {
        console.log('⚠️  Aucun toggle presse_display trouvé');
        process.exit(1);
    }

    console.log(`✅ Trouvé ${data.length} toggle(s) presse_display:\n`);
    data.forEach((toggle, index) => {
        console.log(`${index + 1}. ${toggle.key}`);
        console.log(`   Category: ${toggle.category}`);
        console.log(`   Description: ${toggle.description}`);
        console.log(`   Value: ${JSON.stringify(toggle.value)}\n`);
    });

    // Vérifier les 2 toggles attendus
    const hasMediaKit = data.some(t => t.key === 'display_toggle_media_kit');
    const hasPressReleases = data.some(t => t.key === 'display_toggle_presse_articles');

    console.log('📊 État attendu:');
    console.log(`   display_toggle_media_kit: ${hasMediaKit ? '✅ Présent' : '❌ Manquant'}`);
    console.log(`   display_toggle_presse_articles: ${hasPressReleases ? '✅ Présent' : '❌ Manquant'}`);

    if (hasMediaKit && hasPressReleases) {
        console.log('\n🎉 Configuration correcte !');
        process.exit(0);
    } else {
        console.log('\n⚠️  Configuration incomplète');
        process.exit(1);
    }
}

checkPresseToggles();
