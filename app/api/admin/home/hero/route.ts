import { NextRequest } from "next/server";
import { withAdminAuth, ApiResponse, HttpStatus } from "@/lib/api/helpers";
import { fetchAllHeroSlides, createHeroSlide } from "@/lib/dal/admin-home-hero";
import { HeroSlideInputSchema } from "@/lib/schemas/home-content";

/**
 * GET /api/admin/home/hero
 * Fetch all hero slides (admin view)
 *
 * @deprecated For admin UI, prefer Server Component with direct DAL call:
 * import { fetchAllHeroSlides } from "@/lib/dal/admin-home-hero";
 * const slides = await fetchAllHeroSlides();
 *
 * This API Route is kept for external clients and backward compatibility.
 */
export const GET = withAdminAuth(async () => {
    try {
        const slides = await fetchAllHeroSlides();
        return ApiResponse.success({ slides });
    } catch (error: unknown) {
        return ApiResponse.error(
            error instanceof Error ? error.message : "Failed to fetch hero slides",
            HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
});

/**
 * POST /api/admin/home/hero
 * Create new hero slide
 *
 * @deprecated Prefer using createHeroSlideAction from
 * app/(admin)/admin/home/hero/home-hero-actions.ts for frontend mutations.
 * This API Route is kept for external clients and backward compatibility.
 */
export async function POST(request: NextRequest) {
    return withAdminAuth(async () => {
        try {
            const body = await request.json();
            const validated = HeroSlideInputSchema.parse(body);

            const result = await createHeroSlide(validated);

            if (!result.success) {
                return ApiResponse.error(
                    result.error || "Failed to create hero slide",
                    HttpStatus.BAD_REQUEST
                );
            }

            return ApiResponse.success({ slide: result.data }, HttpStatus.CREATED);
        } catch (error: unknown) {
            if (error instanceof Error && error.name === "ZodError") {
                return ApiResponse.error("Invalid input data", HttpStatus.UNPROCESSABLE_ENTITY);
            }
            return ApiResponse.error(
                error instanceof Error ? error.message : "Failed to create hero slide",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    });
}