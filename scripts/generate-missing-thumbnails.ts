/**
 * Migration Script: Generate Thumbnails for Media without thumbnail_path
 *
 * Purpose: Batch generate thumbnails for all existing media items that were
 *          uploaded before Phase 3 (Thumbnails Implementation) or uploaded
 *          through other means that bypassed thumbnail generation.
 *
 * Usage:
 *   pnpm exec tsx scripts/generate-missing-thumbnails.ts
 *
 * Safety:
 *   - Non-destructive: Only updates medias.thumbnail_path column
 *   - Batch processing: 5 medias at a time to avoid overload
 *   - Error handling: Continues even if individual thumbnails fail
 *   - Dry-run mode available via DRY_RUN=true env var
 *
 * Author: System Agent
 * Date: 5 Février 2026
 */

import { createClient } from "@supabase/supabase-js";
import { env } from "../lib/env";

// ============================================================================
// Configuration
// ============================================================================

const BATCH_SIZE = 5; // Process 5 medias at a time
const BATCH_DELAY_MS = 1000; // Wait 1s between batches
const DRY_RUN = process.env.DRY_RUN === "true";

// ============================================================================
// Types
// ============================================================================

interface MediaWithoutThumbnail {
    id: bigint;
    filename: string;
    storage_path: string;
    mime_type: string;
}

interface MigrationStats {
    total: number;
    succeeded: number;
    failed: number;
    skipped: number;
}

// ============================================================================
// Main Function
// ============================================================================

async function generateMissingThumbnails() {
    console.log("🚀 [Migration] Starting thumbnail generation for existing media...");
    console.log(`📊 [Config] Batch size: ${BATCH_SIZE}, Delay: ${BATCH_DELAY_MS}ms`);
    console.log(`🔧 [Mode] ${DRY_RUN ? "DRY RUN (no changes)" : "LIVE (will modify database)"}\n`);

    // Initialize Supabase client with service role key for admin access
    const supabase = createClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.SUPABASE_SECRET_KEY // Service role key for admin operations
    );

    // Stats tracking
    const stats: MigrationStats = {
        total: 0,
        succeeded: 0,
        failed: 0,
        skipped: 0,
    };

    try {
        // ========================================================================
        // Step 1: Fetch all medias without thumbnail
        // ========================================================================
        console.log("📥 [Step 1/3] Fetching medias without thumbnail...");

        const { data: medias, error } = await supabase
            .from("medias")
            .select("id, filename, storage_path, mime_type")
            .is("thumbnail_path", null)
            .like("mime_type", "image/%")
            .order("created_at", { ascending: false }); // Process newest first

        if (error) {
            console.error("❌ [Error] Failed to fetch medias:", error.message);
            process.exit(1);
        }

        if (!medias || medias.length === 0) {
            console.log("✅ [Success] No medias found without thumbnail. Migration complete!");
            return;
        }

        stats.total = medias.length;
        console.log(`📊 [Found] ${medias.length} media(s) without thumbnail\n`);

        // Display first 10 medias
        console.log("📋 [Preview] First 10 medias to process:");
        medias.slice(0, 10).forEach((media, index) => {
            console.log(
                `   ${index + 1}. [${media.id}] ${media.filename} (${media.mime_type})`
            );
        });
        if (medias.length > 10) {
            console.log(`   ... and ${medias.length - 10} more\n`);
        }

        if (DRY_RUN) {
            console.log("\n🔧 [Dry Run] Exiting without making changes.");
            console.log(
                `ℹ️  To run the migration, execute: pnpm exec tsx scripts/generate-missing-thumbnails.ts\n`
            );
            return;
        }

        // ========================================================================
        // Step 2: Generate thumbnails in batches
        // ========================================================================
        console.log(
            `\n🔨 [Step 2/3] Generating thumbnails (${BATCH_SIZE} at a time)...\n`
        );

        for (let i = 0; i < medias.length; i += BATCH_SIZE) {
            const batch = medias.slice(i, i + BATCH_SIZE);
            const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
            const totalBatches = Math.ceil(medias.length / BATCH_SIZE);

            console.log(
                `📦 [Batch ${batchNumber}/${totalBatches}] Processing ${batch.length} media(s)...`
            );

            // Process batch in parallel
            const results = await Promise.allSettled(
                batch.map((media) => generateThumbnailForMedia(media))
            );

            // Update stats
            results.forEach((result, index) => {
                const media = batch[index];

                if (result.status === "fulfilled") {
                    const value = result.value;

                    if ("success" in value && value.success) {
                        stats.succeeded++;
                        console.log(
                            `   ✅ [${media.id}] ${media.filename} → ${value.thumbPath}`
                        );
                    } else if ("skipped" in value && value.skipped) {
                        stats.skipped++;
                        console.log(
                            `   ⏭️  [${media.id}] ${media.filename} → Skipped: ${value.reason}`
                        );
                    } else if ("success" in value && !value.success) {
                        stats.failed++;
                        console.error(
                            `   ❌ [${media.id}] ${media.filename} → Error: ${value.error}`
                        );
                    }
                } else {
                    stats.failed++;
                    console.error(
                        `   ❌ [${media.id}] ${media.filename} → Rejected: ${result.reason}`
                    );
                }
            });

            // Wait between batches (except for last batch)
            if (i + BATCH_SIZE < medias.length) {
                console.log(`   ⏳ Waiting ${BATCH_DELAY_MS}ms before next batch...\n`);
                await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
            }
        }

        // ========================================================================
        // Step 3: Display summary
        // ========================================================================
        console.log("\n📊 [Step 3/3] Migration Summary:");
        console.log("═".repeat(50));
        console.log(`   Total medias:     ${stats.total}`);
        console.log(`   ✅ Succeeded:     ${stats.succeeded}`);
        console.log(`   ❌ Failed:        ${stats.failed}`);
        console.log(`   ⏭️  Skipped:       ${stats.skipped}`);
        console.log("═".repeat(50));

        const successRate = ((stats.succeeded / stats.total) * 100).toFixed(1);
        console.log(`   Success rate:     ${successRate}%\n`);

        if (stats.failed > 0) {
            console.warn(
                `⚠️  [Warning] ${stats.failed} thumbnail(s) failed to generate. Check logs above for details.`
            );
            console.log(
                `ℹ️  You can re-run this script to retry failed thumbnails, or use the "Régénérer thumbnail" button in /admin/media\n`
            );
        }

        console.log("✅ [Complete] Migration finished successfully!");
    } catch (error) {
        console.error(
            "\n❌ [Fatal Error] Migration failed:",
            error instanceof Error ? error.message : error
        );
        process.exit(1);
    }
}

// ============================================================================
// Helper: Generate Thumbnail for Single Media
// ============================================================================

async function generateThumbnailForMedia(
    media: MediaWithoutThumbnail
): Promise<
    | { success: true; thumbPath: string }
    | { success: false; error: string }
    | { skipped: true; reason: string }
> {
    try {
        // Skip non-image mimetypes (shouldn't happen due to query filter, but defensive)
        if (!media.mime_type.startsWith("image/")) {
            return {
                skipped: true,
                reason: `Not an image (${media.mime_type})`,
            };
        }

        // Call thumbnail API route
        const response = await fetch(
            `${env.NEXT_PUBLIC_SITE_URL}/api/admin/media/thumbnail`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    mediaId: String(media.id), // Convert bigint to string for JSON
                    storagePath: media.storage_path,
                }),
            }
        );

        // Check HTTP status
        if (!response.ok) {
            const errorText = await response.text();
            return {
                success: false,
                error: `HTTP ${response.status}: ${errorText}`,
            };
        }

        // Parse response
        const data = await response.json();

        if (!data.success || !data.thumbPath) {
            return {
                success: false,
                error: data.error || "Thumbnail API returned no thumb path",
            };
        }

        return {
            success: true,
            thumbPath: data.thumbPath,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

// ============================================================================
// Execute
// ============================================================================

generateMissingThumbnails();
