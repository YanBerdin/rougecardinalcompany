import { NextResponse } from "next/server";
import { hardDeleteTeamMember } from "@/lib/dal/team";
import {
  withAdminAuth,
  parseNumericId,
  ApiResponse,
  HttpStatus,
} from "@/lib/api/helpers";

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

export async function POST(_request: Request, context: RouteContext) {
  return withAdminAuth(async () => {
    try {
      const { id: idString } = await context.params;
      const id = parseNumericId(idString);

      if (!id) {
        return ApiResponse.error(
          "Invalid team member ID",
          HttpStatus.BAD_REQUEST
        );
      }

      const result = await hardDeleteTeamMember(id);

      if (!result.success) {
        return ApiResponse.error(
          result.error ?? "Failed to delete team member",
          result.status ?? HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      return ApiResponse.success({ deleted: true, id });
    } catch (error: unknown) {
      console.error("[API] Hard delete error:", error);

      return ApiResponse.error(
        "Internal server error",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  });
}
