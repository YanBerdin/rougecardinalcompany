import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variables d\'environnement manquantes');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function togglePresseToggles(mediaKitEnabled: boolean, pressReleasesEnabled: boolean) {
    console.log('🔧 Configuration des toggles presse...\n');

    // Update Media Kit toggle
    const { error: mediaKitError } = await supabase
        .from('configurations_site')
        .update({
            value: { enabled: mediaKitEnabled, max_items: null }
        })
        .eq('key', 'display_toggle_media_kit');

    if (mediaKitError) {
        console.error('❌ Erreur Media Kit:', mediaKitError.message);
    } else {
        console.log(`✅ Kit Média: ${mediaKitEnabled ? 'ACTIVÉ' : 'DÉSACTIVÉ'}`);
    }

    // Update Press Releases toggle
    const { error: pressReleasesError } = await supabase
        .from('configurations_site')
        .update({
            value: { enabled: pressReleasesEnabled, max_items: 12 }
        })
        .eq('key', 'display_toggle_presse_articles');

    if (pressReleasesError) {
        console.error('❌ Erreur Communiqués:', pressReleasesError.message);
    } else {
        console.log(`✅ Communiqués de Presse: ${pressReleasesEnabled ? 'ACTIVÉ' : 'DÉSACTIVÉ'}`);
    }

    console.log('\n📊 État final:');
    const { data, error } = await supabase
        .from('configurations_site')
        .select('key, value')
        .eq('category', 'presse_display')
        .order('key');

    if (error) {
        console.error('❌ Erreur:', error.message);
    } else {
        data?.forEach(toggle => {
            const enabled = toggle.value?.enabled ?? false;
            console.log(`  ${toggle.key}: ${enabled ? '✅ ON' : '❌ OFF'}`);
        });
    }
}

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

if (command === 'enable-all') {
    togglePresseToggles(true, true);
} else if (command === 'disable-all') {
    togglePresseToggles(false, false);
} else if (command === 'enable-media-kit') {
    togglePresseToggles(true, false);
} else if (command === 'enable-press-releases') {
    togglePresseToggles(false, true);
} else {
    console.log('Usage:');
    console.log('  pnpm exec tsx scripts/toggle-presse.ts enable-all');
    console.log('  pnpm exec tsx scripts/toggle-presse.ts disable-all');
    console.log('  pnpm exec tsx scripts/toggle-presse.ts enable-media-kit');
    console.log('  pnpm exec tsx scripts/toggle-presse.ts enable-press-releases');
    process.exit(1);
}
