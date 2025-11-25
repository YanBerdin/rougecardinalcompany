import { ApiResponse, HttpStatus } from "@/lib/api/helpers";
import { requireAdmin } from "@/lib/auth/is-admin";
import { fetchActiveAboutContent } from "@/lib/dal/admin-home-about";

/**
 * GET /api/admin/home/about
 * Fetch active about content (single record)
 */
export async function GET() {
  try {
    await requireAdmin();
    const content = await fetchActiveAboutContent();
    
    if (!content) {
      return ApiResponse.error("About content not found", HttpStatus.NOT_FOUND);
    }
    
    return ApiResponse.success({ content });
  } catch (error: unknown) {
    return ApiResponse.error(
      error instanceof Error ? error.message : "Failed to fetch about content",
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
