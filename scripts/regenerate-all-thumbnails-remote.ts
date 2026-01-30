#!/usr/bin/env tsx
/**
 * Script: Regenerate thumbnails for all existing media (REMOTE DATABASE)
 * 
 * ⚠️ WARNING: This script operates on the PRODUCTION database
 * Use case: Backfill thumbnails for media uploaded before thumbnail system was implemented
 * 
 * SAFETY:
 * - Dry-run mode by default (use --apply to actually execute)
 * - Requires explicit confirmation for production
 * - Processes in batches to avoid overwhelming the API
 */

import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

// Use REMOTE Supabase credentials (not local)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing environment variables:');
    console.error('   - NEXT_PUBLIC_SUPABASE_URL');
    console.error('   - SUPABASE_SECRET_KEY');
    process.exit(1);
}

// ⚠️ Security check: Prevent accidental use on local DB
if (SUPABASE_URL.includes('localhost') || SUPABASE_URL.includes('127.0.0.1')) {
    console.error('❌ This script is for REMOTE database only');
    console.error('   Use regenerate-all-thumbnails.ts for local database');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const THUMBNAIL_SIZE = 300;
const THUMBNAIL_QUALITY = 80;
const THUMBNAIL_SUFFIX = "_thumb.jpg";
const BATCH_SIZE = 10; // Process 10 at a time to avoid rate limits

// Image MIME types that support thumbnail generation
const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

// Check for --apply flag
const DRY_RUN = !process.argv.includes('--apply');

async function regenerateThumbnail(
    mediaId: number,
    storagePath: string,
    mime: string
): Promise<{ success: boolean; thumbPath?: string; error?: string }> {

    // Skip non-image files
    if (!SUPPORTED_TYPES.includes(mime)) {
        return { success: false, error: `Unsupported MIME type: ${mime}` };
    }

    if (DRY_RUN) {
        return { success: true, thumbPath: `[DRY RUN] ${storagePath.replace(/\.(jpg|jpeg|png|webp)$/i, THUMBNAIL_SUFFIX)}` };
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
    console.log('🌍 REMOTE DATABASE Thumbnail Regeneration');
    console.log('==========================================\n');
    console.log(`📡 Target: ${SUPABASE_URL}`);

    if (DRY_RUN) {
        console.log('🔍 Mode: DRY RUN (no changes will be made)');
        console.log('   Use --apply flag to execute changes\n');
    } else {
        console.log('⚠️  Mode: APPLY (changes WILL be made to production)');
        console.log('   Proceeding in 3 seconds...\n');
        await new Promise(resolve => setTimeout(resolve, 3000));
    }

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

    // Process in batches
    for (let i = 0; i < mediaList.length; i += BATCH_SIZE) {
        const batch = mediaList.slice(i, i + BATCH_SIZE);

        console.log(`\n📦 Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(mediaList.length / BATCH_SIZE)}`);

        for (const media of batch) {
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

        // Rate limiting: wait 1s between batches
        if (i + BATCH_SIZE < mediaList.length && !DRY_RUN) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    console.log(`\n📊 Results:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ⏭️  Skipped: ${skipCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);

    if (DRY_RUN) {
        console.log('\n💡 This was a dry run. To apply changes, run:');
        console.log('   pnpm exec tsx scripts/regenerate-all-thumbnails-remote.ts --apply');
    } else if (errorCount > 0) {
        console.log('\n⚠️  Some thumbnails failed to generate. Check logs above for details.');
    } else if (successCount > 0) {
        console.log('\n✅ All thumbnails generated successfully!');
    }
}

regenerateAllThumbnails().catch(console.error);
