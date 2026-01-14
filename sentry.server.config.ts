// sentry.server.config.ts
// This file configures Sentry for the server-side (Node.js runtime)
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://c15837983554fbbd57b4de964d3deb46@o4510703440822272.ingest.de.sentry.io/4510703730425936",

  // Performance Monitoring - lower in production
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Debug mode for development only
  debug: process.env.NODE_ENV === "development",

  // Environment tag
  environment: process.env.NODE_ENV,

  // Filter sensitive data from server errors
  beforeSend(event) {
    // Remove sensitive headers
    if (event.request?.headers) {
      const headers = { ...event.request.headers };
      delete headers["authorization"];
      delete headers["cookie"];
      delete headers["x-api-key"];
      event.request.headers = headers;
    }
    return event;
  },
});
