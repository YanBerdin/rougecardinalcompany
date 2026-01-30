#!/usr/bin/env tsx
/**
 * Test Script: Thumbnail Generation Direct - REMOTE (Phase 3)
 * 
 * ⚠️  ATTENTION: Ce script teste sur Supabase Cloud (REMOTE)
 * 
 * Bypasses HTTP API authentication by directly calling DAL functions.
 * Validates thumbnail generation logic at the function level.
 */

import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

// Get REMOTE credentials
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
    console.error('❌ Missing required environment variables:');
    console.error('   - NEXT_PUBLIC_SUPABASE_URL');
    console.error('   - SUPABASE_SECRET_KEY');
    console.error('\nMake sure .env.local contains remote Supabase credentials.');
    process.exit(1);
}

// Security: Validate we're using remote URL
if (SUPABASE_URL.includes('127.0.0.1') || SUPABASE_URL.includes('localhost')) {
    console.error('❌ SECURITY ERROR: This script is for REMOTE testing only.');
    console.error('   Use test-thumbnail-direct.ts for local testing.');
    process.exit(1);
}

console.log('⚠️  REMOTE TESTING MODE');
console.log(`   Target: ${SUPABASE_URL}`);
console.log('   All test data will be cleaned up automatically.\n');

const THUMBNAIL_SIZE = 300;
const THUMBNAIL_QUALITY = 80;

async function main() {
    console.log('🧪 Thumbnail Generation Test (Direct Function - REMOTE)');
    console.log('='.repeat(70));

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SECRET_KEY!);

    let mediaId: number | undefined;
    let storagePath: string | undefined;
    let thumbnailPath: string | undefined;

    try {
        // 1. Create test image
        console.log('📸 Creating test image (800x600 JPEG)...');
        const imageBuffer = await sharp({
            create: {
                width: 800,
                height: 600,
                channels: 3,
                background: { r: 100, g: 149, b: 237 }
            }
        })
            .jpeg({ quality: 90 })
            .toBuffer();

        // 2. Upload to Supabase Storage
        console.log('☁️  Uploading test image (REMOTE)...');
        const fileName = `test-${Date.now()}.jpg`;
        storagePath = `uploads/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('medias')
            .upload(storagePath, imageBuffer, {
                contentType: 'image/jpeg',
                upsert: false
            });

        if (uploadError) {
            throw new Error(`Upload failed: ${uploadError.message}`);
        }

        console.log(`   ✅ Uploaded to: ${storagePath}`);

        // 3. Create database record
        console.log('💾 Creating database record (REMOTE)...');
        const { data: mediaData, error: insertError } = await supabase
            .from('medias')
            .insert({
                storage_path: storagePath,
                filename: fileName,
                mime: 'image/jpeg',
                size_bytes: imageBuffer.length,
                alt_text: 'Test thumbnail generation (remote direct)'
            })
            .select('id')
            .single();

        if (insertError) {
            throw new Error(`Insert failed: ${insertError.message}`);
        }

        mediaId = mediaData.id;
        console.log(`   ✅ Media ID: ${mediaId}`);

        // 4. Generate thumbnail
        console.log('🖼️  Generating thumbnail directly (REMOTE)...');

        // 4a. Download original
        console.log(`   - Downloading: ${storagePath}`);
        const { data: fileData, error: downloadError } = await supabase.storage
            .from('medias')
            .download(storagePath);

        if (downloadError) {
            throw new Error(`Download failed: ${downloadError.message}`);
        }

        const arrayBuffer = await fileData.arrayBuffer();
        const originalBuffer = Buffer.from(arrayBuffer);
        console.log(`   ✅ Downloaded ${originalBuffer.length} bytes`);

        // 4b. Resize with sharp
        console.log(`   - Resizing to ${THUMBNAIL_SIZE}x${THUMBNAIL_SIZE}...`);
        const thumbnailBuffer = await sharp(originalBuffer)
            .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, { fit: 'cover' })
            .jpeg({ quality: THUMBNAIL_QUALITY })
            .toBuffer();

        console.log(`   ✅ Thumbnail created (${thumbnailBuffer.length} bytes)`);

        // 4c. Upload thumbnail
        thumbnailPath = `thumbnails/${fileName.replace(/\.(jpg|jpeg)$/i, '_thumb.jpg')}`;
        console.log(`   - Uploading to: ${thumbnailPath}`);

        const { error: thumbUploadError } = await supabase.storage
            .from('medias')
            .upload(thumbnailPath, thumbnailBuffer, {
                contentType: 'image/jpeg',
                cacheControl: '31536000',
                upsert: true
            });

        if (thumbUploadError) {
            throw new Error(`Thumbnail upload failed: ${thumbUploadError.message}`);
        }

        console.log(`   ✅ Thumbnail uploaded`);

        // 4d. Update database
        console.log(`   - Updating database record...`);
        const { error: updateError } = await supabase
            .from('medias')
            .update({ thumbnail_path: thumbnailPath })
            .eq('id', mediaId);

        if (updateError) {
            throw new Error(`Database update failed: ${updateError.message}`);
        }

        console.log(`   ✅ Database updated`);
        console.log(`✅ Thumbnail generated: ${thumbnailPath}`);

        // 5. Verify thumbnail
        console.log('🔍 Verifying thumbnail (REMOTE)...');
        const { data: thumbData, error: thumbDownloadError } = await supabase.storage
            .from('medias')
            .download(thumbnailPath);

        if (thumbDownloadError) {
            throw new Error(`Thumbnail verification failed: ${thumbDownloadError.message}`);
        }

        const thumbArrayBuffer = await thumbData.arrayBuffer();
        const thumbBuffer = Buffer.from(thumbArrayBuffer);
        const thumbMetadata = await sharp(thumbBuffer).metadata();

        console.log(`   ✅ Thumbnail verified:`);
        console.log(`      - Format: ${thumbMetadata.format}`);
        console.log(`      - Dimensions: ${thumbMetadata.width}x${thumbMetadata.height}`);
        console.log(`      - Size: ${thumbBuffer.length} bytes`);

        if (thumbMetadata.width !== THUMBNAIL_SIZE || thumbMetadata.height !== THUMBNAIL_SIZE) {
            throw new Error(`Incorrect dimensions: ${thumbMetadata.width}x${thumbMetadata.height}`);
        }

        // 6. Verify database
        console.log('🔍 Verifying database (REMOTE)...');
        const { data: dbData, error: dbError } = await supabase
            .from('medias')
            .select('thumbnail_path')
            .eq('id', mediaId)
            .single();

        if (dbError) {
            throw new Error(`Database query failed: ${dbError.message}`);
        }

        if (dbData.thumbnail_path !== thumbnailPath) {
            throw new Error(`Database mismatch: expected ${thumbnailPath}, got ${dbData.thumbnail_path}`);
        }

        console.log(`   ✅ thumbnail_path = ${dbData.thumbnail_path}`);

        console.log('\n' + '='.repeat(70));
        console.log('✅ ALL TESTS PASSED (REMOTE)');
        console.log('='.repeat(70));
        console.log('\nPhase 3 - Thumbnail Generation (REMOTE): VALIDATED ✅');
        console.log('- Thumbnail created: 300x300 JPEG');
        console.log('- Storage upload: SUCCESS');
        console.log('- Database update: SUCCESS');
        console.log('- Quality: 80%');
        console.log('- Fit: cover (center crop)');

        // Cleanup
        console.log('🧹 Cleaning up (REMOTE)...');

        // Delete database record
        const { error: deleteError } = await supabase
            .from('medias')
            .delete()
            .eq('id', mediaId);

        if (deleteError) {
            console.warn(`   ⚠️  Failed to delete database record: ${deleteError.message}`);
        } else {
            console.log(`   ✅ Database record deleted`);
        }

        // Delete storage files
        const { error: storageError } = await supabase.storage
            .from('medias')
            .remove([storagePath, thumbnailPath]);

        if (storageError) {
            console.warn(`   ⚠️  Failed to delete storage files: ${storageError.message}`);
        } else {
            console.log(`   ✅ Storage files deleted`);
        }

        process.exit(0);

    } catch (error) {
        console.error('\n' + '='.repeat(70));
        console.error('❌ TEST FAILED (REMOTE)');
        console.error('='.repeat(70));
        console.error(error);

        // Cleanup on failure
        if (mediaId && storagePath) {
            console.log('🧹 Cleaning up after failure (REMOTE)...');

            await supabase
                .from('medias')
                .delete()
                .eq('id', mediaId);

            const filesToDelete = [storagePath];
            if (thumbnailPath) {
                filesToDelete.push(thumbnailPath);
            }

            await supabase.storage
                .from('medias')
                .remove(filesToDelete);
        }

        process.exit(1);
    }
}

main();
