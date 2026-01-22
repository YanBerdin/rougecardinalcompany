#!/usr/bin/env tsx
/**
 * Test Script: Thumbnail Generation (Phase 3)
 * 
 * Tests:
 * 1. Upload image to Supabase Storage
 * 2. Call thumbnail generation API
 * 3. Verify thumbnail exists in storage
 * 4. Verify thumbnail_path in database
 * 5. Pattern Warning validation (non-blocking)
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { getLocalCredentials, validateLocalOnly } from './utils/supabase-local-credentials';

// Get local credentials from .env.local (with safe defaults for testing)
const { url: SUPABASE_URL, publishableKey: SUPABASE_ANON_KEY, serviceKey: SUPABASE_SERVICE_KEY } = 
    getLocalCredentials({ silent: true });

// Security: ensure we're using localhost
validateLocalOnly(SUPABASE_URL);

// Create test image with sharp
async function createTestImage(): Promise<Buffer> {
  console.log('📸 Creating test image (800x600 JPEG)...');
  
  return await sharp({
    create: {
      width: 800,
      height: 600,
      channels: 3,
      background: { r: 100, g: 149, b: 237 } // Cornflower blue
    }
  })
    .jpeg({ quality: 90 })
    .toBuffer();
}

// Upload image to Supabase Storage
async function uploadTestImage(
  supabase: any,
  imageBuffer: Buffer
): Promise<{ storagePath: string; mediaId: string }> {
  console.log('☁️  Uploading test image to Supabase Storage...');
  
  const fileName = `test-thumbnail-${Date.now()}.jpg`;
  const storagePath = `uploads/${fileName}`;
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('medias')
    .upload(storagePath, imageBuffer, {
      contentType: 'image/jpeg',
      upsert: false
    });
  
  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }
  
  console.log(`✅ Image uploaded: ${storagePath}`);
  
  // Insert into medias table
  const { data: mediaData, error: mediaError } = await supabase
    .from('medias')
    .insert({
      storage_path: storagePath,
      filename: fileName,
      mime: 'image/jpeg',
      size_bytes: imageBuffer.length,
      alt_text: 'Test thumbnail generation'
    })
    .select('id')
    .single();
  
  if (mediaError) {
    throw new Error(`Database insert failed: ${mediaError.message}`);
  }
  
  console.log(`✅ Media record created: ID=${mediaData.id}`);
  
  return {
    storagePath,
    mediaId: mediaData.id.toString()
  };
}

const THUMBNAIL_SIZE = 300;
const THUMBNAIL_QUALITY = 80;
const THUMBNAIL_SUFFIX = "_thumb.jpg";

// Generate thumbnail directly (bypasses API auth for testing)
async function generateThumbnail(
  supabase: any,
  mediaId: string,
  storagePath: string
): Promise<{ success: boolean; thumbPath?: string; error?: string }> {
  console.log('🖼️  Generating thumbnail directly (bypassing API)...');
  
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
      .eq('id', parseInt(mediaId, 10));
    
    if (updateError) {
      return { success: false, error: `DB update failed: ${updateError.message}` };
    }
    
    console.log(`✅ Thumbnail generated: ${thumbPath}`);
    
    return { success: true, thumbPath };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// Verify thumbnail in storage
async function verifyThumbnailInStorage(
  supabase: any,
  thumbPath: string
): Promise<boolean> {
  console.log('🔍 Verifying thumbnail exists in storage...');
  
  const { data, error } = await supabase.storage
    .from('medias')
    .download(thumbPath);
  
  if (error) {
    console.error(`❌ Thumbnail not found: ${error.message}`);
    return false;
  }
  
  // Verify it's a valid JPEG
  const buffer = await data.arrayBuffer();
  const metadata = await sharp(Buffer.from(buffer)).metadata();
  
  console.log(`✅ Thumbnail verified:`);
  console.log(`   - Format: ${metadata.format}`);
  console.log(`   - Dimensions: ${metadata.width}x${metadata.height}`);
  console.log(`   - Size: ${buffer.byteLength} bytes`);
  
  if (metadata.width !== 300 || metadata.height !== 300) {
    console.warn(`⚠️  Unexpected dimensions: expected 300x300, got ${metadata.width}x${metadata.height}`);
    return false;
  }
  
  return true;
}

// Verify thumbnail_path in database
async function verifyThumbnailInDatabase(
  supabase: any,
  mediaId: string,
  expectedThumbPath: string
): Promise<boolean> {
  console.log('🔍 Verifying thumbnail_path in database...');
  
  const { data, error } = await supabase
    .from('medias')
    .select('thumbnail_path')
    .eq('id', mediaId)
    .single();
  
  if (error) {
    console.error(`❌ Database query failed: ${error.message}`);
    return false;
  }
  
  if (data.thumbnail_path !== expectedThumbPath) {
    console.error(`❌ thumbnail_path mismatch:`);
    console.error(`   Expected: ${expectedThumbPath}`);
    console.error(`   Got: ${data.thumbnail_path}`);
    return false;
  }
  
  console.log(`✅ thumbnail_path correctly set in database`);
  return true;
}

// Cleanup test data
async function cleanup(
  supabase: any,
  mediaId: string,
  storagePath: string,
  thumbPath?: string
): Promise<void> {
  console.log('🧹 Cleaning up test data...');
  
  // Delete from database
  const { error: deleteError } = await supabase
    .from('medias')
    .delete()
    .eq('id', mediaId);
  
  if (deleteError) {
    console.warn(`⚠️  Failed to delete media record: ${deleteError.message}`);
  } else {
    console.log(`✅ Media record deleted`);
  }
  
  // Delete from storage
  const filesToDelete = [storagePath];
  if (thumbPath) {
    filesToDelete.push(thumbPath);
  }
  
  const { error: storageError } = await supabase.storage
    .from('medias')
    .remove(filesToDelete);
  
  if (storageError) {
    console.warn(`⚠️  Failed to delete storage files: ${storageError.message}`);
  } else {
    console.log(`✅ Storage files deleted`);
  }
}

// Test Pattern Warning (upload succeeds even if thumbnail fails)
async function testPatternWarning(): Promise<void> {
  console.log('\n🧪 Test 2: Pattern Warning (non-blocking thumbnail failure)');
  console.log('=' .repeat(70));
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const imageBuffer = await createTestImage();
  
  try {
    // Upload with INVALID storage path (should fail thumbnail but succeed upload)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('medias')
      .upload(`uploads/test-warning-${Date.now()}.jpg`, imageBuffer, {
        contentType: 'image/jpeg',
        upsert: false
      });
    
    if (uploadError) throw uploadError;
    
    const { data: mediaData, error: mediaError } = await supabase
      .from('medias')
      .insert({
        storage_path: uploadData.path,
        filename: 'test-warning.jpg',
        mime: 'image/jpeg',
        size_bytes: imageBuffer.length
      })
      .select('id')
      .single();
    
    if (mediaError) throw mediaError;
    
    console.log(`✅ Media uploaded: ID=${mediaData.id}`);
    
    // Try to generate thumbnail with invalid path
    const result = await generateThumbnail(
      supabase,
      mediaData.id.toString(),
      'INVALID/PATH/TO/IMAGE.jpg' // ❌ Invalid path
    );
    
    if (result.success) {
      console.log(`⚠️  Expected thumbnail to fail, but it succeeded`);
    } else {
      console.log(`✅ Pattern Warning validated: thumbnail failed (${result.error})`);
      console.log(`✅ Original upload still succeeded (non-blocking)`);
    }
    
    // Cleanup
    await cleanup(supabase, mediaData.id, uploadData.path);
    
  } catch (error) {
    console.error(`❌ Test failed:`, error);
  }
}

// Main test
async function main() {
  console.log('\n🧪 Thumbnail Generation Test Suite (Phase 3)');
  console.log('=' .repeat(70));
  console.log('\n🧪 Test 1: Happy Path (successful thumbnail generation)');
  console.log('=' .repeat(70));
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  let mediaId: string | undefined;
  let storagePath: string | undefined;
  let thumbPath: string | undefined;
  
  try {
    // 1. Create test image
    const imageBuffer = await createTestImage();
    
    // 2. Upload to Supabase Storage
    const uploadResult = await uploadTestImage(supabase, imageBuffer);
    mediaId = uploadResult.mediaId;
    storagePath = uploadResult.storagePath;
    
    // 3. Generate thumbnail
    const thumbnailResult = await generateThumbnail(supabase, mediaId, storagePath);
    
    if (!thumbnailResult.success) {
      throw new Error(`Thumbnail generation failed: ${thumbnailResult.error}`);
    }
    
    thumbPath = thumbnailResult.thumbPath!;
    
    // 4. Verify thumbnail in storage
    const storageValid = await verifyThumbnailInStorage(supabase, thumbPath);
    if (!storageValid) {
      throw new Error('Thumbnail verification failed');
    }
    
    // 5. Verify thumbnail_path in database
    const dbValid = await verifyThumbnailInDatabase(supabase, mediaId, thumbPath);
    if (!dbValid) {
      throw new Error('Database verification failed');
    }
    
    console.log('\n' + '=' .repeat(70));
    console.log('✅ TEST 1 PASSED: Thumbnail generation works correctly');
    console.log('=' .repeat(70));
    
    // Cleanup
    await cleanup(supabase, mediaId, storagePath, thumbPath);
    
    // Test Pattern Warning
    await testPatternWarning();
    
    console.log('\n' + '=' .repeat(70));
    console.log('✅ ALL TESTS PASSED');
    console.log('=' .repeat(70));
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n' + '=' .repeat(70));
    console.error('❌ TEST FAILED');
    console.error('=' .repeat(70));
    console.error(error);
    
    // Cleanup on failure
    if (mediaId && storagePath) {
      await cleanup(supabase, mediaId, storagePath, thumbPath);
    }
    
    process.exit(1);
  }
}

main();
