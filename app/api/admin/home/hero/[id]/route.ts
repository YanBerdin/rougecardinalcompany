import { NextRequest } from "next/server";
import { withAdminAuth, ApiResponse, HttpStatus } from "@/lib/api/helpers";
import {
    fetchHeroSlideById,
    updateHeroSlide,
    deleteHeroSlide,
} from "@/lib/dal/admin-home-hero";
import { HeroSlideInputSchema } from "@/lib/schemas/home-content";

/**
 * GET /api/admin/home/hero/[id]
 * Fetch single hero slide by ID
 */
export async function GET(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
    return withAdminAuth(async () => {
        try {
            const id = BigInt(params.id);
            const slide = await fetchHeroSlideById(id);

            if (!slide) {
                return ApiResponse.error("Hero slide not found", HttpStatus.NOT_FOUND);
            }

            return ApiResponse.success({ slide });
        } catch (error: unknown) {
            return ApiResponse.error(
                error instanceof Error ? error.message : "Failed to fetch hero slide",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    });
}

/**
 * PATCH /api/admin/home/hero/[id]
 * Update existing hero slide
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return withAdminAuth(async () => {
        try {
            const id = BigInt(params.id);
            const body = await request.json();
            const validated = HeroSlideInputSchema.partial().parse(body);

            const result = await updateHeroSlide(id, validated);

            if (!result.success) {
                return ApiResponse.error(
                    result.error || "Failed to update hero slide",
                    HttpStatus.BAD_REQUEST
                );
            }

            return ApiResponse.success({ slide: result.data });
        } catch (error: unknown) {
            if (error instanceof Error && error.name === "ZodError") {
                return ApiResponse.error("Invalid input data", HttpStatus.UNPROCESSABLE_ENTITY);
            }
            return ApiResponse.error(
                error instanceof Error ? error.message : "Failed to update hero slide",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    });
}

/**
 * DELETE /api/admin/home/hero/[id]
 * Soft delete hero slide (set active=false)
 */
export async function DELETE(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
    return withAdminAuth(async () => {
        try {
            const id = BigInt(params.id);
            const result = await deleteHeroSlide(id);

            if (!result.success) {
                return ApiResponse.error(
                    result.error || "Failed to delete hero slide",
                    HttpStatus.BAD_REQUEST
                );
            }

            return ApiResponse.success({ message: "Hero slide deleted" });
        } catch (error: unknown) {
            return ApiResponse.error(
                error instanceof Error ? error.message : "Failed to delete hero slide",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    });
}
