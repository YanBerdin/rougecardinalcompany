/**
 * Formatting utilities for DAL functions
 * @module lib/dal/helpers/format
 */

// ============================================================================
// Date & Time Formatting
// ============================================================================

/**
 * Format time from Date or HH:MM:SS string to "HHhMM" format
 *
 * @param date - Base date for fallback
 * @param startTime - Optional time string in HH:MM:SS format
 * @returns Formatted time string like "20h30"
 *
 * @example
 * formatTime(new Date(), "20:30:00") // "20h30"
 * formatTime(new Date("2025-01-01T14:00:00")) // "14h00"
 */
export function formatTime(date: Date, startTime?: string | null): string {
    if (startTime) {
        const [h, m] = startTime.split(":");
        return `${h}h${m}`;
    }
    const h = date.getHours().toString().padStart(2, "0");
    const m = date.getMinutes().toString().padStart(2, "0");
    return `${h}h${m}`;
}

/**
 * Convert Date to ISO date string (YYYY-MM-DD)
 *
 * @param d - Date to convert
 * @returns ISO date string
 *
 * @example
 * toISODateString(new Date("2025-03-15")) // "2025-03-15"
 */
export function toISODateString(d: Date): string {
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    return `${y}-${m}-${day}`;
}

// ============================================================================
// Size Formatting
// ============================================================================

/**
 * Convert bytes to human-readable format
 *
 * @param size - Size in bytes (null/undefined returns "—")
 * @returns Human-readable size string
 *
 * @example
 * bytesToHuman(1024) // "1 KB"
 * bytesToHuman(1536) // "1.5 KB"
 * bytesToHuman(null) // "—"
 */
export function bytesToHuman(size: number | null | undefined): string {
    if (size == null || Number.isNaN(size)) return "—";
    const units = ["B", "KB", "MB", "GB", "TB"] as const;
    let s = size;
    let i = 0;
    while (s >= 1024 && i < units.length - 1) {
        s /= 1024;
        i += 1;
    }
    return `${s % 1 === 0 ? s.toFixed(0) : s.toFixed(1)} ${units[i]}`;
}
