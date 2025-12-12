import { NextRequest } from "next/server";
import { handleContactSubmission } from "@/lib/actions/contact-server";
import { HttpStatus, ApiResponse } from "@/lib/api/helpers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await handleContactSubmission(body);

    if (!result.success) {
      return ApiResponse.error(result.error, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    return ApiResponse.success(
      {
        status: result.data.status,
        message: "Message envoyé",
        ...(result.data.warning ? { warning: result.data.warning } : {}),
      },
      HttpStatus.OK
    );
  } catch (error) {
    console.error("[Contact API] Error:", error);
    return ApiResponse.error("Erreur serveur", HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
