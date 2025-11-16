import { NextRequest } from "next/server";
import { 
  ApiResponse, 
  HttpStatus, 
  withAdminAuth 
} from "@/lib/api/helpers";
import { 
  fetchAllSpectacles, 
  createSpectacle 
} from "@/lib/dal/spectacles";
import { CreateSpectacleSchema } from "@/lib/schemas/spectacles";

/**
 * GET /api/admin/spectacles - List all spectacles
 * 
 * Query params:
 * - includePrivate: boolean - Include non-public spectacles (default: false)
 * 
 * @example
 * GET /api/admin/spectacles?includePrivate=true
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": 1,
 *       "title": "Hamlet",
 *       "slug": "hamlet",
 *       "status": "en_cours",
 *       ...
 *     }
 *   ]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includePrivateParam = searchParams.get("includePrivate");
    const includePrivate = includePrivateParam === "true";

    const spectacles = await fetchAllSpectacles(includePrivate);

    return ApiResponse.success(spectacles, HttpStatus.OK);
  } catch (error: unknown) {
    console.error("[API] Error fetching spectacles:", error); //TODO: Remove in production
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch spectacles";
    return ApiResponse.error(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

/**
 * POST /api/admin/spectacles - Create new spectacle
 * 
 * Requires admin authentication.
 * 
 * Request body:
 * {
 *   "title": "Hamlet",
 *   "slug": "hamlet", // Optional - auto-generated if not provided
 *   "description": "A tragedy by Shakespeare",
 *   "genre": "Tragedy",
 *   "duration_minutes": 180,
 *   "public": true,
 *   ...
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": 1,
 *     "title": "Hamlet",
 *     "slug": "hamlet",
 *     ...
 *   }
 * }
 * 
 * Errors:
 * - 403: Not authenticated as admin
 * - 409: Slug already exists
 * - 422: Validation failed
 * - 500: Server error
 */
export async function POST(request: NextRequest) {
  return withAdminAuth(async () => {
    try {
      const requestBody = await request.json();

      // Validate request body
      const validationResult = CreateSpectacleSchema.safeParse(requestBody);
      if (!validationResult.success) {
        console.error("[API] Validation failed:", JSON.stringify(validationResult.error.issues, null, 2)); //TODO: Remove in production
        console.error("[API] Received body:", JSON.stringify(requestBody, null, 2)); //TODO: Remove in production
        return ApiResponse.validationError(validationResult.error.issues);
      }

      // Create spectacle using DAL
      const createResult = await createSpectacle(validationResult.data);

      if (!createResult.success) {
        return ApiResponse.error(
          createResult.error,
          createResult.status || HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      return ApiResponse.success(createResult.data, HttpStatus.CREATED);
    } catch (error: unknown) {
      console.error("[API] Error creating spectacle:", error); //TODO: Remove in production
      const errorMessage = error instanceof Error ? error.message : "Failed to create spectacle";
      return ApiResponse.error(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  });
}
