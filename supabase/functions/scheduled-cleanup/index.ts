// =====================================================
// Supabase Edge Function: Scheduled Data Retention Cleanup
// =====================================================
// Purpose: Automated daily cleanup of expired data (RGPD compliance)
// Schedule: Daily at 2:00 AM UTC (configured in Supabase Dashboard)
// Security: Protected by CRON_SECRET environment variable
// =====================================================

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// @ts-ignore - Deno npm: specifier not recognized by TypeScript IDE
import { createClient } from "npm:@supabase/supabase-js@2";

// =====================================================
// Types
// =====================================================

interface CleanupResult {
    table: string;
    deleted: number;
    status: string;
    execution_time_ms?: number;
    error?: string;
    archived?: number;
}

interface HealthIssue {
    table_name: string;
    issue: string;
    severity: string;
}

// =====================================================
// Configuration
// =====================================================

// @ts-ignore - Deno environment (TypeScript IDE doesn't recognize Deno runtime)
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
// @ts-ignore - Deno environment
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
// @ts-ignore - Deno environment (CRON_SECRET configured in Supabase Dashboard after deployment)
const CRON_SECRET = Deno.env.get("CRON_SECRET");

// Tables à purger (ordre important: dépendances d'abord si nécessaire)
const CLEANUP_TABLES = [
    "logs_audit",
    "abonnes_newsletter",
    "messages_contact",
    "analytics_events",
] as const;

// =====================================================
// Utilities
// =====================================================

function logInfo(message: string, data?: unknown) {
    console.log(`[INFO] ${message}`, data ? JSON.stringify(data, null, 2) : "");
}

function logError(message: string, error: unknown) {
    console.error(
        `[ERROR] ${message}`,
        error instanceof Error ? error.message : String(error)
    );
}

// =====================================================
// Main Handler
// =====================================================

// @ts-ignore - Deno.serve is available in Supabase Edge Function runtime
Deno.serve(async (req: Request) => {
    const startTime = Date.now();

    try {
        // =====================================================
        // 1. Authentication
        // =====================================================

        const authHeader = req.headers.get("Authorization");

        if (!CRON_SECRET) {
            logError("CRON_SECRET not configured", null);
            return new Response(
                JSON.stringify({ error: "Server configuration error" }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        if (authHeader !== `Bearer ${CRON_SECRET}`) {
            logError("Invalid authorization header", { received: authHeader });
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }

        logInfo("✅ Authentication successful");

        // =====================================================
        // 2. Initialize Supabase Client
        // =====================================================

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });

        logInfo("✅ Supabase client initialized");

        // =====================================================
        // 3. Pre-flight Health Check
        // =====================================================

        const { data: healthData, error: healthError } = await supabase.rpc(
            "check_retention_health"
        );

        if (healthError) {
            logError("Health check failed", healthError);
        } else if (healthData && healthData.length > 0) {
            logInfo("⚠️  Health issues detected before cleanup:", healthData);
        } else {
            logInfo("✅ Pre-flight health check passed");
        }

        // =====================================================
        // 4. Execute Cleanups Sequentially
        // =====================================================

        const results: Record<
            string,
            CleanupResult | { error: string; status: "failed" }
        > = {};
        let totalDeleted = 0;
        let successCount = 0;
        let failureCount = 0;

        for (const tableName of CLEANUP_TABLES) {
            logInfo(`🗑️  Starting cleanup for: ${tableName}`);

            try {
                const { data, error } = await supabase.rpc("cleanup_expired_data", {
                    p_table_name: tableName,
                });

                if (error) {
                    throw error;
                }

                if (!data) {
                    throw new Error("No data returned from cleanup function");
                }

                const result = data as CleanupResult;
                results[tableName] = result;

                totalDeleted += result.deleted || 0;

                if (result.status === "success") {
                    successCount++;
                    logInfo(`✅ Cleanup successful for ${tableName}:`, {
                        deleted: result.deleted,
                        execution_ms: result.execution_time_ms,
                    });
                } else {
                    failureCount++;
                    logError(`❌ Cleanup partial/failed for ${tableName}`, result);
                }
            } catch (error) {
                failureCount++;
                const errorMessage =
                    error instanceof Error ? error.message : String(error);
                results[tableName] = {
                    error: errorMessage,
                    status: "failed",
                };
                logError(`❌ Exception during cleanup for ${tableName}`, error);
            }

            // Small delay between tables to avoid resource contention
            await new Promise((resolve) => setTimeout(resolve, 100));
        }

        // =====================================================
        // 5. Post-cleanup Health Check
        // =====================================================

        const { data: postHealthData, error: postHealthError } = await supabase.rpc(
            "check_retention_health"
        );

        if (postHealthError) {
            logError("Post-cleanup health check failed", postHealthError);
        } else if (postHealthData && postHealthData.length > 0) {
            logInfo("⚠️  Health issues remain after cleanup:", postHealthData);
        } else {
            logInfo("✅ Post-cleanup health check passed");
        }

        // =====================================================
        // 6. Build Response
        // =====================================================

        const totalTime = Date.now() - startTime;

        const summary = {
            timestamp: new Date().toISOString(),
            duration_ms: totalTime,
            total_deleted: totalDeleted,
            tables_processed: CLEANUP_TABLES.length,
            success_count: successCount,
            failure_count: failureCount,
            results,
            health_before: healthData as HealthIssue[] | null,
            health_after: postHealthData as HealthIssue[] | null,
        };

        logInfo("📊 Cleanup job completed:", summary);

        // Return success even if some individual cleanups failed
        // (audit trail exists in database)
        const statusCode = failureCount === CLEANUP_TABLES.length ? 500 : 200;

        return new Response(JSON.stringify(summary, null, 2), {
            status: statusCode,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        // =====================================================
        // 7. Global Error Handler
        // =====================================================

        logError("Unhandled exception in cleanup job", error);

        const totalTime = Date.now() - startTime;

        return new Response(
            JSON.stringify(
                {
                    error: "Cleanup job failed",
                    message: error instanceof Error ? error.message : String(error),
                    duration_ms: totalTime,
                    timestamp: new Date().toISOString(),
                },
                null,
                2
            ),
            {
                status: 500,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
    }
});

/* 
 * =====================================================
 * DEPLOYMENT INSTRUCTIONS
 * =====================================================
 * 
 * 1. Deploy function:
 *    pnpm dlx supabase functions deploy scheduled-cleanup
 * 
 * 2. Set environment variable (Supabase Dashboard):
 *    - Go to: Edge Functions → scheduled-cleanup → Settings
 *    - Add secret: CRON_SECRET = <random-secure-token>
 *    - Generate with: openssl rand -base64 32
 * 
 * 3. Configure cron schedule (Supabase Dashboard):
 *    - Go to: Edge Functions → scheduled-cleanup → Cron Jobs
 *    - Schedule: "0 2 * * *" (daily at 2:00 AM UTC)
 *    - Method: POST
 *    - Headers: Authorization: Bearer ${CRON_SECRET}
 * 
 * 4. Test manually:
 *    curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/scheduled-cleanup \
 *      -H "Authorization: Bearer ${CRON_SECRET}" \
 *      -H "Content-Type: application/json"
 * 
 * 5. Monitor logs:
 *    - Supabase Dashboard → Edge Functions → scheduled-cleanup → Logs
 *    - Check data_retention_audit table for execution history
 * 
 * =====================================================
 */
