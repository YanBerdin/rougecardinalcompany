import { NextRequest } from "next/server";
import { withAdminAuth, ApiResponse, HttpStatus } from "@/lib/api/helpers";

/**
 * GET /api/admin/media/search?q=searchQuery
 * Search media library by name or description
 */
export async function GET(request: NextRequest) {
    return withAdminAuth(async () => {
        try {
            const searchParams = request.nextUrl.searchParams;
            const query = searchParams.get("q") || "";

            if (!query.trim()) {
                return ApiResponse.success({ items: [] as Array<{ id: bigint; url: string; name: string }> });
            }

            // TODO: Implement actual media search from database
            // This should query your media_library or assets table
            // Example structure for returned items:
            // {
            //   id: BigInt(1),
            //   url: "https://example.com/image.jpg",
            //   name: "Hero Image",
            //   type: "image/jpeg",
            // }

            // For now, return empty array
            const items: Array<{ id: bigint; url: string; name: string }> = [];

            return ApiResponse.success({ items });
        } catch (error: unknown) {
            return ApiResponse.error(
                error instanceof Error ? error.message : "Failed to search media",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    });
}
