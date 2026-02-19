/**
 * @file MIME Type Verification via Magic Bytes
 * @description Server-side MIME detection from file signature (not client-provided Content-Type).
 * Prevents MIME-type spoofing attacks where a malicious file claims to be an image.
 * @module lib/utils/mime-verify
 */

import type { AllowedUploadMimeType } from "@/lib/schemas/media";

// =============================================================================
// CONSTANTS
// =============================================================================

const AVIF_FTYP_SIGNATURE = [0x66, 0x74, 0x79, 0x70] as const; // "ftyp" at offset 4
const AVIF_BRANDS = ["avif", "avis", "mif1", "msf1"] as const;

/** Must be large enough to contain SVG/XML declarations */
const MINIMUM_HEADER_BYTES = 64;

// =============================================================================
// HELPERS
// =============================================================================

function matchesSignature(
    buffer: Uint8Array,
    signature: readonly number[],
    offset = 0
): boolean {
    return signature.every((byte, index) => buffer[offset + index] === byte);
}

function readFourCC(buffer: Uint8Array, offset: number): string {
    return String.fromCharCode(
        buffer[offset],
        buffer[offset + 1],
        buffer[offset + 2],
        buffer[offset + 3]
    );
}

function startsWithText(buffer: Uint8Array, text: string, offset = 0): boolean {
    for (let i = 0; i < text.length; i++) {
        if (buffer[offset + i] !== text.charCodeAt(i)) return false;
    }
    return true;
}

// =============================================================================
// FORMAT DETECTORS
// =============================================================================

function detectJpeg(buffer: Uint8Array): boolean {
    return matchesSignature(buffer, [0xff, 0xd8, 0xff]);
}

function detectPng(buffer: Uint8Array): boolean {
    return matchesSignature(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
}

function detectWebp(buffer: Uint8Array): boolean {
    return (
        matchesSignature(buffer, [0x52, 0x49, 0x46, 0x46]) &&
        matchesSignature(buffer, [0x57, 0x45, 0x42, 0x50], 8)
    );
}

function detectAvif(buffer: Uint8Array): boolean {
    if (!matchesSignature(buffer, AVIF_FTYP_SIGNATURE, 4)) return false;
    const majorBrand = readFourCC(buffer, 8);
    return AVIF_BRANDS.includes(majorBrand as (typeof AVIF_BRANDS)[number]);
}

function detectGif(buffer: Uint8Array): boolean {
    // GIF87a: 47 49 46 38 37 61  |  GIF89a: 47 49 46 38 39 61
    return (
        matchesSignature(buffer, [0x47, 0x49, 0x46, 0x38]) &&
        (buffer[4] === 0x37 || buffer[4] === 0x39) &&
        buffer[5] === 0x61
    );
}

function detectSvg(buffer: Uint8Array): boolean {
    // Strip optional UTF-8 BOM (EF BB BF)
    const offset = matchesSignature(buffer, [0xef, 0xbb, 0xbf]) ? 3 : 0;
    return (
        startsWithText(buffer, "<svg", offset) ||
        startsWithText(buffer, "<?xml", offset)
    );
}

function detectPdf(buffer: Uint8Array): boolean {
    // %PDF-
    return matchesSignature(buffer, [0x25, 0x50, 0x44, 0x46, 0x2d]);
}

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Detects the actual MIME type of a file by reading its magic bytes.
 * Returns null if the format is unrecognised or not in the allowlist.
 *
 * Supported formats: JPEG · PNG · WebP · AVIF · GIF · SVG · PDF
 */
export function detectMimeFromBytes(buffer: Uint8Array): AllowedUploadMimeType | null {
    if (buffer.length < MINIMUM_HEADER_BYTES) return null;

    if (detectJpeg(buffer)) return "image/jpeg";
    if (detectPng(buffer)) return "image/png";
    if (detectWebp(buffer)) return "image/webp";
    if (detectAvif(buffer)) return "image/avif";
    if (detectGif(buffer)) return "image/gif";
    if (detectPdf(buffer)) return "application/pdf";
    if (detectSvg(buffer)) return "image/svg+xml";

    return null;
}

/**
 * Reads the leading bytes of a File and returns the detected MIME type.
 * Returns null if unrecognised.
 */
export async function verifyFileMime(file: File): Promise<AllowedUploadMimeType | null> {
    const headerBuffer = await file.slice(0, MINIMUM_HEADER_BYTES).arrayBuffer();
    return detectMimeFromBytes(new Uint8Array(headerBuffer));
}
