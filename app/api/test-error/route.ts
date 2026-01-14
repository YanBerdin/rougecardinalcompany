/*TODO: ⚠️ Remove this endpoint before production ⚠️
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
*/
/**
 * Test endpoint for Sentry alert validation
 * 
 * Usage:
 * - GET /api/test-error → Single error (for basic testing)
 * - GET /api/test-error?count=15 → Multiple errors (P0 alert threshold test)
 * - GET /api/test-error?type=frontend → Frontend error simulation
 * - GET /api/test-error?type=backend → Backend error simulation
 * - GET /api/test-error?severity=critical → Critical error with tags
 * 
 * ⚠️ WARNING: Remove this endpoint before production deployment!
 */
/*
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const count = parseInt(searchParams.get("count") || "1");
    const type = searchParams.get("type") || "backend";
    const severity = searchParams.get("severity") || "error";

    const errors: string[] = [];

    try {
        for (let i = 0; i < count; i++) {
            const errorMessage = `[TEST] Alert validation error ${i + 1}/${count} - Type: ${type}, Severity: ${severity}`;

            // Capture error with custom context
            Sentry.withScope((scope) => {
                // Add tags for filtering
                scope.setTag("test", "true");
                scope.setTag("alert_test", "true");
                scope.setTag("error_type", type);
                scope.setTag("severity", severity);

                // Add context
                scope.setContext("test_info", {
                    count,
                    index: i + 1,
                    timestamp: new Date().toISOString(),
                    endpoint: "/api/test-error",
                });

                // Set severity level
                scope.setLevel(
                    severity === "critical" ? "fatal" : severity === "warning" ? "warning" : "error"
                );

                // Capture exception
                Sentry.captureException(new Error(errorMessage));
            });

            errors.push(errorMessage);

            // Small delay between errors to avoid rate limiting
            if (i < count - 1) {
                await new Promise((resolve) => setTimeout(resolve, 100));
            }
        }

        return NextResponse.json({
            status: "errors_sent",
            message: `${count} test error(s) sent to Sentry`,
            errors,
            instructions: {
                check_dashboard: "https://none-a26.sentry.io/issues/",
                check_alerts:
                    count >= 10
                        ? "P0 alert should trigger (≥10 errors/min)"
                        : "Below P0 threshold (requires 10+ errors)",
            },
            warning: "⚠️ Remove this endpoint before production!",
        });
    } catch (error) {
        console.error("[test-error] Failed to send test errors:", error);

        return NextResponse.json(
            {
                status: "error",
                message: "Failed to send test errors",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
*/
/**
 * POST endpoint for batch error testing
 * 
 * Body:
 * {
 *   "count": 15,
 *   "type": "backend",
 *   "severity": "critical",
 *   "delay": 100
 * }
 */
/*
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { count = 1, type = "backend", severity = "error", delay = 100 } = body;

        const errors: string[] = [];

        for (let i = 0; i < count; i++) {
            const errorMessage = `[TEST BATCH] Error ${i + 1}/${count} - ${type}`;

            Sentry.withScope((scope) => {
                scope.setTag("test", "true");
                scope.setTag("alert_test", "true");
                scope.setTag("batch_test", "true");
                scope.setTag("error_type", type);
                scope.setTag("severity", severity);

                scope.setContext("batch_info", {
                    total: count,
                    index: i + 1,
                    timestamp: new Date().toISOString(),
                });

                scope.setLevel(
                    severity === "critical" ? "fatal" : severity === "warning" ? "warning" : "error"
                );

                Sentry.captureException(new Error(errorMessage));
            });

            errors.push(errorMessage);

            if (i < count - 1 && delay > 0) {
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }

        return NextResponse.json({
            status: "batch_sent",
            message: `${count} test errors sent`,
            errors,
            alert_expectation:
                count >= 10
                    ? "P0 alert should trigger"
                    : count >= 50
                        ? "P1 alert should trigger (if 1h window)"
                        : "Below alert thresholds",
        });
    } catch (error) {
        return NextResponse.json(
            {
                status: "error",
                message: "Batch test failed",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
*/