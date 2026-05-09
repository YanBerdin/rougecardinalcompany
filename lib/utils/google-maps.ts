/**
 * @file google-maps.ts
 * @description Build a Google Maps URL from venue data (text query preferred, lat/lng as fallback).
 */

interface VenueLocation {
    name?: string | null;
    address?: string | null;
    city?: string | null;
    latitude?: number | null;
    longitude?: number | null;
}

/**
 * Builds a Google Maps URL (Maps URLs API: https://developers.google.com/maps/documentation/urls/get-started).
 *
 * Preference order:
 *   1. Concatenates `name`, `address`, `city` (whichever are non-empty) → resolves to the
 *      official Google Place card when the venue is indexed (preferred behaviour).
 *   2. Falls back to `query=lat,lng` when no textual data is available.
 *
 * @param location - Venue textual location data and/or coordinates.
 * @returns A Google Maps URL string, or `null` when no exploitable data is provided.
 */
export function buildGoogleMapsUrl(location: VenueLocation): string | null {
    const { name, address, city, latitude, longitude } = location;

    const parts = [name, address, city]
        .map((part) => (typeof part === "string" ? part.trim() : ""))
        .filter((part) => part.length > 0);

    if (parts.length > 0) {
        const query = encodeURIComponent(parts.join(", "));
        return `https://www.google.com/maps/search/?api=1&query=${query}`;
    }

    if (
        typeof latitude === "number" &&
        typeof longitude === "number" &&
        Number.isFinite(latitude) &&
        Number.isFinite(longitude)
    ) {
        return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    }

    return null;
}
