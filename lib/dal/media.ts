"use server";
import "server-only";
import { createClient } from "@/supabase/server";
import { requireAdmin } from "@/lib/auth/is-admin";
import type { DALResult } from "@/lib/dal/helpers";

/**
 * @file Media Data Access Layer
 * @description Database and Storage operations for media files
 */
//TODO: Split into smaller files if this grows too large
// =============================================================================
// TYPES
// =============================================================================

export interface MediaUploadInput {
    file: File;
    folder: string;
    uploadedBy: string | undefined;
    fileHash?: string;
}

export interface MediaUploadData {
    mediaId: number;
    publicUrl: string;
    storagePath: string;
}

export interface MediaRecord {
    id: number;
    storage_path: string;
    filename: string;
    mime: string;
    size_bytes: number;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const BUCKET_NAME = "medias";

// =============================================================================
// HELPER FUNCTIONS (< 30 lines each)
// =============================================================================

function generateStoragePath(folder: string, filename: string): string {
    const timestamp = Date.now();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "-");
    return `${folder}/${timestamp}-${sanitizedFilename}`;
}

async function uploadToStorage(
    supabase: Awaited<ReturnType<typeof createClient>>,
    storagePath: string,
    file: File
): Promise<DALResult<null>> {
    const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(storagePath, file, {
            cacheControl: "3600",
            upsert: false,
        });

    if (error) {
        console.error("[DAL] Storage upload error:", error);
        return {
            success: false,
            error: `Storage upload failed: ${error.message}`,
        };
    }

    return { success: true, data: null };
}

async function getPublicUrl(
    supabase: Awaited<ReturnType<typeof createClient>>,
    storagePath: string
): Promise<string> {
    const {
        data: { publicUrl },
    } = await supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath);
    return publicUrl;
}

/**
 * Validate storage path and get matching folder_id
 * @param supabase - Supabase client
 * @param storagePath - Full storage path (e.g., "team/123-photo.jpg")
 * @returns folder_id if matching folder exists, null otherwise
 */
async function getFolderIdFromPath(
    supabase: Awaited<ReturnType<typeof createClient>>,
    storagePath: string
): Promise<bigint | null> {
    const folderSlug = storagePath.split("/")[0];
    
    const { data } = await supabase
        .from("media_folders")
        .select("id")
        .eq("slug", folderSlug)
        .maybeSingle();
    
    if (!data) {
        console.warn(`[DAL] No matching folder for path prefix: ${folderSlug}`);
        return null;
    }
    
    return BigInt(data.id);
}

async function createMediaRecord(
    supabase: Awaited<ReturnType<typeof createClient>>,
    input: MediaUploadInput,
    storagePath: string,
    folderId: bigint | null
): Promise<DALResult<number>> {
    const { data, error } = await supabase
        .from("medias")
        .insert({
            storage_path: storagePath,
            filename: input.file.name,
            mime: input.file.type,
            size_bytes: input.file.size,
            file_hash: input.fileHash,
            uploaded_by: input.uploadedBy,
            folder_id: folderId ? String(folderId) : null,
        })
        .select("id")
        .single();

    if (error || !data) {
        console.error("[DAL] Database insert error:", error);
        return {
            success: false,
            error: "Database record creation failed",
        };
    }

    return { success: true, data: data.id };
}

async function cleanupStorage(
    supabase: Awaited<ReturnType<typeof createClient>>,
    storagePath: string
): Promise<void> {
    try {
        await supabase.storage.from(BUCKET_NAME).remove([storagePath]);
    } catch (error) {
        console.error("[DAL] Cleanup failed:", error);
    }
}

// =============================================================================
// PUBLIC DAL FUNCTIONS
// =============================================================================

/**
 * Upload media file to Storage and create database record
 * 
 * @param input - File, folder, and uploader information
 * @returns DALResult with media ID, public URL, and storage path
 */
export async function uploadMedia(
    input: MediaUploadInput
): Promise<DALResult<MediaUploadData>> {
    // ✅ Defense in depth: Always check auth at DAL level
    await requireAdmin();

    const supabase = await createClient();
    const storagePath = generateStoragePath(input.folder, input.file.name);

    // 1. Upload to Storage
    const uploadResult = await uploadToStorage(supabase, storagePath, input.file);
    if (!uploadResult.success) {
        return uploadResult;
    }

    // 2. Get public URL
    const publicUrl = await getPublicUrl(supabase, storagePath);

    // 3. Auto-assign folder_id based on storage path prefix
    const folderId = await getFolderIdFromPath(supabase, storagePath);

    // 4. Create database record with folder_id
    const dbResult = await createMediaRecord(supabase, input, storagePath, folderId);
    if (!dbResult.success) {
        await cleanupStorage(supabase, storagePath);
        return dbResult;
    }

    return {
        success: true,
        data: {
            mediaId: dbResult.data,
            publicUrl,
            storagePath,
        },
    };
}

/**
 * Delete media from Storage and database
 * 
 * @param mediaId - Media record ID
 * @returns DALResult with null data on success
 */
export async function deleteMedia(
    mediaId: number
): Promise<DALResult<null>> {
    await requireAdmin();

    const supabase = await createClient();

    // 1. Fetch media record
    const { data: media, error: fetchError } = await supabase
        .from("medias")
        .select("storage_path")
        .eq("id", mediaId)
        .single();

    if (fetchError || !media) {
        return {
            success: false,
            error: "Media not found",
        };
    }

    // 2. Delete from Storage (best effort)
    await cleanupStorage(supabase, media.storage_path);

    // 3. Delete from database
    const { error: dbError } = await supabase
        .from("medias")
        .delete()
        .eq("id", mediaId);

    if (dbError) {
        console.error("[DAL] Database delete error:", dbError);
        return {
            success: false,
            error: "Database deletion failed",
        };
    }

    return { success: true, data: null };
}

/**
 * Fetch media record by ID
 * 
 * @param mediaId - Media record ID
 * @returns DALResult with media record
 */
export async function getMediaById(
    mediaId: number
): Promise<DALResult<MediaRecord>> {
    await requireAdmin();

    const supabase = await createClient();

    const { data, error } = await supabase
        .from("medias")
        .select("id, storage_path, filename, mime, size_bytes")
        .eq("id", mediaId)
        .single();

    if (error || !data) {
        return {
            success: false,
            error: "Media not found",
        };
    }

    return { success: true, data };
}

/**
 * Find media by file hash
 * 
 * @param fileHash - SHA-256 hash (64 hex chars)
 * @returns DALResult with media record or null if not found
 */
export async function findMediaByHash(
    fileHash: string
): Promise<DALResult<MediaRecord | null>> {
    await requireAdmin();

    const supabase = await createClient();

    const { data, error } = await supabase
        .from("medias")
        .select("id, storage_path, filename, mime, size_bytes")
        .eq("file_hash", fileHash)
        .maybeSingle();

    if (error) {
        return {
            success: false,
            error: "Database query failed",
        };
    }

    return { success: true, data };
}

/**
 * Get public URL for a storage path
 * 
 * @param storagePath - Storage path in bucket
 * @returns Public URL
 */
export async function getMediaPublicUrl(storagePath: string): Promise<string> {
    const supabase = await createClient();
    const {
        data: { publicUrl },
    } = await supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath);
    return publicUrl;
}

// =============================================================================
// MEDIA TAGS CRUD
// =============================================================================

/**
 * List all media tags
 */
export async function listMediaTags(): Promise<DALResult<Array<{
    id: bigint;
    name: string;
    slug: string;
    description: string | null;
    color: string | null;
    created_at: Date;
    updated_at: Date;
}>>> {
    await requireAdmin();

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("media_tags")
        .select("*")
        .order("name");

    if (error) {
        return {
            success: false,
            error: `Failed to list media tags: ${error.message}`,
        };
    }

    return { success: true, data: data ?? [] };
}

/**
 * Get media tag by ID
 */
export async function getMediaTagById(id: bigint): Promise<DALResult<{
    id: bigint;
    name: string;
    slug: string;
    description: string | null;
    color: string | null;
    created_at: Date;
    updated_at: Date;
} | null>> {
    await requireAdmin();

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("media_tags")
        .select("*")
        .eq("id", String(id))
        .maybeSingle();

    if (error) {
        return {
            success: false,
            error: `Failed to get media tag: ${error.message}`,
        };
    }

    return { success: true, data };
}

/**
 * Create media tag
 */
export async function createMediaTag(input: {
    name: string;
    slug: string;
    description?: string | null;
    color?: string | null;
}): Promise<DALResult<{
    id: bigint;
    name: string;
    slug: string;
    description: string | null;
    color: string | null;
    created_at: Date;
    updated_at: Date;
}>> {
    await requireAdmin();

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("media_tags")
        .insert({
            name: input.name,
            slug: input.slug,
            description: input.description ?? null,
            color: input.color ?? null,
        })
        .select()
        .single();

    if (error) {
        return {
            success: false,
            error: `Failed to create media tag: ${error.message}`,
        };
    }

    return { success: true, data };
}

/**
 * Update media tag
 */
export async function updateMediaTag(
    id: bigint,
    input: Partial<{
        name: string;
        description: string | null;
        color: string | null;
    }>
): Promise<DALResult<{
    id: bigint;
    name: string;
    slug: string;
    description: string | null;
    color: string | null;
    created_at: Date;
    updated_at: Date;
}>> {
    await requireAdmin();

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("media_tags")
        .update(input)
        .eq("id", String(id))
        .select()
        .single();

    if (error) {
        return {
            success: false,
            error: `Failed to update media tag: ${error.message}`,
        };
    }

    return { success: true, data };
}

/**
 * Delete media tag
 */
export async function deleteMediaTag(id: bigint): Promise<DALResult<null>> {
    await requireAdmin();

    const supabase = await createClient();
    const { error } = await supabase
        .from("media_tags")
        .delete()
        .eq("id", String(id));

    if (error) {
        return {
            success: false,
            error: `Failed to delete media tag: ${error.message}`,
        };
    }

    return { success: true, data: null };
}

// =============================================================================
// MEDIA FOLDERS CRUD
// =============================================================================

/**
 * List all media folders
 */
export async function listMediaFolders(): Promise<DALResult<Array<{
    id: bigint;
    name: string;
    slug: string;
    description: string | null;
    parent_id: bigint | null;
    created_at: Date;
    updated_at: Date;
}>>> {
    await requireAdmin();

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("media_folders")
        .select("*")
        .order("name");

    if (error) {
        return {
            success: false,
            error: `Failed to list media folders: ${error.message}`,
        };
    }

    return { success: true, data: data ?? [] };
}

/**
 * Get media folder by ID
 */
export async function getMediaFolderById(id: bigint): Promise<DALResult<{
    id: bigint;
    name: string;
    slug: string;
    description: string | null;
    parent_id: bigint | null;
    created_at: Date;
    updated_at: Date;
} | null>> {
    await requireAdmin();

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("media_folders")
        .select("*")
        .eq("id", String(id))
        .maybeSingle();

    if (error) {
        return {
            success: false,
            error: `Failed to get media folder: ${error.message}`,
        };
    }

    return { success: true, data };
}

/**
 * Create media folder
 */
export async function createMediaFolder(input: {
    name: string;
    slug: string;
    description?: string | null;
    parent_id?: bigint | null;
}): Promise<DALResult<{
    id: bigint;
    name: string;
    slug: string;
    description: string | null;
    parent_id: bigint | null;
    created_at: Date;
    updated_at: Date;
}>> {
    await requireAdmin();

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("media_folders")
        .insert({
            name: input.name,
            slug: input.slug,
            description: input.description ?? null,
            parent_id: input.parent_id ? String(input.parent_id) : null,
        })
        .select()
        .single();

    if (error) {
        return {
            success: false,
            error: `Failed to create media folder: ${error.message}`,
        };
    }

    return { success: true, data };
}

/**
 * Update media folder
 */
export async function updateMediaFolder(
    id: bigint,
    input: Partial<{
        name: string;
        slug: string;
        description: string | null;
        parent_id: bigint | null;
    }>
): Promise<DALResult<{
    id: bigint;
    name: string;
    slug: string;
    description: string | null;
    parent_id: bigint | null;
    created_at: Date;
    updated_at: Date;
}>> {
    await requireAdmin();

    const supabase = await createClient();

    const updateData: Record<string, unknown> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.slug !== undefined) updateData.slug = input.slug;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.parent_id !== undefined) {
        updateData.parent_id = input.parent_id !== null ? String(input.parent_id) : null;
    }

    const { data, error } = await supabase
        .from("media_folders")
        .update(updateData)
        .eq("id", String(id))
        .select()
        .single();

    if (error) {
        return {
            success: false,
            error: `Failed to update media folder: ${error.message}`,
        };
    }

    return { success: true, data };
}

/**
 * Delete media folder
 */
export async function deleteMediaFolder(id: bigint): Promise<DALResult<null>> {
    await requireAdmin();

    const supabase = await createClient();
    const { error } = await supabase
        .from("media_folders")
        .delete()
        .eq("id", String(id));

    if (error) {
        return {
            success: false,
            error: `Failed to delete media folder: ${error.message}`,
        };
    }

    return { success: true, data: null };
}

// =============================================================================
// MEDIA ITEM TAGS (Many-to-Many Operations)
// =============================================================================

/**
 * Add tags to media item
 */
export async function addMediaItemTags(
    mediaId: bigint,
    tagIds: bigint[]
): Promise<DALResult<null>> {
    await requireAdmin();

    const supabase = await createClient();

    const records = tagIds.map(tagId => ({
        media_id: String(mediaId),
        tag_id: String(tagId),
    }));

    const { error } = await supabase
        .from("media_item_tags")
        .insert(records);

    if (error) {
        return {
            success: false,
            error: `Failed to add tags to media: ${error.message}`,
        };
    }

    return { success: true, data: null };
}

/**
 * Remove tags from media item
 */
export async function removeMediaItemTags(
    mediaId: bigint,
    tagIds: bigint[]
): Promise<DALResult<null>> {
    await requireAdmin();

    const supabase = await createClient();

    const { error } = await supabase
        .from("media_item_tags")
        .delete()
        .eq("media_id", String(mediaId))
        .in("tag_id", tagIds.map(id => String(id)));

    if (error) {
        return {
            success: false,
            error: `Failed to remove tags from media: ${error.message}`,
        };
    }

    return { success: true, data: null };
}

/**
 * Get tags for media item
 */
export async function getMediaItemTags(mediaId: bigint): Promise<DALResult<Array<{
    id: bigint;
    name: string;
    slug: string;
    description: string | null;
    color: string | null;
}>>> {
    await requireAdmin();

    const supabase = await createClient();

    const { data, error } = await supabase
        .from("media_item_tags")
        .select("tag_id, media_tags(*)")
        .eq("media_id", String(mediaId));

    if (error) {
        return {
            success: false,
            error: `Failed to get media tags: ${error.message}`,
        };
    }

    const tags = data?.map((row: unknown) => {
        const typedRow = row as { media_tags: unknown };
        return typedRow.media_tags;
    }).filter(Boolean) ?? [];

    return {
        success: true, data: tags as Array<{
            id: bigint;
            name: string;
            slug: string;
            description: string | null;
            color: string | null;
        }>
    };
}

/**
 * List all media items with their tags and folders
 * @returns Array of media items with extended data
 */
export async function listMediaItems(): Promise<DALResult<Array<{
    id: bigint;
    storage_path: string;
    filename: string;
    mime: string;
    size_bytes: number;
    alt_text: string | null;
    folder_id: bigint | null;
    created_at: string | Date;
    updated_at: string | Date;
    tags: Array<{
        id: bigint;
        name: string;
        slug: string;
        description: string | null;
        color: string | null;
        created_at: string | Date;
        updated_at: string | Date;
    }>;
    folder: {
        id: bigint;
        name: string;
        slug: string;
        description: string | null;
        parent_id: bigint | null;
        created_at: string | Date;
        updated_at: string | Date;
    } | null;
    // Phase 4.3: Usage tracking
    is_used_public?: boolean;
    usage_locations?: string[];
}>>> {
    await requireAdmin();

    const supabase = await createClient();

    // Fetch all media items (Phase 3: added thumbnail_path)
    const { data: mediaData, error: mediaError } = await supabase
        .from("medias")
        .select("id, storage_path, filename, mime, size_bytes, alt_text, folder_id, thumbnail_path, created_at, updated_at")
        .order("created_at", { ascending: false });

    if (mediaError) {
        return {
            success: false,
            error: `Failed to list media: ${mediaError.message}`,
        };
    }

    if (!mediaData || mediaData.length === 0) {
        return { success: true, data: [] };
    }

    // Fetch tags for all media items
    const mediaIds = mediaData.map((m) => String(m.id));
    const { data: tagsData, error: tagsError } = await supabase
        .from("media_item_tags")
        .select("media_id, media_tags(*)")
        .in("media_id", mediaIds);

    if (tagsError) {
        console.error("[DAL] Failed to fetch tags:", tagsError);
    }

    // Fetch folders
    const folderIds = mediaData
        .map((m) => m.folder_id)
        .filter((id): id is string => id !== null)
        .map(String);

    const { data: foldersData, error: foldersError } = folderIds.length > 0
        ? await supabase
            .from("media_folders")
            .select("id, name, slug, description, parent_id, created_at, updated_at")
            .in("id", folderIds)
        : { data: null, error: null };

    if (foldersError) {
        console.error("[DAL] Failed to fetch folders:", foldersError);
    }

    // Phase 4.3: Bulk check media usage in public pages
    const { bulkCheckMediaUsagePublic } = await import("@/lib/dal/media-usage");
    const mediaBigintIds = mediaData.map((m) => BigInt(m.id));
    const usageMap = await bulkCheckMediaUsagePublic(mediaBigintIds);

    // Build tags map
    const tagsMap = new Map<string, Array<unknown>>();
    tagsData?.forEach((row: unknown) => {
        const typedRow = row as { media_id: bigint; media_tags: unknown };
        const mediaId = String(typedRow.media_id);
        if (!tagsMap.has(mediaId)) {
            tagsMap.set(mediaId, []);
        }
        if (typedRow.media_tags) {
            tagsMap.get(mediaId)!.push(typedRow.media_tags);
        }
    });

    // Build folders map
    const foldersMap = new Map<string, unknown>();
    foldersData?.forEach((folder: unknown) => {
        const typedFolder = folder as { id: bigint };
        foldersMap.set(String(typedFolder.id), folder);
    });

    // Combine data
    const result = mediaData.map((media) => {
        const usageInfo = usageMap.get(String(media.id));
        return {
            ...media,
            tags: (tagsMap.get(String(media.id)) ?? []) as Array<{
                id: bigint;
                name: string;
                slug: string;
                description: string | null;
                color: string | null;
                created_at: string | Date;
                updated_at: string | Date;
            }>,
            folder: media.folder_id
                ? (foldersMap.get(String(media.folder_id)) as {
                    id: bigint;
                    name: string;
                    slug: string;
                    description: string | null;
                    parent_id: bigint | null;
                    created_at: string | Date;
                    updated_at: string | Date;
                } | null)
                : null,
            // Phase 4.3: Add usage tracking info
            is_used_public: usageInfo?.is_used_public ?? false,
            usage_locations: usageInfo?.usage_locations ?? [],
        };
    });

    return { success: true, data: result };
}

// =============================================================================
// STATISTICS
// =============================================================================

export interface MediaStats {
    totalMedia: number;
    totalTags: number;
    totalFolders: number;
    storageUsedBytes: number;
    storageUsed: string;
}

export async function fetchMediaStats(): Promise<DALResult<MediaStats>> {
    await requireAdmin();
    const supabase = await createClient();

    const [mediaResult, tagsResult, foldersResult] = await Promise.all([
        supabase.from("medias").select("size_bytes", { count: "exact" }),
        supabase.from("media_tags").select("id", { count: "exact", head: true }),
        supabase.from("media_folders").select("id", { count: "exact", head: true }),
    ]);

    if (mediaResult.error) {
        console.error("[DAL] Failed to fetch media stats:", mediaResult.error);
        return { success: false, error: mediaResult.error.message };
    }

    const totalMedia = mediaResult.count ?? 0;
    const totalTags = tagsResult.count ?? 0;
    const totalFolders = foldersResult.count ?? 0;

    const storageUsedBytes = mediaResult.data?.reduce(
        (sum, m) => sum + (m.size_bytes ?? 0),
        0
    ) ?? 0;

    const storageUsed = formatStorageSize(storageUsedBytes);

    return {
        success: true,
        data: {
            totalMedia,
            totalTags,
            totalFolders,
            storageUsedBytes,
            storageUsed,
        },
    };
}

function formatStorageSize(bytes: number): string {
    if (bytes === 0) return "0 MB";
    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }
    if (bytes < 1024 * 1024 * 1024) {
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
