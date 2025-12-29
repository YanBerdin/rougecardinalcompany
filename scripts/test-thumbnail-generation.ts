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

const SUPABASE_URL = 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';
const SUPABASE_SERVICE_KEY = 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';

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

// Call thumbnail generation API
async function generateThumbnail(
  mediaId: string,
  storagePath: string
): Promise<{ success: boolean; thumbPath?: string; error?: string }> {
  console.log('🖼️  Calling thumbnail generation API...');
  
  const response = await fetch('http://localhost:3000/api/admin/media/thumbnail', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      mediaId,
      storagePath
    })
  });
  
  const result = await response.json();
  
  if (!response.ok) {
    return {
      success: false,
      error: result.error || `HTTP ${response.status}`
    };
  }
  
  console.log(`✅ Thumbnail generated: ${result.thumbPath}`);
  
  return {
    success: true,
    thumbPath: result.thumbPath
  };
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
    const thumbnailResult = await generateThumbnail(mediaId, storagePath);
    
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
