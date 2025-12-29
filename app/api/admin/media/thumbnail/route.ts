// API Route: Generate thumbnail for media
// Pattern Warning: This is a non-critical operation
// Upload should succeed even if thumbnail generation fails

import { createClient } from "@/supabase/server";
import { requireAdmin } from "@/lib/auth/is-admin";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { z } from "zod";

const ThumbnailRequestSchema = z.object({
  mediaId: z.number().int().positive(),
  storagePath: z.string().min(1),
});

const THUMBNAIL_SIZE = 300;
const THUMBNAIL_QUALITY = 80;
const THUMBNAIL_SUFFIX = "_thumb.jpg";

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication check
    await requireAdmin();

    // 2. Validate request
    const body = await request.json();
    const validated = ThumbnailRequestSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validated.error.issues },
        { status: 400 }
      );
    }

    const { mediaId, storagePath } = validated.data;

    // 3. Download original from Supabase Storage
    const supabase = await createClient();
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("medias")
      .download(storagePath);

    if (downloadError) {
      console.error("[Thumbnail] Download failed:", downloadError);
      return NextResponse.json(
        { error: "Failed to download original file" },
        { status: 500 }
      );
    }

    // 4. Generate thumbnail with Sharp
    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const thumbnailBuffer = await sharp(buffer)
      .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, { fit: "cover" })
      .jpeg({ quality: THUMBNAIL_QUALITY })
      .toBuffer();

    // 5. Upload thumbnail to Storage
    const thumbPath = storagePath.replace(
      /\.(jpg|jpeg|png|webp)$/i,
      THUMBNAIL_SUFFIX
    );

    const { error: uploadError } = await supabase.storage
      .from("medias")
      .upload(thumbPath, thumbnailBuffer, {
        contentType: "image/jpeg",
        cacheControl: "31536000", // 1 year
        upsert: true, // Allow regeneration if needed
      });

    if (uploadError) {
      console.error("[Thumbnail] Upload failed:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload thumbnail" },
        { status: 500 }
      );
    }

    // 6. Update DB with thumbnail path
    const { error: updateError } = await supabase
      .from("medias")
      .update({ thumbnail_path: thumbPath })
      .eq("id", mediaId);

    if (updateError) {
      console.error("[Thumbnail] DB update failed:", updateError);
      return NextResponse.json(
        { error: "Failed to update database" },
        { status: 500 }
      );
    }

    // 7. Success
    return NextResponse.json({
      success: true,
      thumbPath,
      message: `Thumbnail generated successfully (${THUMBNAIL_SIZE}x${THUMBNAIL_SIZE})`,
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
