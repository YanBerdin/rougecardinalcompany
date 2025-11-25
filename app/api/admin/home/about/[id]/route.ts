import { NextRequest } from "next/server";
import { ApiResponse, HttpStatus } from "@/lib/api/helpers";
import { requireAdmin } from "@/lib/auth/is-admin";
import { updateAboutContent } from "@/lib/dal/admin-home-about";
import { AboutContentInputSchema } from "@/lib/schemas/home-content";

/**
 * PATCH /api/admin/home/about/[id]
 * Update about content
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const id = BigInt(params.id);
    const body = await request.json();
    const validated = AboutContentInputSchema.parse(body);
    
    const result = await updateAboutContent(id, validated);
    
    if (!result.success) {
      return ApiResponse.error(
        result.error || "Failed to update about content",
        HttpStatus.BAD_REQUEST
      );
    }
    
    return ApiResponse.success({ content: result.data });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "ZodError") {
      return ApiResponse.error("Invalid input data", HttpStatus.UNPROCESSABLE_ENTITY);
    }
    return ApiResponse.error(
      error instanceof Error ? error.message : "Failed to update about content",
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
