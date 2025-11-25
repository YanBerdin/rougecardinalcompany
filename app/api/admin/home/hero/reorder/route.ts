import { NextRequest } from "next/server";
import { ApiResponse, HttpStatus } from "@/lib/api/helpers";
import { requireAdmin } from "@/lib/auth/is-admin";
import { reorderHeroSlides } from "@/lib/dal/admin-home-hero";
import { ReorderInputSchema } from "@/lib/schemas/home-content";

/**
 * POST /api/admin/home/hero/reorder
 * Reorder hero slides via database RPC
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
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
}
