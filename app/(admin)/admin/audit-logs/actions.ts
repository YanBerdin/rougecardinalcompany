"use server";
import "server-only";

import { fetchAuditLogs } from "@/lib/dal/audit-logs";
import { AuditLogFilterSchema, type AuditLogFilter, type AuditLogDTO } from "@/lib/schemas/audit-logs";
import { stringify } from "csv-stringify/sync";

const MAX_EXPORT_ROWS = 10000;
const PAGE_SIZE = 100; // Maximum allowed by AuditLogFilterSchema

export type ExportResult =
    | { success: true; data: string }
    | { success: false; error: string };

/**
 * Export audit logs as CSV with current filters applied
 * Handles pagination automatically to export up to MAX_EXPORT_ROWS
 */
export async function exportAuditLogsCSV(
    filters: AuditLogFilter
): Promise<ExportResult> {
    try {
        const validatedFilters = AuditLogFilterSchema.parse({
            ...filters,
            page: 1,
            limit: PAGE_SIZE,
        });

        // Fetch first page to get total count
        const firstResult = await fetchAuditLogs(validatedFilters);

        if (!firstResult.success) {
            return { success: false, error: firstResult.error };
        }

        const allLogs: AuditLogDTO[] = [...firstResult.data.logs];
        const totalCount = firstResult.data.totalCount;
        const maxPages = Math.min(
            Math.ceil(totalCount / PAGE_SIZE),
            Math.ceil(MAX_EXPORT_ROWS / PAGE_SIZE)
        );

        // Fetch remaining pages if needed
        for (let page = 2; page <= maxPages; page++) {
            const result = await fetchAuditLogs({
                ...validatedFilters,
                page,
            });

            if (!result.success) {
                return { success: false, error: result.error };
            }

            allLogs.push(...result.data.logs);

            // Stop if we reached MAX_EXPORT_ROWS
            if (allLogs.length >= MAX_EXPORT_ROWS) {
                break;
            }
        }

        // Limit to MAX_EXPORT_ROWS
        const logsToExport = allLogs.slice(0, MAX_EXPORT_ROWS);

        const csv = stringify(logsToExport, {
            header: true,
            columns: [
                { key: "id", header: "ID" },
                { key: "created_at", header: "Date" },
                { key: "user_email", header: "Utilisateur" },
                { key: "action", header: "Action" },
                { key: "table_name", header: "Table" },
                { key: "record_id", header: "Record ID" },
                { key: "ip_address", header: "Adresse IP" },
            ],
        });

        return { success: true, data: csv };
    } catch (error) {
        return {
            success: false,
            error: `Export failed: ${error instanceof Error ? error.message : "Unknown"}`,
        };
    }
}
