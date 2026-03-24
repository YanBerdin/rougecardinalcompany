import sharp from "sharp";

// =============================================================================
// CONSTANTS
// =============================================================================

export const IMAGE_QUALITY = 85;
export const MAX_IMAGE_DIMENSION = 2400;

export const COMPRESSIBLE_MIMES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
] as const;

type CompressibleMime = (typeof COMPRESSIBLE_MIMES)[number];

// =============================================================================
// TYPES
// =============================================================================

export interface CompressedImage {
    buffer: Buffer;
    mimeType: string;
    sizeBytes: number;
    wasCompressed: boolean;
}

// =============================================================================
// HELPERS (< 30 lines each)
// =============================================================================

function isCompressible(mimeType: string): mimeType is CompressibleMime {
    return (COMPRESSIBLE_MIMES as readonly string[]).includes(mimeType);
}

function buildSkipResult(originalBuffer: Buffer, mimeType: string): CompressedImage {
    return {
        buffer: originalBuffer,
        mimeType,
        sizeBytes: originalBuffer.length,
        wasCompressed: false,
    };
}

function applyFormat(pipeline: sharp.Sharp, mimeType: CompressibleMime): sharp.Sharp {
    switch (mimeType) {
        case "image/jpeg":
            return pipeline.jpeg({ quality: IMAGE_QUALITY, mozjpeg: true });
        case "image/png":
            return pipeline.png({ quality: IMAGE_QUALITY, effort: 6 });
        case "image/webp":
            return pipeline.webp({ quality: IMAGE_QUALITY });
        case "image/avif":
            return pipeline.avif({ quality: IMAGE_QUALITY });
    }
}

function logCompression(originalSize: number, compressedSize: number): void {
    const ratio = Math.round((1 - compressedSize / originalSize) * 100);
    console.log(
        `[Media] Compressed: ${originalSize} → ${compressedSize} (${ratio}% reduction)`
    );
}

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Compress a raster image using Sharp.
 *
 * - Skips GIF, SVG, PDF and other non-raster formats (wasCompressed: false)
 * - Resizes proportionally if width or height exceeds MAX_IMAGE_DIMENSION
 * - Safety guard: keeps the original if compression produces a larger file
 */
export async function compressImage(file: File): Promise<CompressedImage> {
    const mimeType = file.type;

    if (!isCompressible(mimeType)) {
        const buffer = Buffer.from(await file.arrayBuffer());
        return buildSkipResult(buffer, mimeType);
    }

    const originalBuffer = Buffer.from(await file.arrayBuffer());

    const resized = sharp(originalBuffer).resize({
        width: MAX_IMAGE_DIMENSION,
        height: MAX_IMAGE_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
    });

    const compressed = applyFormat(resized, mimeType);
    const compressedBuffer = await compressed.toBuffer();

    // Safety guard: keep original if compression increased the file size
    if (compressedBuffer.length >= originalBuffer.length) {
        console.log(
            `[Media] Compression skipped (larger result): ${originalBuffer.length} → ${compressedBuffer.length}`
        );
        return buildSkipResult(originalBuffer, mimeType);
    }

    logCompression(originalBuffer.length, compressedBuffer.length);

    return {
        buffer: compressedBuffer,
        mimeType,
        sizeBytes: compressedBuffer.length,
        wasCompressed: true,
    };
}
