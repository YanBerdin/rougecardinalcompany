#!/usr/bin/env tsx
/**
 * Database Backup Script for TASK050
 * 
 * PURPOSE:
 *   Automated weekly database backup using pg_dump.
 *   Uploads compressed dumps to Supabase Storage bucket 'backups'.
 *   Implements 4-week rotation policy (keeps last 4 backups).
 * 
 * EXECUTION:
 *   - GitHub Actions: Weekly schedule (Sunday 3am UTC)
 *   - Manual: pnpm exec tsx scripts/backup-database.ts
 * 
 * REQUIRES:
 *   - SUPABASE_DB_URL: PostgreSQL connection string
 *   - SUPABASE_SECRET_KEY: Service role key for Storage upload
 *   - NEXT_PUBLIC_SUPABASE_URL: Supabase project URL
 * 
 * OUTPUTS:
 *   - backup-YYYYMMDD-HHMMSS.dump.gz in bucket 'backups'
 *   - Console logs with timestamp, size, upload status
 * 
 * NOTE:
 *   This script uses process.env directly instead of T3 Env to avoid
 *   validation issues in GitHub Actions context where only backup-related
 *   variables are available.
 */

import { createClient } from "@supabase/supabase-js";
import { spawn } from "child_process";
import { createWriteStream, createReadStream, statSync, unlinkSync } from "fs";
import { createGzip } from "zlib";
import { pipeline } from "stream/promises";
import dotenv from "dotenv";

// Load .env.local for local execution
dotenv.config({ path: ".env.local" });

/**
 * Validate required environment variables
 * Using process.env directly to avoid T3 Env validation in CI context
 */
function validateEnv(): {
    dbUrl: string;
    supabaseUrl: string;
    secretKey: string;
} {
    const dbUrl = process.env.SUPABASE_DB_URL ?? process.env.TEST_DB_URL;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SECRET_KEY;

    const missing: string[] = [];

    if (!dbUrl) missing.push("SUPABASE_DB_URL or TEST_DB_URL");
    if (!supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
    if (!secretKey) missing.push("SUPABASE_SECRET_KEY");

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
    }

    return { dbUrl: dbUrl!, supabaseUrl: supabaseUrl!, secretKey: secretKey! };
}

// Validate and get environment variables
const ENV = validateEnv();

/**
 * Execute pg_dump and compress output
 */
async function createDatabaseDump(outputPath: string): Promise<void> {
    console.log("📦 Starting pg_dump (custom format)...");

    return new Promise((resolve, reject) => {
        const pgDump = spawn("pg_dump", [
            "--format=custom",
            "--verbose",
            "--no-owner",
            "--no-privileges",
            ENV.dbUrl,
        ]);

        const gzip = createGzip({ level: 9 });
        const output = createWriteStream(outputPath);

        pipeline(pgDump.stdout, gzip, output)
            .then(() => {
                console.log("✅ Database dump created successfully");
                resolve();
            })
            .catch((error) => {
                console.error("❌ pg_dump failed:", error);
                reject(error);
            });

        pgDump.stderr.on("data", (data) => {
            // pg_dump writes progress to stderr
            const message = data.toString().trim();
            if (message && !message.includes("COPY")) {
                console.log(`  ${message}`);
            }
        });

        pgDump.on("error", (error) => {
            console.error("❌ Failed to start pg_dump:", error);
            reject(error);
        });
    });
}

/**
 * Upload dump to Supabase Storage bucket 'backups'
 */
async function uploadToStorage(
    filePath: string,
    fileName: string
): Promise<void> {
    const supabase = createClient(
        ENV.supabaseUrl,
        ENV.secretKey
    );

    console.log(`📤 Uploading ${fileName} to Storage...`);

    const fileBuffer = createReadStream(filePath);
    const { data, error } = await supabase.storage
        .from("backups")
        .upload(fileName, fileBuffer, {
            contentType: "application/gzip",
            cacheControl: "3600",
            upsert: false,
        });

    if (error) {
        throw new Error(`Storage upload failed: ${error.message}`);
    }

    const stats = statSync(filePath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

    console.log(`✅ Upload successful: ${fileName} (${sizeMB} MB)`);
    console.log(`   Path: ${data.path}`);
}

/**
 * Delete old backups (keep only last 4)
 */
async function rotateOldBackups(): Promise<void> {
    const supabase = createClient(
        ENV.supabaseUrl,
        ENV.secretKey
    );

    console.log("🗑️  Checking for old backups to rotate...");

    const { data: files, error: listError } = await supabase.storage
        .from("backups")
        .list("", {
            limit: 100,
            sortBy: { column: "created_at", order: "desc" },
        });

    if (listError) {
        console.warn("⚠️  Failed to list backups:", listError.message);
        return;
    }

    if (!files || files.length <= 4) {
        console.log("✅ No rotation needed (keeping all backups)");
        return;
    }

    // Keep first 4 (most recent), delete the rest
    const filesToDelete = files.slice(4);
    console.log(`📋 Found ${files.length} backups, deleting ${filesToDelete.length} old ones...`);

    for (const file of filesToDelete) {
        const { error: deleteError } = await supabase.storage
            .from("backups")
            .remove([file.name]);

        if (deleteError) {
            console.error(`  ❌ Failed to delete ${file.name}:`, deleteError.message);
        } else {
            console.log(`  ✅ Deleted: ${file.name}`);
        }
    }
}

/**
 * Main backup workflow
 */
async function main() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
    const fileName = `backup-${timestamp}.dump.gz`;
    const tempPath = `/tmp/${fileName}`;

    console.log("═".repeat(60));
    console.log("🗄️  DATABASE BACKUP - TASK050");
    console.log("═".repeat(60));
    console.log(`📅 Started at: ${new Date().toISOString()}`);
    console.log(`📁 Output file: ${fileName}\n`);

    try {
        // Step 1: Create compressed dump
        await createDatabaseDump(tempPath);

        // Step 2: Upload to Storage
        await uploadToStorage(tempPath, fileName);

        // Step 3: Rotate old backups
        await rotateOldBackups();

        // Step 4: Cleanup temp file
        console.log("\n🧹 Cleaning up temporary file...");
        unlinkSync(tempPath);
        console.log("✅ Temporary file deleted");

        console.log("\n═".repeat(60));
        console.log("✅ BACKUP COMPLETED SUCCESSFULLY");
        console.log("═".repeat(60));
        process.exit(0);
    } catch (error) {
        console.error("\n═".repeat(60));
        console.error("❌ BACKUP FAILED");
        console.error("═".repeat(60));
        console.error("Error:", error instanceof Error ? error.message : error);

        // Cleanup temp file if it exists
        try {
            if (statSync(tempPath)) {
                unlinkSync(tempPath);
                console.log("🧹 Cleaned up temporary file");
            }
        } catch {
            // File doesn't exist, ignore
        }

        process.exit(1);
    }
}

main();
