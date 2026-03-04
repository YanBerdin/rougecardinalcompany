// ommand failed with exit code 1. without arguments, the script will print usage instructions and exit with code 1.
//* This is intentional to prevent accidental toggling without specifying the desired state.
// To enable or disable the toggles, you must provide one of the following arguments:
// - enable-all: Activates both the Media Kit and Press Releases sections.
// - disable-all: Deactivates both sections.
// - enable-media-kit: Activates only the Media Kit section.
// - enable-press-releases: Activates only the Press Releases section.
// Usage examples:
//   pnpm exec tsx scripts/toggle-presse.ts enable-all
//   pnpm exec tsx scripts/toggle-presse.ts disable-all
//   pnpm exec tsx scripts/toggle-presse.ts enable-media-kit
//   pnpm exec tsx scripts/toggle-presse.ts enable-press-releases
import { createClient } from '@supabase/supabase-js';
import { scriptEnv } from './lib/env.js';

const supabase = createClient(scriptEnv.NEXT_PUBLIC_SUPABASE_URL, scriptEnv.SUPABASE_SECRET_KEY);

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
