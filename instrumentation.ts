// instrumentation.ts
// Next.js instrumentation hook for Sentry initialization
// https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = async (
  error: Error,
  request: Request,
  context: { routerKind: string; routePath: string; routeType: string },
) => {
  const Sentry = await import("@sentry/nextjs");

  Sentry.captureException(error, {
    extra: {
      routerKind: context.routerKind,
      routePath: context.routePath,
      routeType: context.routeType,
      url: request.url,
      method: request.method,
    },
    tags: {
      runtime: process.env.NEXT_RUNTIME || "unknown",
      routeType: context.routeType,
    },
  });
};
