#!/usr/bin/env tsx
/**
 * Test Script: Thumbnail Generation - Direct Function Test
 * 
 * Bypasses HTTP API to test thumbnail generation logic directly
 */

import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import { getLocalCredentials, validateLocalOnly } from './utils/supabase-local-credentials';

// Get local credentials from .env.local (with safe defaults for testing)
const { url: SUPABASE_URL, serviceKey: SUPABASE_SERVICE_KEY } = 
    getLocalCredentials({ silent: true });

// Security: ensure we're using localhost
validateLocalOnly(SUPABASE_URL);

const THUMBNAIL_SIZE = 300;
const THUMBNAIL_QUALITY = 80;
const THUMBNAIL_SUFFIX = '_thumb.jpg';

async function createTestImage(): Promise<Buffer> {
  console.log('📸 Creating test image (800x600 JPEG)...');
  
  return await sharp({
    create: {
      width: 800,
      height: 600,
      channels: 3,
      background: { r: 100, g: 149, b: 237 }
    }
  })
    .jpeg({ quality: 90 })
    .toBuffer();
}

async function generateThumbnailDirect(
  supabase: any,
  storagePath: string,
  mediaId: string
): Promise<{ success: boolean; thumbPath?: string; error?: string }> {
  try {
    console.log('🖼️  Generating thumbnail directly...');
    
    // 1. Download original image
    console.log(`   - Downloading: ${storagePath}`);
    const { data: originalFile, error: downloadError } = await supabase.storage
      .from('medias')
      .download(storagePath);
    
    if (downloadError) {
      throw new Error(`Download failed: ${downloadError.message}`);
    }
    
    console.log(`   ✅ Downloaded ${originalFile.size} bytes`);
    
    // 2. Generate thumbnail with sharp
    const originalBuffer = await originalFile.arrayBuffer();
    console.log(`   - Resizing to ${THUMBNAIL_SIZE}x${THUMBNAIL_SIZE}...`);
    
    const thumbnailBuffer = await sharp(Buffer.from(originalBuffer))
      .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: THUMBNAIL_QUALITY })
      .toBuffer();
    
    console.log(`   ✅ Thumbnail created (${thumbnailBuffer.length} bytes)`);
    
    // 3. Upload thumbnail
    const baseName = storagePath.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'image';
    const thumbPath = `thumbnails/${baseName}${THUMBNAIL_SUFFIX}`;
    
    console.log(`   - Uploading to: ${thumbPath}`);
    
    const { error: uploadError } = await supabase.storage
      .from('medias')
      .upload(thumbPath, thumbnailBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      });
    
    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }
    
    console.log(`   ✅ Thumbnail uploaded`);
    
    // 4. Update database
    console.log(`   - Updating database record...`);
    
    const { error: updateError } = await supabase
      .from('medias')
      .update({ thumbnail_path: thumbPath })
      .eq('id', mediaId);
    
    if (updateError) {
      throw new Error(`Database update failed: ${updateError.message}`);
    }
    
    console.log(`   ✅ Database updated`);
    
    return {
      success: true,
      thumbPath
    };
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function verifyThumbnail(
  supabase: any,
  thumbPath: string
): Promise<boolean> {
  console.log('🔍 Verifying thumbnail...');
  
  const { data, error } = await supabase.storage
    .from('medias')
    .download(thumbPath);
  
  if (error) {
    console.error(`   ❌ Download failed: ${error.message}`);
    return false;
  }
  
  const buffer = await data.arrayBuffer();
  const metadata = await sharp(Buffer.from(buffer)).metadata();
  
  console.log(`   ✅ Thumbnail verified:`);
  console.log(`      - Format: ${metadata.format}`);
  console.log(`      - Dimensions: ${metadata.width}x${metadata.height}`);
  console.log(`      - Size: ${buffer.byteLength} bytes`);
  
  if (metadata.width !== 300 || metadata.height !== 300) {
    console.error(`   ❌ Wrong dimensions: expected 300x300, got ${metadata.width}x${metadata.height}`);
    return false;
  }
  
  if (metadata.format !== 'jpeg') {
    console.error(`   ❌ Wrong format: expected jpeg, got ${metadata.format}`);
    return false;
  }
  
  return true;
}

async function verifyDatabase(
  supabase: any,
  mediaId: string,
  expectedThumbPath: string
): Promise<boolean> {
  console.log('🔍 Verifying database...');
  
  const { data, error } = await supabase
    .from('medias')
    .select('thumbnail_path')
    .eq('id', mediaId)
    .single();
  
  if (error) {
    console.error(`   ❌ Query failed: ${error.message}`);
    return false;
  }
  
  if (data.thumbnail_path !== expectedThumbPath) {
    console.error(`   ❌ Mismatch:`);
    console.error(`      Expected: ${expectedThumbPath}`);
    console.error(`      Got: ${data.thumbnail_path}`);
    return false;
  }
  
  console.log(`   ✅ thumbnail_path = ${data.thumbnail_path}`);
  return true;
}

async function cleanup(
  supabase: any,
  mediaId: string,
  storagePath: string,
  thumbPath?: string
): Promise<void> {
  console.log('🧹 Cleaning up...');
  
  await supabase.from('medias').delete().eq('id', mediaId);
  console.log(`   ✅ Database record deleted`);
  
  const filesToDelete = [storagePath];
  if (thumbPath) filesToDelete.push(thumbPath);
  
  await supabase.storage.from('medias').remove(filesToDelete);
  console.log(`   ✅ Storage files deleted`);
}

async function main() {
  console.log('\n🧪 Thumbnail Generation Test (Direct Function)');
  console.log('='.repeat(70));
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  let mediaId: string | undefined;
  let storagePath: string | undefined;
  let thumbPath: string | undefined;
  
  try {
    // 1. Create and upload test image
    const imageBuffer = await createTestImage();
    const fileName = `test-${Date.now()}.jpg`;
    storagePath = `uploads/${fileName}`;
    
    console.log('☁️  Uploading test image...');
    const { error: uploadError } = await supabase.storage
      .from('medias')
      .upload(storagePath, imageBuffer, {
        contentType: 'image/jpeg'
      });
    
    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);
    console.log(`   ✅ Uploaded to: ${storagePath}`);
    
    // 2. Insert database record
    console.log('💾 Creating database record...');
    const { data: mediaData, error: insertError } = await supabase
      .from('medias')
      .insert({
        storage_path: storagePath,
        filename: fileName,
        mime: 'image/jpeg',
        size_bytes: imageBuffer.length,
        alt_text: 'Test thumbnail'
      })
      .select('id')
      .single();
    
    if (insertError) throw new Error(`Insert failed: ${insertError.message}`);
    
    mediaId = mediaData.id.toString();
    console.log(`   ✅ Media ID: ${mediaId}`);
    
    // 3. Generate thumbnail
    if (!mediaId || !storagePath) {
      throw new Error('Missing required parameters for thumbnail generation');
    }
    const result = await generateThumbnailDirect(supabase, storagePath, mediaId);
    
    if (!result.success) {
      throw new Error(`Thumbnail generation failed: ${result.error}`);
    }
    
    thumbPath = result.thumbPath!;
    console.log(`✅ Thumbnail generated: ${thumbPath}`);
    
    // 4. Verify thumbnail file
    const fileValid = await verifyThumbnail(supabase, thumbPath);
    if (!fileValid) throw new Error('Thumbnail file validation failed');
    
    // 5. Verify database
    const dbValid = await verifyDatabase(supabase, mediaId, thumbPath);
    if (!dbValid) throw new Error('Database validation failed');
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ ALL TESTS PASSED');
    console.log('='.repeat(70));
    console.log('\nPhase 3 - Thumbnail Generation: VALIDATED ✅');
    console.log('- Thumbnail created: 300x300 JPEG');
    console.log('- Storage upload: SUCCESS');
    console.log('- Database update: SUCCESS');
    console.log('- Quality: 80%');
    console.log('- Fit: cover (center crop)');
    
    // Cleanup
    await cleanup(supabase, mediaId, storagePath, thumbPath);
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n' + '='.repeat(70));
    console.error('❌ TEST FAILED');
    console.error('='.repeat(70));
    console.error(error);
    
    if (mediaId && storagePath) {
      await cleanup(supabase, mediaId, storagePath, thumbPath);
    }
    
    process.exit(1);
  }
}

main();
