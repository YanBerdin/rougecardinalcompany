import { withAdminAuth, ApiResponse, HttpStatus, parseNumericId } from "@/lib/api/helpers";
import { fetchSpectacleGalleryPhotosAdmin } from "@/lib/dal/spectacle-photos";
import type { GalleryPhotoTransport, GalleryPhotoDTO } from "@/lib/schemas/spectacles";

/**
 * GET /api/admin/spectacles/[id]/gallery-photos
 *
 * Fetch gallery photos for a spectacle and convert bigint→string.
 * Pattern: Server→Client data flow with BigInt serialization fix.
 *
 * @returns ApiResponse.success wrapping GalleryPhotoTransport[] (string IDs)
 */
export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    return withAdminAuth(async () => {
        try {
            const { id } = await params;

            const spectacleId = parseNumericId(id);
            if (spectacleId === null) {
                return ApiResponse.error(
                    "[ERR_GALLERY_001] Invalid spectacle ID",
                    HttpStatus.BAD_REQUEST
                );
            }

            const photos = await fetchSpectacleGalleryPhotosAdmin(BigInt(spectacleId));

            const transportPhotos: GalleryPhotoTransport[] = photos.map(
                (photo: GalleryPhotoDTO) => ({
                    spectacle_id: String(photo.spectacle_id),
                    media_id: String(photo.media_id),
                    ordre: photo.ordre,
                    storage_path: photo.storage_path,
                    alt_text: photo.alt_text,
                })
            );

            return ApiResponse.success(transportPhotos);
        } catch (error: unknown) {
            console.error("[API] /admin/spectacles/[id]/gallery-photos error:", error);
            return ApiResponse.error(
                error instanceof Error ? error.message : "Failed to fetch gallery photos",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    });
}
