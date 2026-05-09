import { describe, it, expect } from "vitest";
import { buildGoogleMapsUrl } from "@/lib/utils/google-maps";

describe("buildGoogleMapsUrl", () => {
    it("prefers text query even when coordinates are present", () => {
        const url = buildGoogleMapsUrl({
            name: "Théâtre du Soleil",
            address: "Cartoucherie Route du Champ-de-Manœuvre",
            city: "75012 Paris",
            latitude: 48.8358,
            longitude: 2.4496,
        });
        expect(url).toBe(
            `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                "Théâtre du Soleil, Cartoucherie Route du Champ-de-Manœuvre, 75012 Paris"
            )}`
        );
    });

    it("falls back to lat/lng when no textual data is available", () => {
        const url = buildGoogleMapsUrl({
            latitude: 48.8358,
            longitude: 2.4496,
        });
        expect(url).toBe("https://www.google.com/maps/search/?api=1&query=48.8358,2.4496");
    });

    it("uses encoded text query when coordinates are missing", () => {
        const url = buildGoogleMapsUrl({
            name: "Théâtre Le Public",
            address: "10 rue Braemt",
            city: "1210 Bruxelles",
        });
        expect(url).toBe(
            `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                "Théâtre Le Public, 10 rue Braemt, 1210 Bruxelles"
            )}`
        );
    });

    it("returns null when no exploitable data is provided", () => {
        expect(
            buildGoogleMapsUrl({
                name: "",
                address: null,
                city: undefined,
                latitude: null,
                longitude: null,
            })
        ).toBeNull();
        expect(buildGoogleMapsUrl({})).toBeNull();
    });

    it("encodes special characters and skips empty parts", () => {
        const url = buildGoogleMapsUrl({
            name: "Café & Théâtre",
            address: "  ",
            city: "Paris 5e",
        });
        expect(url).toBe(
            `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                "Café & Théâtre, Paris 5e"
            )}`
        );
        expect(url).toContain("%26"); // & encoded
    });

    it("ignores partial coordinates (lat without lng)", () => {
        const url = buildGoogleMapsUrl({
            name: "Salle X",
            latitude: 48.85,
            longitude: null,
        });
        expect(url).toBe(
            `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Salle X")}`
        );
    });

    it("ignores non-finite coordinates (NaN)", () => {
        const url = buildGoogleMapsUrl({
            name: "Lieu Y",
            latitude: Number.NaN,
            longitude: 2.0,
        });
        expect(url).toBe(
            `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Lieu Y")}`
        );
    });
});
