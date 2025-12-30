/**
 * @file validate-media-folders.ts
 * @description Validation script for media folder synchronization
 * 
 * This script checks for:
 * 1. Orphan medias: medias without matching folder (folder_id is null but storage_path has a folder prefix)
 * 2. Missing folders: medias pointing to non-existent folders
 * 3. Storage paths not matching any folder slug
 * 
 * Usage: pnpm exec tsx scripts/validate-media-folders.ts
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface MediaRecord {
    id: number;
    filename: string;
    storage_path: string;
    folder_id: number | null;
}

interface MediaFolder {
    id: number;
    name: string;
    slug: string;
}

type ValidationIssue = {
    type: "orphan" | "missing_folder" | "unknown_prefix";
    mediaId: number;
    filename: string;
    storagePath: string;
    currentFolderId: number | null;
    expectedSlug: string | null;
    details: string;
};

function extractFolderFromPath(storagePath: string): string | null {
    if (!storagePath) return null;
    const parts = storagePath.split("/");
    return parts.length > 1 ? parts[0] : null;
}

async function validateMediaFolders(): Promise<void> {
    console.log("🔍 Validating media folder synchronization...\n");

    const { data: medias, error: mediaError } = await supabase
        .from("medias")
        .select("id, filename, storage_path, folder_id")
        .order("id");

    if (mediaError) {
        console.error("❌ Error fetching medias:", mediaError.message);
        process.exit(1);
    }

    const { data: folders, error: folderError } = await supabase
        .from("media_folders")
        .select("id, name, slug");

    if (folderError) {
        console.error("❌ Error fetching folders:", folderError.message);
        process.exit(1);
    }

    const folderBySlug = new Map<string, MediaFolder>();
    const folderById = new Map<number, MediaFolder>();

    for (const folder of folders as MediaFolder[]) {
        folderBySlug.set(folder.slug, folder);
        folderById.set(folder.id, folder);
    }

    const issues: ValidationIssue[] = [];
    let correctCount = 0;

    for (const media of medias as MediaRecord[]) {
        const pathPrefix = extractFolderFromPath(media.storage_path);

        if (!pathPrefix) {
            if (media.folder_id !== null) {
                issues.push({
                    type: "orphan",
                    mediaId: media.id,
                    filename: media.filename,
                    storagePath: media.storage_path,
                    currentFolderId: media.folder_id,
                    expectedSlug: null,
                    details: `Media has folder_id=${media.folder_id} but storage_path has no folder prefix`,
                });
            }
            continue;
        }

        const expectedFolder = folderBySlug.get(pathPrefix);

        if (!expectedFolder) {
            issues.push({
                type: "unknown_prefix",
                mediaId: media.id,
                filename: media.filename,
                storagePath: media.storage_path,
                currentFolderId: media.folder_id,
                expectedSlug: pathPrefix,
                details: `Storage path prefix "${pathPrefix}" does not match any folder slug`,
            });
            continue;
        }

        if (media.folder_id === null) {
            issues.push({
                type: "orphan",
                mediaId: media.id,
                filename: media.filename,
                storagePath: media.storage_path,
                currentFolderId: null,
                expectedSlug: pathPrefix,
                details: `Media should be linked to folder "${expectedFolder.name}" (id=${expectedFolder.id})`,
            });
        } else if (media.folder_id !== expectedFolder.id) {
            const currentFolder = folderById.get(media.folder_id);
            issues.push({
                type: "missing_folder",
                mediaId: media.id,
                filename: media.filename,
                storagePath: media.storage_path,
                currentFolderId: media.folder_id,
                expectedSlug: pathPrefix,
                details: `Media linked to "${currentFolder?.name ?? "unknown"}" but path suggests "${expectedFolder.name}"`,
            });
        } else {
            correctCount++;
        }
    }

    console.log("📊 VALIDATION RESULTS\n");
    console.log(`✅ Correctly linked medias: ${correctCount}`);
    console.log(`⚠️  Issues found: ${issues.length}\n`);

    if (issues.length > 0) {
        console.log("📋 ISSUES DETAIL:\n");

        const orphans = issues.filter((i) => i.type === "orphan");
        const unknownPrefixes = issues.filter((i) => i.type === "unknown_prefix");
        const missingFolders = issues.filter((i) => i.type === "missing_folder");

        if (orphans.length > 0) {
            console.log(`\n🔴 ORPHAN MEDIAS (${orphans.length}):`);
            for (const issue of orphans) {
                console.log(`   - ID ${issue.mediaId}: ${issue.filename}`);
                console.log(`     Path: ${issue.storagePath}`);
                console.log(`     ${issue.details}\n`);
            }
        }

        if (unknownPrefixes.length > 0) {
            console.log(`\n🟠 UNKNOWN PATH PREFIXES (${unknownPrefixes.length}):`);
            const uniquePrefixes = [...new Set(unknownPrefixes.map((i) => i.expectedSlug))];
            console.log(`   Unique prefixes needing folders: ${uniquePrefixes.join(", ")}\n`);
            for (const issue of unknownPrefixes) {
                console.log(`   - ID ${issue.mediaId}: ${issue.filename}`);
                console.log(`     Path: ${issue.storagePath}`);
                console.log(`     ${issue.details}\n`);
            }
        }

        if (missingFolders.length > 0) {
            console.log(`\n🟡 WRONG FOLDER ASSIGNMENT (${missingFolders.length}):`);
            for (const issue of missingFolders) {
                console.log(`   - ID ${issue.mediaId}: ${issue.filename}`);
                console.log(`     Path: ${issue.storagePath}`);
                console.log(`     ${issue.details}\n`);
            }
        }

        console.log("\n💡 SUGGESTED FIX SQL:\n");
        console.log("-- Auto-assign folder_id based on storage_path prefix");
        console.log(`UPDATE medias m
SET folder_id = mf.id
FROM media_folders mf
WHERE split_part(m.storage_path, '/', 1) = mf.slug
  AND (m.folder_id IS NULL OR m.folder_id != mf.id);
`);
    } else {
        console.log("🎉 All medias are correctly linked to their folders!");
    }

    console.log("\n📁 REGISTERED FOLDERS:");
    for (const folder of folders as MediaFolder[]) {
        const count = (medias as MediaRecord[]).filter(
            (m) => m.folder_id === folder.id
        ).length;
        console.log(`   - ${folder.name} (slug: ${folder.slug}) → ${count} medias`);
    }
}

validateMediaFolders()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Fatal error:", error);
        process.exit(1);
    });
