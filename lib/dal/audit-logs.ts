"use server";
import "server-only";

import { createClient } from "@/supabase/server";
import {
    AuditLogDTOSchema,
    AuditLogFilterSchema,
    type AuditLogDTO,
    type AuditLogFilter
} from "@/lib/schemas/audit-logs";
import { type DALResult } from "@/lib/dal/helpers/error";
import { z } from "zod";

const AUDIT_ERROR_CODES = {
    FETCH_FAILED: "ERR_AUDIT_001",
    INVALID_FILTERS: "ERR_AUDIT_002",
    UNEXPECTED: "ERR_AUDIT_003",
    TABLE_NAMES_FAILED: "ERR_AUDIT_004",
    USERS_FAILED: "ERR_AUDIT_005",
} as const;

export interface AuditUserOption {
    user_id: string;
    user_email: string;
}

/**
 * Fetch audit logs with user email resolution and advanced filtering
 */
export async function fetchAuditLogs(
    filters: AuditLogFilter
): Promise<DALResult<{ logs: AuditLogDTO[]; totalCount: number }>> {
    try {
        const supabase = await createClient();
        const validatedFilters = AuditLogFilterSchema.parse(filters);

        const { data, error } = await supabase.rpc("get_audit_logs_with_email", {
            p_action: validatedFilters.action ?? null,
            p_table_name: validatedFilters.table_name ?? null,
            p_user_id: validatedFilters.user_id ?? null,
            p_date_from: validatedFilters.date_from?.toISOString() ?? null,
            p_date_to: validatedFilters.date_to?.toISOString() ?? null,
            p_search: validatedFilters.search ?? null,
            p_page: validatedFilters.page,
            p_limit: validatedFilters.limit,
        });

        if (error) {
            return {
                success: false,
                error: `[${AUDIT_ERROR_CODES.FETCH_FAILED}] ${error.message}`,
            };
        }

        if (!data || data.length === 0) {
            return { success: true, data: { logs: [], totalCount: 0 } };
        }

        const logs = z.array(AuditLogDTOSchema).parse(data);
        const totalCount = Number(data[0]?.total_count ?? 0);

        return { success: true, data: { logs, totalCount } };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: `[${AUDIT_ERROR_CODES.INVALID_FILTERS}] ${error.message}`,
            };
        }
        return {
            success: false,
            error: `[${AUDIT_ERROR_CODES.UNEXPECTED}] ${error instanceof Error ? error.message : "Unknown"}`,
        };
    }
}

/**
 * Get distinct table names from audit logs (for filter dropdown)
 */
export async function fetchAuditTableNames(): Promise<DALResult<string[]>> {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("logs_audit")
            .select("table_name")
            .order("table_name");

        if (error) {
            return {
                success: false,
                error: `[${AUDIT_ERROR_CODES.TABLE_NAMES_FAILED}] ${error.message}`,
            };
        }

        const uniqueTables = [...new Set(data?.map((row) => row.table_name) ?? [])];
        return { success: true, data: uniqueTables };
    } catch (error) {
        return {
            success: false,
            error: `[${AUDIT_ERROR_CODES.UNEXPECTED}] ${error instanceof Error ? error.message : "Unknown"}`,
        };
    }
}

/**
 * Get distinct users from audit logs (for filter dropdown)
 * Returns users with both user_id and resolved email from auth.users
 */
export async function fetchDistinctAuditUsers(): Promise<DALResult<AuditUserOption[]>> {
    try {
        const supabase = await createClient();

        // Get distinct user_ids from audit logs, then join with auth.users
        const { data, error } = await supabase
            .from("logs_audit")
            .select("user_id")
            .not("user_id", "is", null);

        if (error) {
            return {
                success: false,
                error: `[${AUDIT_ERROR_CODES.USERS_FAILED}] ${error.message}`,
            };
        }

        // Get unique user IDs
        const uniqueUserIds = [...new Set(data?.map((row) => row.user_id).filter(Boolean) ?? [])];

        if (uniqueUserIds.length === 0) {
            return { success: true, data: [] };
        }

        // Fetch user emails from auth.users
        const { data: users, error: usersError } = await supabase.auth.admin.listUsers();

        if (usersError) {
            return {
                success: false,
                error: `[${AUDIT_ERROR_CODES.USERS_FAILED}] ${usersError.message}`,
            };
        }

        // Map user_id to email
        const userOptions: AuditUserOption[] = uniqueUserIds
            .map((userId) => {
                const user = users.users.find((u) => u.id === userId);
                return {
                    user_id: userId,
                    user_email: user?.email ?? "Utilisateur inconnu",
                };
            })
            .sort((a, b) => a.user_email.localeCompare(b.user_email));

        return { success: true, data: userOptions };
    } catch (error) {
        return {
            success: false,
            error: `[${AUDIT_ERROR_CODES.UNEXPECTED}] ${error instanceof Error ? error.message : "Unknown"}`,
        };
    }
}
