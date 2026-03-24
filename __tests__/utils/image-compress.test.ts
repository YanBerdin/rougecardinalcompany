import { describe, it, expect } from "vitest";
import sharp from "sharp";
import {
    compressImage,
    MAX_IMAGE_DIMENSION,
    COMPRESSIBLE_MIMES,
} from "@/lib/utils/image-compress";

// =============================================================================
// HELPERS
// =============================================================================

function createTestFile(buffer: Buffer, name: string, type: string): File {
    return new File([Uint8Array.from(buffer)], name, { type });
}

async function createJpegBuffer(width: number, height: number): Promise<Buffer> {
    return sharp({
        create: { width, height, channels: 3, background: { r: 220, g: 80, b: 40 } },
    })
        .jpeg({ quality: 95 }) // start at high quality → compression should reduce it
        .toBuffer();
}

async function createPngBuffer(width: number, height: number): Promise<Buffer> {
    return sharp({
        create: { width, height, channels: 4, background: { r: 0, g: 128, b: 255, alpha: 1 } },
    })
        .png({ compressionLevel: 0 }) // uncompressed → target compression may improve it
        .toBuffer();
}

async function createWebpBuffer(width: number, height: number): Promise<Buffer> {
    return sharp({
        create: { width, height, channels: 3, background: { r: 100, g: 200, b: 150 } },
    })
        .webp({ quality: 95 })
        .toBuffer();
}

// =============================================================================
// TESTS
// =============================================================================

describe("compressImage", () => {
    describe("COMPRESSIBLE_MIMES coverage", () => {
        it("lists all expected compressible MIME types", () => {
            expect(COMPRESSIBLE_MIMES).toContain("image/jpeg");
            expect(COMPRESSIBLE_MIMES).toContain("image/png");
            expect(COMPRESSIBLE_MIMES).toContain("image/webp");
            expect(COMPRESSIBLE_MIMES).toContain("image/avif");
        });
    });

    describe("JPEG compression", () => {
        it("compresses a large JPEG and returns wasCompressed:true", async () => {
            const jpegBuffer = await createJpegBuffer(800, 800);
            const file = createTestFile(jpegBuffer, "photo.jpg", "image/jpeg");

            const result = await compressImage(file);

            expect(result.mimeType).toBe("image/jpeg");
            expect(result.sizeBytes).toBeLessThan(jpegBuffer.length);
            expect(result.sizeBytes).toBe(result.buffer.length);
            expect(result.wasCompressed).toBe(true);
        });
    });

    describe("PNG compression", () => {
        it("compresses an uncompressed PNG", async () => {
            const pngBuffer = await createPngBuffer(400, 400);
            const file = createTestFile(pngBuffer, "image.png", "image/png");

            const result = await compressImage(file);

            expect(result.mimeType).toBe("image/png");
            expect(result.sizeBytes).toBeGreaterThan(0);
            expect(result.buffer.length).toBe(result.sizeBytes);
        });
    });

    describe("WebP compression", () => {
        it("compresses a WebP image", async () => {
            const webpBuffer = await createWebpBuffer(600, 600);
            const file = createTestFile(webpBuffer, "banner.webp", "image/webp");

            const result = await compressImage(file);

            expect(result.mimeType).toBe("image/webp");
            expect(result.sizeBytes).toBeGreaterThan(0);
            expect(result.buffer.length).toBe(result.sizeBytes);
        });
    });

    describe("Non-compressible formats (skip)", () => {
        it("returns wasCompressed:false for GIF", async () => {
            // minimal valid GIF89a 1×1 px
            const gifBuffer = Buffer.from(
                "474946383961010000800000ffffff00002c00000000010001000002024401003b",
                "hex"
            );
            const file = createTestFile(gifBuffer, "anim.gif", "image/gif");

            const result = await compressImage(file);

            expect(result.wasCompressed).toBe(false);
            expect(result.mimeType).toBe("image/gif");
            expect(result.buffer.equals(gifBuffer)).toBe(true);
        });

        it("returns wasCompressed:false for SVG", async () => {
            const svgBuffer = Buffer.from(
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40"/></svg>',
                "utf-8"
            );
            const file = createTestFile(svgBuffer, "logo.svg", "image/svg+xml");

            const result = await compressImage(file);

            expect(result.wasCompressed).toBe(false);
            expect(result.mimeType).toBe("image/svg+xml");
            expect(result.buffer.equals(svgBuffer)).toBe(true);
        });

        it("returns wasCompressed:false for PDF", async () => {
            const pdfBuffer = Buffer.from("%PDF-1.4 minimal content", "utf-8");
            const file = createTestFile(pdfBuffer, "document.pdf", "application/pdf");

            const result = await compressImage(file);

            expect(result.wasCompressed).toBe(false);
            expect(result.mimeType).toBe("application/pdf");
            expect(result.buffer.equals(pdfBuffer)).toBe(true);
        });
    });

    describe("Dimension enforcement", () => {
        it("resizes an oversized image to MAX_IMAGE_DIMENSION", async () => {
            const oversizedBuffer = await createJpegBuffer(
                MAX_IMAGE_DIMENSION + 800,
                MAX_IMAGE_DIMENSION + 800
            );
            const file = createTestFile(oversizedBuffer, "huge.jpg", "image/jpeg");

            const result = await compressImage(file);

            const metadata = await sharp(result.buffer).metadata();
            expect(metadata.width).toBeLessThanOrEqual(MAX_IMAGE_DIMENSION);
            expect(metadata.height).toBeLessThanOrEqual(MAX_IMAGE_DIMENSION);
        });

        it("does not enlarge a small image (withoutEnlargement)", async () => {
            const smallBuffer = await createJpegBuffer(50, 50);
            const file = createTestFile(smallBuffer, "thumbnail.jpg", "image/jpeg");

            const result = await compressImage(file);

            const metadata = await sharp(result.buffer).metadata();
            expect(metadata.width).toBeLessThanOrEqual(50);
            expect(metadata.height).toBeLessThanOrEqual(50);
        });
    });

    describe("Safety guard", () => {
        it("result.sizeBytes always equals result.buffer.length", async () => {
            const jpegBuffer = await createJpegBuffer(200, 200);
            const file = createTestFile(jpegBuffer, "pic.jpg", "image/jpeg");

            const result = await compressImage(file);

            expect(result.sizeBytes).toBe(result.buffer.length);
        });

        it("never returns a larger file than the original", async () => {
            // Even if Sharp's output is larger for some edge-case input, the guard kicks in
            const jpegBuffer = await createJpegBuffer(10, 10);
            const file = createTestFile(jpegBuffer, "tiny.jpg", "image/jpeg");

            const result = await compressImage(file);

            expect(result.sizeBytes).toBeLessThanOrEqual(jpegBuffer.length);
        });
    });
});
