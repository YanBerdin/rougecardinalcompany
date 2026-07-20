// API Route: Generate thumbnail for media
// Pattern Warning: This is a non-critical operation
// Upload should succeed even if thumbnail generation fails
//
// NOTE: The actual generation logic lives in lib/dal/media-thumbnail.ts.
// Server Actions call that function directly (no HTTP round-trip). This
// route only exists for potential external/API callers.

import { generateMediaThumbnail } from "@/lib/dal/media-thumbnail";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const ThumbnailRequestSchema = z.object({
  mediaId: z.number().int().positive(),
  storagePath: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = ThumbnailRequestSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validated.error.issues },
        { status: 400 }
      );
    }

    const result = await generateMediaThumbnail(validated.data);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      thumbPath: result.data.thumbPath,
      message: "Thumbnail generated successfully",
    });
  } catch (error: unknown) {
    console.error("[Thumbnail API] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
