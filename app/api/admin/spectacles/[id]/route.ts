import { NextRequest } from "next/server";
import { 
  ApiResponse, 
  HttpStatus, 
  withAdminAuth 
} from "@/lib/api/helpers";
import { 
  fetchSpectacleById, 
  updateSpectacle, 
  deleteSpectacle 
} from "@/lib/dal/spectacles";
import { UpdateSpectacleSchema } from "@/lib/schemas/spectacles";

/**
 * Parse and validate spectacle ID from route parameter
 */
function parseSpectacleId(idString: string): number | null {
  try {
    // Validate format before parsing
    if (!/^\d+$/.test(idString)) {
      return null;
    }
    
    const parsedId = parseInt(idString, 10);
    
    // Ensure positive value and valid number
    if (isNaN(parsedId) || parsedId <= 0) {
      return null;
    }
    
    return parsedId;
  } catch {
    return null;
  }
}

/**
 * GET /api/admin/spectacles/[id] - Get single spectacle by ID
 * 
 * @example
 * GET /api/admin/spectacles/1
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
 * - 400: Invalid ID format
 * - 404: Spectacle not found
 * - 500: Server error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const spectacleId = parseSpectacleId(params.id);

    if (spectacleId === null) {
      return ApiResponse.error(
        "Invalid spectacle ID format",
        HttpStatus.BAD_REQUEST
      );
    }

    const spectacle = await fetchSpectacleById(spectacleId);

    if (!spectacle) {
      return ApiResponse.error(
        "Spectacle not found",
        HttpStatus.NOT_FOUND
      );
    }

    return ApiResponse.success(spectacle, HttpStatus.OK);
  } catch (error: unknown) {
    console.error("[API] Error fetching spectacle:", error);
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Failed to fetch spectacle";
    return ApiResponse.error(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

/**
 * PATCH /api/admin/spectacles/[id] - Update spectacle
 * 
 * Requires admin authentication.
 * 
 * Request body (all fields optional except id):
 * {
 *   "title": "Hamlet (Updated)",
 *   "description": "New description",
 *   "public": true,
 *   ...
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": 1,
 *     "title": "Hamlet (Updated)",
 *     ...
 *   }
 * }
 * 
 * Errors:
 * - 400: Invalid ID format
 * - 403: Not authenticated as admin
 * - 404: Spectacle not found
 * - 409: Slug already exists
 * - 422: Validation failed
 * - 500: Server error
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAdminAuth(async () => {
    try {
      const spectacleId = parseSpectacleId(params.id);

      if (spectacleId === null) {
        return ApiResponse.error(
          "Invalid spectacle ID format",
          HttpStatus.BAD_REQUEST
        );
      }

      const requestBody = await request.json();

      // Validate request body with ID from route
      const validationResult = UpdateSpectacleSchema.safeParse({
        ...requestBody,
        id: BigInt(spectacleId),
      });

      if (!validationResult.success) {
        return ApiResponse.validationError(validationResult.error.issues);
      }

      // Update spectacle using DAL
      const updateResult = await updateSpectacle(validationResult.data);

      if (!updateResult.success) {
        return ApiResponse.error(
          updateResult.error,
          updateResult.status || HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      return ApiResponse.success(updateResult.data, HttpStatus.OK);
    } catch (error: unknown) {
      console.error("[API] Error updating spectacle:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to update spectacle";
      return ApiResponse.error(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  });
}

/**
 * DELETE /api/admin/spectacles/[id] - Delete spectacle
 * 
 * Requires admin authentication.
 * Performs hard delete with cascade on related records.
 * 
 * @example
 * DELETE /api/admin/spectacles/1
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": null
 * }
 * 
 * Errors:
 * - 400: Invalid ID format
 * - 403: Not authenticated as admin
 * - 404: Spectacle not found
 * - 500: Server error
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAdminAuth(async () => {
    try {
      const spectacleId = parseSpectacleId(params.id);

      if (spectacleId === null) {
        return ApiResponse.error(
          "Invalid spectacle ID format",
          HttpStatus.BAD_REQUEST
        );
      }

      // Delete spectacle using DAL
      const deleteResult = await deleteSpectacle(spectacleId);

      if (!deleteResult.success) {
        return ApiResponse.error(
          deleteResult.error,
          deleteResult.status || HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      return ApiResponse.success(null, HttpStatus.OK);
    } catch (error: unknown) {
      console.error("[API] Error deleting spectacle:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to delete spectacle";
      return ApiResponse.error(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  });
}
