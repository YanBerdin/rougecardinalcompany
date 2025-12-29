/**
 * @file Serialization Helpers
 * @description Conversion functions from Server types (bigint) to UI-safe DTOs (number)
 * @module lib/dal/helpers/serialize
 */
import type {
    MediaTag,
    MediaTagDTO,
    MediaFolder,
    MediaFolderDTO,
    MediaItemExtended,
    MediaItemExtendedDTO,
} from "@/lib/schemas/media";

/**
 * Convert MediaTag (bigint) to MediaTagDTO (number)
 * @param tag - Server-side MediaTag with bigint ID
 * @returns UI-safe MediaTagDTO with number ID
 */
export function toMediaTagDTO(tag: MediaTag): MediaTagDTO {
    return {
        id: Number(tag.id),
        name: tag.name,
        slug: tag.slug,
        description: tag.description,
        color: tag.color,
        created_at: typeof tag.created_at === 'string' ? tag.created_at : tag.created_at.toISOString(),
        updated_at: typeof tag.updated_at === 'string' ? tag.updated_at : tag.updated_at.toISOString(),
    };
}

/**
 * Convert MediaFolder (bigint) to MediaFolderDTO (number)
 * @param folder - Server-side MediaFolder with bigint IDs
 * @returns UI-safe MediaFolderDTO with number IDs
 */
export function toMediaFolderDTO(folder: MediaFolder): MediaFolderDTO {
    return {
        id: Number(folder.id),
        name: folder.name,
        slug: folder.slug,
        description: folder.description,
        parent_id: folder.parent_id !== null ? Number(folder.parent_id) : null,
        created_at: typeof folder.created_at === 'string' ? folder.created_at : folder.created_at.toISOString(),
        updated_at: typeof folder.updated_at === 'string' ? folder.updated_at : folder.updated_at.toISOString(),
    };
}

/**
 * Convert MediaItemExtended (bigint) to MediaItemExtendedDTO (number)
 * @param media - Server-side MediaItemExtended with bigint IDs
 * @returns UI-safe MediaItemExtendedDTO with number IDs
 */
export function toMediaItemExtendedDTO(media: MediaItemExtended): MediaItemExtendedDTO {
    return {
        id: Number(media.id),
        storage_path: media.storage_path,
        filename: media.filename,
        mime: media.mime,
        size_bytes: media.size_bytes,
        alt_text: media.alt_text,
        folder_id: media.folder_id !== null ? Number(media.folder_id) : null,
        thumbnail_path: media.thumbnail_path ?? null, // Phase 3: Thumbnail support
        created_at: typeof media.created_at === 'string' ? media.created_at : media.created_at.toISOString(),
        updated_at: typeof media.updated_at === 'string' ? media.updated_at : media.updated_at.toISOString(),
        tags: media.tags.map(toMediaTagDTO),
        folder: media.folder !== null ? toMediaFolderDTO(media.folder) : null,
        // Phase 4.3: Usage tracking
        is_used_public: media.is_used_public ?? false,
        usage_locations: media.usage_locations ?? [],
    };
}
