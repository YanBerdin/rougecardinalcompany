import { NextResponse } from "next/server";
import { fetchSpectacleLandscapePhotosAdmin } from "@/lib/dal/spectacle-photos";
import type { SpectaclePhotoTransport, SpectaclePhotoDTO } from "@/lib/schemas/spectacles";

/**
 * GET /api/spectacles/[id]/photos
 * 
 * Fetch landscape photos for a spectacle and convert bigint→string
 * Pattern: Server→Client data flow with BigInt serialization fix
 * 
 * @returns SpectaclePhotoTransport[] (string IDs)
 */
export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Fetch from DAL (returns SpectaclePhotoDTO[] with bigint directly)
        const photos = await fetchSpectacleLandscapePhotosAdmin(BigInt(id));

        // ✅ Convert bigint→string for JSON serialization
        const transportPhotos: SpectaclePhotoTransport[] = photos.map((photo: SpectaclePhotoDTO) => ({
            spectacle_id: String(photo.spectacle_id),
            media_id: String(photo.media_id),
            ordre: photo.ordre,
            storage_path: photo.storage_path,
            alt_text: photo.alt_text,
        }));

        return NextResponse.json(transportPhotos);
    } catch (error) {
        console.error("[API] /spectacles/[id]/photos error:", error);
        return NextResponse.json(
            { error: "Failed to fetch photos" },
            { status: 500 }
        );
    }
}
