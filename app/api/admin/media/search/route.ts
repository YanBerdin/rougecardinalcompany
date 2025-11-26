import { NextRequest } from "next/server";
import { withAdminAuth, ApiResponse, HttpStatus } from "@/lib/api/helpers";
import { createClient } from "@/supabase/server";
import type { MediaSearchItem } from "@/lib/types/media";

const SUPABASE_PROJECT_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const STORAGE_BUCKET = "medias";

/**
 * Build public URL for a storage path
 * 
 * CRITICAL: storage_path in DB is RELATIVE to the bucket (e.g., "press-kit/logos/file.png")
 * ALL files are stored in the "medias" bucket in Supabase Storage
 * 
 * Example:
 * - DB storage_path: "press-kit/logos/rouge-cardinal-logo.png"
 * - Actual Storage location: bucket "medias", path "press-kit/logos/rouge-cardinal-logo.png"
 * - Public URL: /storage/v1/object/public/medias/press-kit/logos/rouge-cardinal-logo.png
 */
function buildPublicUrl(storagePath: string): string {
    // IMPORTANT: All files are in the "medias" bucket
    // storage_path in DB is relative (does NOT include bucket name)
    return `${SUPABASE_PROJECT_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${storagePath}`;
}

/**
 * GET /api/admin/media/search?q=searchQuery&page=1&limit=20
 * Search media library by filename or alt_text
 * Returns paginated results from the medias table
 */
export async function GET(request: NextRequest) {
    return withAdminAuth(async () => {
        try {
            const searchParams = request.nextUrl.searchParams;
            const query = searchParams.get("q") || "";
            const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
            const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
            const offset = (page - 1) * limit;

            const supabase = await createClient();

            // Build query
            let dbQuery = supabase
                .from("medias")
                .select("id, storage_path, filename, mime, alt_text", { count: "exact" });

            // Filter by search query if provided
            if (query.trim()) {
                dbQuery = dbQuery.or(
                    `filename.ilike.%${query}%,alt_text.ilike.%${query}%`
                );
            }

            // Filter only images by default
            dbQuery = dbQuery.like("mime", "image/%");

            // Order and paginate
            const { data, error, count } = await dbQuery
                .order("created_at", { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) {
                console.error("[API] Media search error:", error);
                return ApiResponse.error(
                    `[ERR_MEDIA_001] Search failed: ${error.message}`,
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }

            // Transform to MediaSearchItem format
            const items: MediaSearchItem[] = (data ?? []).map((media) => ({
                id: media.id,
                url: buildPublicUrl(media.storage_path),
                name: media.filename || "Untitled",
                mime: media.mime,
                alt_text: media.alt_text,
            }));

            return ApiResponse.success({
                items,
                pagination: {
                    page,
                    limit,
                    total: count ?? 0,
                    totalPages: count ? Math.ceil(count / limit) : 0,
                },
            });
        } catch (error: unknown) {
            console.error("[API] Media search exception:", error);
            return ApiResponse.error(
                error instanceof Error ? error.message : "Failed to search media",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    });
}
