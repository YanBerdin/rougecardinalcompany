#!/usr/bin/env tsx
/**
 * Script: Check all media records for thumbnail_path status
 * 
 * Lists all media in database and shows which have thumbnails
 */

import { createClient } from '@supabase/supabase-js';
import { getLocalCredentials, validateLocalOnly } from './utils/supabase-local-credentials';

const { url: SUPABASE_URL, serviceKey: SUPABASE_SERVICE_KEY } =
    getLocalCredentials({ silent: true });

validateLocalOnly(SUPABASE_URL);

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkThumbnails() {
    console.log('🔍 Checking thumbnail_path status for all media...\n');

    const { data: mediaList, error } = await supabase
        .from('medias')
        .select('id, filename, storage_path, thumbnail_path, created_at')
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) {
        console.error('❌ Query failed:', error);
        process.exit(1);
    }

    if (!mediaList || mediaList.length === 0) {
        console.log('ℹ️  No media found in database');
        return;
    }

    const withThumbnails = mediaList.filter(m => m.thumbnail_path);
    const withoutThumbnails = mediaList.filter(m => !m.thumbnail_path);

    console.log(`📊 Statistics (last 20 media):`);
    console.log(`   Total: ${mediaList.length}`);
    console.log(`   ✅ With thumbnails: ${withThumbnails.length}`);
    console.log(`   ❌ Without thumbnails: ${withoutThumbnails.length}\n`);

    console.log('📋 Recent media (newest first):\n');

    mediaList.forEach((media, idx) => {
        const hasThumbnail = media.thumbnail_path ? '✅' : '❌';
        const createdDate = new Date(media.created_at).toLocaleString('fr-FR');

        console.log(`${idx + 1}. ${hasThumbnail} ID ${media.id} - ${media.filename}`);
        console.log(`   Path: ${media.storage_path}`);
        console.log(`   Thumb: ${media.thumbnail_path ?? '(null)'}`);
        console.log(`   Created: ${createdDate}\n`);
    });

    if (withoutThumbnails.length > 0) {
        console.log(`\n⚠️  ${withoutThumbnails.length} media without thumbnails detected`);
        console.log('💡 Possible causes:');
        console.log('   1. Uploaded before thumbnail system was implemented');
        console.log('   2. Thumbnail generation failed during upload');
        console.log('   3. API endpoint /api/admin/media/thumbnail returned error\n');
        console.log('🔧 To regenerate thumbnails, run:');
        console.log('   pnpm exec tsx scripts/regenerate-all-thumbnails.ts');
    }
}

checkThumbnails().catch(console.error);
