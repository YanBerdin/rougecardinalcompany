// sentry.client.config.ts
// This file configures Sentry for the client-side (browser)
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { SupabaseClient } from "@supabase/supabase-js";
import { supabaseIntegration } from "@supabase/sentry-js-integration";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

Sentry.init({
  dsn: "https://c15837983554fbbd57b4de964d3deb46@o4510703440822272.ingest.de.sentry.io/4510703730425936",

  integrations: [
    // Supabase integration for tracing database calls
    supabaseIntegration(SupabaseClient, Sentry, {
      tracing: true,
      breadcrumbs: true,
      errors: true,
    }),
    // Browser tracing with span deduplication for Supabase REST calls
    Sentry.browserTracingIntegration({
      shouldCreateSpanForRequest: (url) => {
        return !url.startsWith(`${SUPABASE_URL}/rest`);
      },
    }),
    // Session replay for debugging user issues
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Performance Monitoring - lower in production
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Session Replay - capture all errors, sample 10% of sessions
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Debug mode for development only
  debug: process.env.NODE_ENV === "development",

  // Environment tag
  environment: process.env.NODE_ENV,

  // Filter out non-critical errors
  beforeSend(event) {
    // Ignore ResizeObserver errors (common false positive)
    if (event.message?.includes("ResizeObserver")) {
      return null;
    }
    // Ignore hydration errors in development
    if (
      process.env.NODE_ENV === "development" &&
      event.message?.includes("Hydration")
    ) {
      return null;
    }
    // Ignore Next.js 16 Turbopack streaming bug (known issue)
    if (event.message?.includes("transformAlgorithm is not a function")) {
      return null;
    }
    return event;
  },
});
