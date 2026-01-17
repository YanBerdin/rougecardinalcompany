"use server";
import "server-only";

/**
 * Sentry API Integration Service
 * @module lib/services/sentry-api
 *
 * Provides access to Sentry error metrics via the Sentry API.
 * Used by analytics dashboard to display production error counts.
 */

import { env } from "@/lib/env";
import { dalError, dalSuccess, getErrorMessage, type DALResult } from "@/lib/dal/helpers/error";
import { SentryErrorMetricsSchema, type SentryErrorMetrics } from "@/lib/schemas/analytics";

// ============================================================================
// TYPES
// ============================================================================

interface SentryIssue {
    id: string;
    title: string;
    level: string;
    status: string;
    count: string;
    userCount: number;
    firstSeen: string;
    lastSeen: string;
    priority?: string;
}

interface SentryIssuesResponse {
    data: SentryIssue[];
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const SENTRY_API_BASE = "https://sentry.io/api/0";
const SENTRY_PRIORITIES = {
    P0: "high", // Critical
    P1: "medium", // High
    P2: "low", // Medium
} as const;

// ============================================================================
// API CLIENT
// ============================================================================

/**
 * Fetch issues from Sentry API
 *
 * @param query - URL query parameters
 * @returns Sentry issues response
 */
async function fetchSentryIssues(query: string = ""): Promise<SentryIssue[]> {
    const sentryOrg = env.SENTRY_ORG;
    const sentryProject = env.SENTRY_PROJECT;
    const sentryToken = env.SENTRY_AUTH_TOKEN;

    if (!sentryOrg || !sentryProject || !sentryToken) {
        throw new Error("Sentry API configuration incomplete. Check SENTRY_ORG, SENTRY_PROJECT, and SENTRY_AUTH_TOKEN.");
    }

    const url = `${SENTRY_API_BASE}/projects/${sentryOrg}/${sentryProject}/issues/${query}`;

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${sentryToken}`,
            "Content-Type": "application/json",
        },
        next: {
            revalidate: 300, // Cache for 5 minutes
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Sentry API error (${response.status}): ${errorText}`);
    }

    const data: SentryIssue[] = await response.json();
    return data;
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Fetch Sentry error metrics by severity/priority
 *
 * Returns counts for P0 (critical), P1 (high), P2 (medium) priority errors.
 * Only includes unresolved issues from the last 30 days.
 *
 * @returns Error metrics by priority level
 *
 * @example
 * const result = await fetchSentryErrorMetrics();
 * if (result.success) {
 *   console.log(`P0 errors: ${result.data.p0Critical}`);
 * }
 */
export async function fetchSentryErrorMetrics(): Promise<DALResult<SentryErrorMetrics>> {
    try {
        // Check if Sentry is configured
        if (!env.SENTRY_ORG || !env.SENTRY_PROJECT || !env.SENTRY_AUTH_TOKEN) {
            // Return zero metrics if Sentry not configured (graceful degradation)
            const emptyMetrics: SentryErrorMetrics = {
                p0Critical: 0,
                p1High: 0,
                p2Medium: 0,
                totalErrors: 0,
                lastFetched: new Date(),
            };
            return dalSuccess(emptyMetrics);
        }

        // Fetch unresolved issues from last 14 days (Sentry API limit: '', '24h', '14d')
        const issues = await fetchSentryIssues("?query=is:unresolved&statsPeriod=14d");

        // Aggregate by priority
        let p0Critical = 0;
        let p1High = 0;
        let p2Medium = 0;

        for (const issue of issues) {
            // Sentry priority can be in issue.priority or derived from level
            const priority = issue.priority?.toUpperCase() || getPriorityFromLevel(issue.level);

            switch (priority) {
                case "P0":
                case "HIGH":
                    p0Critical++;
                    break;
                case "P1":
                case "MEDIUM":
                    p1High++;
                    break;
                case "P2":
                case "LOW":
                    p2Medium++;
                    break;
                default:
                    // Count unknown priorities as P2
                    p2Medium++;
            }
        }

        const metrics = SentryErrorMetricsSchema.parse({
            p0Critical,
            p1High,
            p2Medium,
            totalErrors: issues.length,
            lastFetched: new Date(),
        });

        return dalSuccess(metrics);
    } catch (err) {
        // Return error but don't fail the entire dashboard
        return dalError(`Sentry API error: ${getErrorMessage(err)}`);
    }
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Map Sentry issue level to priority
 *
 * @param level - Sentry issue level (error, warning, info, etc.)
 * @returns Priority label (P0/P1/P2)
 */
function getPriorityFromLevel(level: string): string {
    const levelLower = level.toLowerCase();

    if (levelLower === "fatal" || levelLower === "error") {
        return "P0"; // Critical
    }

    if (levelLower === "warning") {
        return "P1"; // High
    }

    return "P2"; // Medium (info, debug, etc.)
}
