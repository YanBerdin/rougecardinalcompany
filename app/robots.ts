import type { MetadataRoute } from "next";
import { WEBSITE_URL } from "@/lib/site-config";

// Empêche les crawlers d'indexer/parcourir le backoffice et les routes techniques,
// réduisant les invocations serverless inutiles (coût Fluid Compute) sur ces chemins.
export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: ["/admin", "/api", "/auth", "/debug-auth", "/debug-auth-before-admin"],
        },
        sitemap: `${WEBSITE_URL}/sitemap.xml`,
    };
}
