"use server";
import "server-only";

import { createClient } from "@/supabase/server";
import { requireMinRole } from "@/lib/auth/roles";
import { dalError, dalSuccess, type DALResult } from "@/lib/dal/helpers";

const BUCKET_NAME = "medias";
const ROOT_FOLDER_SLUG = "uploads";

interface StorageMediaItem {
    id: number;
    storage_path: string;
    thumbnail_path: string | null;
    folder_id: number | null;
}

interface DestinationFolder {
    id: number | null;
    slug: string;
}

function buildMovedStoragePath(storagePath: string, destinationSlug: string): string {
    const filename = storagePath.split("/").pop();

    if (!filename) {
        throw new Error("Invalid media storage path");
    }

    return `${destinationSlug}/${filename}`;
}

async function getDestinationFolder(
    supabase: Awaited<ReturnType<typeof createClient>>,
    folderId: number | null
): Promise<DALResult<DestinationFolder>> {
    if (folderId === null) {
        return dalSuccess({ id: null, slug: ROOT_FOLDER_SLUG });
    }

    const { data, error } = await supabase
        .from("media_folders")
        .select("id, slug")
        .eq("id", folderId)
        .single();

    if (error || !data) {
        return dalError("Destination folder not found");
    }

    return dalSuccess(data);
}

async function getMediaItems(
    supabase: Awaited<ReturnType<typeof createClient>>,
    mediaIds: readonly number[]
): Promise<DALResult<StorageMediaItem[]>> {
    const { data, error } = await supabase
        .from("medias")
        .select("id, storage_path, thumbnail_path, folder_id")
        .in("id", mediaIds);

    if (error || !data || data.length !== mediaIds.length) {
        return dalError("One or more media items were not found");
    }

    return dalSuccess(data);
}

async function moveStorageObject(
    supabase: Awaited<ReturnType<typeof createClient>>,
    sourcePath: string,
    destinationPath: string
): Promise<DALResult<null>> {
    if (sourcePath === destinationPath) {
        return dalSuccess(null);
    }

    const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .move(sourcePath, destinationPath);

    return error
        ? dalError(`Failed to move media in Storage: ${error.message}`)
        : dalSuccess(null);
}

async function moveSingleMedia(
    supabase: Awaited<ReturnType<typeof createClient>>,
    media: StorageMediaItem,
    destination: DestinationFolder
): Promise<DALResult<null>> {
    const storagePath = buildMovedStoragePath(media.storage_path, destination.slug);
    const thumbnailPath = media.thumbnail_path
        ? buildMovedStoragePath(media.thumbnail_path, destination.slug)
        : null;
    const originalMove = await moveStorageObject(supabase, media.storage_path, storagePath);

    if (!originalMove.success) {
        return originalMove;
    }

    if (media.thumbnail_path && thumbnailPath) {
        const thumbnailMove = await moveStorageObject(supabase, media.thumbnail_path, thumbnailPath);
        if (!thumbnailMove.success) {
            await moveStorageObject(supabase, storagePath, media.storage_path);
            return thumbnailMove;
        }
    }

    const { error } = await supabase
        .from("medias")
        .update({
            folder_id: destination.id,
            storage_path: storagePath,
            thumbnail_path: thumbnailPath,
        })
        .eq("id", media.id);

    if (error) {
        if (media.thumbnail_path && thumbnailPath) {
            await moveStorageObject(supabase, thumbnailPath, media.thumbnail_path);
        }
        await moveStorageObject(supabase, storagePath, media.storage_path);
        return dalError(`Failed to update media record: ${error.message}`);
    }

    return dalSuccess(null);
}

async function restoreSingleMedia(
    supabase: Awaited<ReturnType<typeof createClient>>,
    media: StorageMediaItem,
    destination: DestinationFolder
): Promise<void> {
    const storagePath = buildMovedStoragePath(media.storage_path, destination.slug);
    const thumbnailPath = media.thumbnail_path
        ? buildMovedStoragePath(media.thumbnail_path, destination.slug)
        : null;

    if (media.thumbnail_path && thumbnailPath) {
        await moveStorageObject(supabase, thumbnailPath, media.thumbnail_path);
    }

    await moveStorageObject(supabase, storagePath, media.storage_path);
    await supabase.from("medias").update({
        folder_id: media.folder_id,
        storage_path: media.storage_path,
        thumbnail_path: media.thumbnail_path,
    }).eq("id", media.id);
}

async function rollbackMovedMedia(
    supabase: Awaited<ReturnType<typeof createClient>>,
    movedMedia: readonly StorageMediaItem[],
    destination: DestinationFolder
): Promise<void> {
    for (const media of [...movedMedia].reverse()) {
        await restoreSingleMedia(supabase, media, destination);
    }
}

/**
 * Move media objects and thumbnails to the folder represented by their Storage prefix.
 */
export async function moveMediaItemsToFolder(
    mediaIds: readonly number[],
    folderId: number | null
): Promise<DALResult<null>> {
    await requireMinRole("editor");

    const supabase = await createClient();
    const destinationResult = await getDestinationFolder(supabase, folderId);
    if (!destinationResult.success) {
        return destinationResult;
    }

    const mediaResult = await getMediaItems(supabase, mediaIds);
    if (!mediaResult.success) {
        return mediaResult;
    }

    const movedMedia: StorageMediaItem[] = [];

    for (const media of mediaResult.data) {
        const moveResult = await moveSingleMedia(supabase, media, destinationResult.data);
        if (!moveResult.success) {
            await rollbackMovedMedia(supabase, movedMedia, destinationResult.data);
            return moveResult;
        }

        movedMedia.push(media);
    }

    return dalSuccess(null);
}