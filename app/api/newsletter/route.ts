import { handleNewsletterSubscription } from "@/lib/actions/newsletter-server";
import { HttpStatus, ApiResponse } from "@/lib/api/helpers";


export async function POST(req: Request) {
  try {
    const json = await req.json();
    const result = await handleNewsletterSubscription(json);

    if (!result.success) {
      return ApiResponse.error(result.error, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    return ApiResponse.success(
      {
        status: result.data.status,
        ...(result.data.warning ? { warning: result.data.warning } : {}),
      },
      HttpStatus.OK
    );
  } catch {
    return ApiResponse.error("Invalid JSON body", HttpStatus.BAD_REQUEST);
  }
}
