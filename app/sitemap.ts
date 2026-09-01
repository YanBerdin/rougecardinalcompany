import type { MetadataRoute } from "next";
import { WEBSITE_URL } from "@/lib/site-config";

const PUBLIC_ROUTES = [
    "/",
    "/spectacles",
    "/compagnie",
    "/agenda",
    "/presse",
    "/contact",
    "/mentions-legales",
    "/politique-confidentialite",
    "/cookies",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
    return PUBLIC_ROUTES.map((route) => ({
        url: new URL(route, WEBSITE_URL).toString(),
    }));
}