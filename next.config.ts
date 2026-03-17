import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

// next.config.ts s'exécute avant le runtime Next.js : process.env est utilisé directement
// (exception documentée dans memory-bank/t3_env_guide.md — même règle que scripts/*.ts).
// Importer T3 Env ici forcerait la validation de toutes les variables serveur,
// y compris celles absentes en contexte E2E ou CI (RESEND_API_KEY, etc.).
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://yvtrlvmbofklefxcxrzv.supabase.co";

// https://nextjs.org/docs/messages/next-image-unconfigured-host
// https://nextjs.org/docs/app/api-reference/components/image#remotepatterns
const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb", // 5MB fichiers + overhead formData
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dummyimage.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "yvtrlvmbofklefxcxrzv.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "media.licdn.com",
        port: "",
        pathname: "/**",
      },
    ],
  },

  // Security headers (TASK036 - OWASP A05)
  // Reference: doc/OWASP-AUDIT-RESULTS.md
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Content Security Policy - Prevents XSS and code injection
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // TODO: Remove unsafe-* in production
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https:",
              "font-src 'self' data: https://fonts.gstatic.com",
              `connect-src 'self' ${supabaseUrl} https://*.ingest.de.sentry.io`,
              "frame-ancestors 'none'",
            ].join("; "),
          },
          // HTTP Strict Transport Security - Enforces HTTPS
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // Prevent clickjacking attacks
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // Prevent MIME type sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Control referrer information
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Restrict browser features
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

// Sentry configuration
// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
const sentryConfig = withSentryConfig(nextConfig, {
  org: "none-a26",
  project: "rouge-cardinal-test",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Upload a larger set of source maps for prettier stack traces
  widenClientFileUpload: true,

  // Route browser requests to Sentry through Next.js to avoid ad-blockers
  tunnelRoute: "/monitoring",

  // Webpack-specific options
  webpack: {
    automaticVercelMonitors: true,
    treeshake: {
      removeDebugLogging: true,
    },
  },
});

export default sentryConfig;
