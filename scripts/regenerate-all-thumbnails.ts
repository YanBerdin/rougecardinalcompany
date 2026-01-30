#!/usr/bin/env tsx
/**
 * Script: Regenerate thumbnails for all existing media
 * 
 * Use case: Backfill thumbnails for media uploaded before thumbnail system was implemented
 */

import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import { getLocalCredentials, validateLocalOnly } from './utils/supabase-local-credentials';

const { url: SUPABASE_URL, serviceKey: SUPABASE_SERVICE_KEY } =
    getLocalCredentials({ silent: true });

validateLocalOnly(SUPABASE_URL);

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const THUMBNAIL_SIZE = 300;
const THUMBNAIL_QUALITY = 80;
const THUMBNAIL_SUFFIX = "_thumb.jpg";

// Image MIME types that support thumbnail generation
const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

async function regenerateThumbnail(
    mediaId: number,
    storagePath: string,
    mime: string
): Promise<{ success: boolean; thumbPath?: string; error?: string }> {

    // Skip non-image files
    if (!SUPPORTED_TYPES.includes(mime)) {
        return { success: false, error: `Unsupported MIME type: ${mime}` };
    }

    try {
        // 1. Download original from storage
        const { data: fileData, error: downloadError } = await supabase.storage
            .from('medias')
            .download(storagePath);

        if (downloadError) {
            return { success: false, error: `Download failed: ${downloadError.message}` };
        }

        // 2. Generate thumbnail with Sharp
        const arrayBuffer = await fileData.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const thumbnailBuffer = await sharp(buffer)
            .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, { fit: 'cover' })
            .jpeg({ quality: THUMBNAIL_QUALITY })
            .toBuffer();

        // 3. Upload thumbnail to Storage
        const thumbPath = storagePath.replace(
            /\.(jpg|jpeg|png|webp)$/i,
            THUMBNAIL_SUFFIX
        );

        const { error: uploadError } = await supabase.storage
            .from('medias')
            .upload(thumbPath, thumbnailBuffer, {
                contentType: 'image/jpeg',
                cacheControl: '31536000',
                upsert: true
            });

        if (uploadError) {
            return { success: false, error: `Upload failed: ${uploadError.message}` };
        }

        // 4. Update database with thumbnail_path
        const { error: updateError } = await supabase
            .from('medias')
            .update({ thumbnail_path: thumbPath })
            .eq('id', mediaId);

        if (updateError) {
            return { success: false, error: `DB update failed: ${updateError.message}` };
        }

        return { success: true, thumbPath };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
}

async function regenerateAllThumbnails() {
    console.log('🔄 Regenerating thumbnails for all media...\n');

    // Fetch all media without thumbnails
    const { data: mediaList, error } = await supabase
        .from('medias')
        .select('id, filename, storage_path, mime, thumbnail_path')
        .is('thumbnail_path', null)
        .order('id', { ascending: true });

    if (error) {
        console.error('❌ Query failed:', error);
        process.exit(1);
    }

    if (!mediaList || mediaList.length === 0) {
        console.log('✅ All media already have thumbnails!');
        return;
    }

    console.log(`📊 Found ${mediaList.length} media without thumbnails\n`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const media of mediaList) {
        process.stdout.write(`Processing ${media.filename}... `);

        const result = await regenerateThumbnail(media.id, media.storage_path, media.mime);

        if (result.success) {
            console.log(`✅ ${result.thumbPath}`);
            successCount++;
        } else if (result.error?.includes('Unsupported MIME')) {
            console.log(`⏭️  Skipped (${media.mime})`);
            skipCount++;
        } else {
            console.log(`❌ ${result.error}`);
            errorCount++;
        }
    }

    console.log(`\n📊 Results:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ⏭️  Skipped: ${skipCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);

    if (errorCount > 0) {
        console.log('\n⚠️  Some thumbnails failed to generate. Check logs above for details.');
    } else if (successCount > 0) {
        console.log('\n✅ All thumbnails generated successfully!');
    }
}

regenerateAllThumbnails().catch(console.error);
