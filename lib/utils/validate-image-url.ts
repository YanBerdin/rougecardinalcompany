"use server";

const ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/svg+xml",
    "image/gif",
] as const;

type AllowedMimeType = typeof ALLOWED_MIME_TYPES[number];

function isAllowedMimeType(mime: string): mime is AllowedMimeType {
    return ALLOWED_MIME_TYPES.includes(mime as AllowedMimeType);
}

export interface ImageValidationResult {
    valid: boolean;
    error?: string;
    mime?: AllowedMimeType;
    size?: number;
}

export async function validateImageUrl(
    url: string
): Promise<ImageValidationResult> {
    try {
        const response = await fetch(url, {
            method: "HEAD",
            signal: AbortSignal.timeout(5000)
        });

        if (!response.ok) {
            return {
                valid: false,
                error: `HTTP ${response.status}: ${response.statusText}`,
            };
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !isAllowedMimeType(contentType.split(";")[0].trim())) {
            return {
                valid: false,
                error: `Invalid image type: ${contentType}. Allowed: ${ALLOWED_MIME_TYPES.join(", ")}`,
            };
        }

        const contentLength = response.headers.get("content-length");
        const size = contentLength ? parseInt(contentLength, 10) : undefined;

        return {
            valid: true,
            mime: contentType.split(";")[0].trim() as AllowedMimeType,
            size,
        };
    } catch (error: unknown) {
        return {
            valid: false,
            error: error instanceof Error ? error.message : "Unknown validation error",
        };
    }
}
