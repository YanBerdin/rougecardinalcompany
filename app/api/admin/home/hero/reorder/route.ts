import { NextRequest } from "next/server";
import { withAdminAuth, ApiResponse, HttpStatus } from "@/lib/api/helpers";
import { reorderHeroSlides } from "@/lib/dal/admin-home-hero";
import { ReorderInputSchema } from "@/lib/schemas/home-content";

/**
 * POST /api/admin/home/hero/reorder
 * Reorder hero slides via database RPC
 *
 * @deprecated Prefer using reorderHeroSlidesAction from
 * app/(admin)/admin/home/hero/home-hero-actions.ts for frontend mutations.
 * This API Route is kept for external clients and backward compatibility.
 */
export async function POST(request: NextRequest) {
  return withAdminAuth(async () => {
    try {
      const body = await request.json();
      const validated = ReorderInputSchema.parse(body);

      const result = await reorderHeroSlides(validated);

      if (!result.success) {
        return ApiResponse.error(
          result.error || "Failed to reorder hero slides",
          HttpStatus.BAD_REQUEST
        );
      }

      return ApiResponse.success({ message: "Hero slides reordered successfully" });
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "ZodError") {
        return ApiResponse.error("Invalid reorder data", HttpStatus.UNPROCESSABLE_ENTITY);
      }
      return ApiResponse.error(
        error instanceof Error ? error.message : "Failed to reorder hero slides",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  });
}
