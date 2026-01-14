import * as Sentry from "@sentry/nextjs";

interface CaptureErrorOptions {
  userId?: string;
  userEmail?: string;
  route?: string;
  actionName?: string;
  extra?: Record<string, unknown>;
  tags?: Record<string, string>;
  level?: Sentry.SeverityLevel;
}

export function captureError(
  error: unknown,
  options: CaptureErrorOptions = {},
) {
  const { userId, userEmail, route, actionName, extra, tags, level } = options;

  // Set user context if available
  if (userId || userEmail) {
    Sentry.setUser({
      id: userId,
      email: userEmail,
    });
  }

  // Capture the exception
  Sentry.captureException(error, {
    extra: {
      route,
      actionName,
      ...extra,
    },
    tags: {
      ...(route && { route }),
      ...(actionName && { action: actionName }),
      ...tags,
    },
    level: level || "error",
  });

  // Clear user context after capture
  if (userId || userEmail) {
    Sentry.setUser(null);
  }
}

export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = "info",
  extra?: Record<string, unknown>,
) {
  Sentry.captureMessage(message, {
    level,
    extra,
  });
}

export function setUserContext(userId: string, email?: string) {
  Sentry.setUser({
    id: userId,
    email,
  });
}

export function clearUserContext() {
  Sentry.setUser(null);
}

export function addBreadcrumb(
  message: string,
  category: string,
  level: Sentry.SeverityLevel = "info",
  data?: Record<string, unknown>,
) {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
}

export function startSpan<T>(
  name: string,
  operation: string,
  callback: () => T,
): T {
  return Sentry.startSpan(
    {
      name,
      op: operation,
    },
    callback,
  );
}

export async function startSpanAsync<T>(
  name: string,
  operation: string,
  callback: () => Promise<T>,
): Promise<T> {
  return Sentry.startSpan(
    {
      name,
      op: operation,
    },
    callback,
  );
}
