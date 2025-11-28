/**
 * @deprecated Préférer utiliser le Server Action setTeamMemberActiveAction depuis
 * app/(admin)/admin/team/actions.ts
 *
 * Cette API Route est conservée pour rétrocompatibilité avec des clients externes.
 */
import { setTeamMemberActive } from "@/lib/dal/team";
import {
  withAdminAuth,
  parseNumericId,
  ApiResponse,
  HttpStatus,
} from "@/lib/api/helpers";
import { z } from "zod";

// ============================================================================
// Types
// ============================================================================
// In Next.js 15 the `params` object may be a Promise-like
type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

// ============================================================================
// Validation Schema
// ============================================================================

const SetActiveBodySchema = z.object({
  active: z
    .union([
      z.boolean(),
      z.enum(["true", "false"]),
      z.number().int().min(0).max(1),
    ])
    .transform((val) => {
      if (typeof val === "boolean") return val;
      if (typeof val === "string") return val === "true";
      return val === 1;
    }),
});

// ============================================================================
// Route Handler
// ============================================================================

export async function POST(request: Request, context: RouteContext) {
  return withAdminAuth(async () => {
    try {
      // 1. Parse and validate ID
      const { id: idString } = await context.params;
      const id = parseNumericId(idString);

      if (!id) {
        return ApiResponse.error(
          "Invalid team member ID",
          HttpStatus.BAD_REQUEST
        );
      }

      // 2. Validate content type
      const contentType = request.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        return ApiResponse.error(
          "Content-Type must be application/json",
          HttpStatus.BAD_REQUEST
        );
      }

      // 3. Parse and validate body
      const body = await request.json();
      const validation = SetActiveBodySchema.safeParse(body);

      if (!validation.success) {
        return ApiResponse.validationError(validation.error.issues);
      }

      const { active } = validation.data;

      // 4. Update team member active status
      const result = await setTeamMemberActive(id, active);

      if (!result.success) {
        // ✅ Solution : Variable intermédiaire pour éliminer le cast
        const errorStatus = result.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
        return ApiResponse.error(
          result.error ?? "Failed to update active status",
          errorStatus
        );
      }

      return ApiResponse.success({ updated: true, id, active });
    } catch (error: unknown) {
      console.error("[API] Set team member active error:", error);

      if (error instanceof SyntaxError) {
        return ApiResponse.error("Invalid JSON body", HttpStatus.BAD_REQUEST);
      }

      return ApiResponse.error(
        "Internal server error",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  });
}
