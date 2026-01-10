import { createClient } from '@supabase/supabase-js';
import { scriptEnv } from './lib/env.js';

const supabase = createClient(scriptEnv.NEXT_PUBLIC_SUPABASE_URL, scriptEnv.SUPABASE_SECRET_KEY);

interface ExpectedToggle {
    key: string;
    description: string;
    category: string;
}

const EXPECTED_TOGGLES: ExpectedToggle[] = [
    { key: 'display_toggle_home_hero', description: 'Hero', category: 'home_display' },
    { key: 'display_toggle_home_about', description: 'À propos', category: 'home_display' },
    { key: 'display_toggle_home_spectacles', description: 'Prochains Spectacles', category: 'home_display' },
    { key: 'display_toggle_home_a_la_une', description: 'À la Une (actualités)', category: 'home_display' },
    { key: 'display_toggle_home_partners', description: 'Nos Partenaires', category: 'home_display' },
    { key: 'display_toggle_home_newsletter', description: 'Newsletter', category: 'home_display' },
    { key: 'display_toggle_agenda_newsletter', description: 'Newsletter CTA', category: 'agenda_display' },
    { key: 'display_toggle_contact_newsletter', description: 'Newsletter Card', category: 'contact_display' },
    { key: 'display_toggle_media_kit', description: 'Kit Média', category: 'presse_display' },
    { key: 'display_toggle_presse_articles', description: 'Communiqués de Presse', category: 'presse_display' },
];

async function checkDisplayToggles() {
    console.log('🔍 Vérification de tous les display toggles...\n');

    const { data, error } = await supabase
        .from('configurations_site')
        .select('key, category, description, value')
        .like('key', 'display_toggle_%')
        .order('category')
        .order('key');

    if (error) {
        console.error('❌ Erreur Supabase:', error.message);
        process.exit(1);
    }

    const foundKeys = new Set(data?.map(t => t.key) ?? []);
    let allPresent = true;
    let allValid = true;

    console.log('📋 Toggles attendus (10 au total):\n');

    const categoryLabels: Record<string, string> = {
        'home_display': '🏠 Homepage',
        'agenda_display': '📅 Agenda',
        'contact_display': '📧 Contact',
        'presse_display': '📰 Presse',
    };

    const groupedToggles = EXPECTED_TOGGLES.reduce((acc, toggle) => {
        if (!acc[toggle.category]) {
            acc[toggle.category] = [];
        }
        acc[toggle.category].push(toggle);
        return acc;
    }, {} as Record<string, ExpectedToggle[]>);

    for (const [category, toggles] of Object.entries(groupedToggles)) {
        console.log(`\n${categoryLabels[category] ?? category}`);
        console.log('─'.repeat(40));

        for (const expected of toggles) {
            const found = data?.find(t => t.key === expected.key);
            const isPresent = foundKeys.has(expected.key);
            
            if (!isPresent) {
                allPresent = false;
                console.log(`  ❌ ${expected.key}`);
                console.log(`     → Manquant ! (${expected.description})`);
                continue;
            }

            const value = found?.value;
            const hasValidStructure = value && typeof value === 'object' && 'enabled' in value;
            
            if (!hasValidStructure) {
                allValid = false;
                console.log(`  ⚠️  ${expected.key}`);
                console.log(`     → Structure invalide: ${JSON.stringify(value)}`);
                continue;
            }

            const enabled = value.enabled;
            const statusIcon = enabled ? '✅' : '⬚ ';
            console.log(`  ${statusIcon} ${expected.key}`);
            console.log(`     → ${expected.description}: ${enabled ? 'ACTIVÉ' : 'DÉSACTIVÉ'}`);
        }
    }

    const unexpectedToggles = data?.filter(t => 
        !EXPECTED_TOGGLES.some(e => e.key === t.key)
    ) ?? [];

    if (unexpectedToggles.length > 0) {
        console.log('\n\n⚠️  Toggles non référencés:');
        console.log('─'.repeat(40));
        for (const toggle of unexpectedToggles) {
            console.log(`  ? ${toggle.key} (${toggle.category})`);
        }
    }

    console.log('\n\n📊 Résumé:');
    console.log('─'.repeat(40));
    console.log(`  Attendus:     ${EXPECTED_TOGGLES.length}`);
    console.log(`  Trouvés:      ${data?.length ?? 0}`);
    console.log(`  Présents:     ${EXPECTED_TOGGLES.filter(e => foundKeys.has(e.key)).length}/${EXPECTED_TOGGLES.length}`);
    console.log(`  Manquants:    ${EXPECTED_TOGGLES.filter(e => !foundKeys.has(e.key)).length}`);

    if (allPresent && allValid) {
        console.log('\n🎉 Tous les toggles sont correctement configurés !');
        process.exit(0);
    } else {
        console.log('\n❌ Configuration incomplète ou invalide');
        process.exit(1);
    }
}

checkDisplayToggles();
