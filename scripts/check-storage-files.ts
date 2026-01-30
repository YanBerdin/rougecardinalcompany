#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import { getLocalCredentials } from './utils/supabase-local-credentials';

const { url, serviceKey } = getLocalCredentials({ silent: true });
const supabase = createClient(url, serviceKey);

async function checkFiles() {
    console.log('🔍 Checking if media files exist in Storage...\n');

    const paths = [
        'press-kit/logos/rouge-cardinal-logo-vertical.png',
        'photos/spectacle-scene-1.jpg',
        'photos/spectacle-scene-2.jpg',
        'photos/equipe-artistique.jpg',
    ];

    for (const path of paths) {
        const { data, error } = await supabase.storage.from('medias').download(path);

        if (error) {
            console.log(`❌ ${path} - NOT FOUND (${error.message})`);
        } else {
            const size = (await data.arrayBuffer()).byteLength;
            console.log(`✅ ${path} - EXISTS (${size} bytes)`);
        }
    }
}

checkFiles();
