import { fetchAuditLogs, fetchAuditTableNames } from "@/lib/dal/audit-logs";
import { AuditLogsView } from "./AuditLogsView";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { AuditLogFilter } from "@/lib/schemas/audit-logs";

interface AuditLogsContainerProps {
    searchParams: Record<string, string | string[] | undefined>;
}

export async function AuditLogsContainer({ searchParams }: AuditLogsContainerProps) {
    // Parse searchParams to AuditLogFilter
    const actionParam = searchParams.action as string | undefined;
    const validatedAction = actionParam === "INSERT" || actionParam === "UPDATE" || actionParam === "DELETE" 
        ? actionParam 
        : undefined;

    const dateFromParam = searchParams.date_from as string | undefined;
    const dateToParam = searchParams.date_to as string | undefined;

    const filters: AuditLogFilter = {
        page: searchParams.page ? parseInt(searchParams.page as string) : 1,
        limit: searchParams.limit ? parseInt(searchParams.limit as string) : 50,
        action: validatedAction,
        table_name: searchParams.table_name as string | undefined,
        user_id: searchParams.user_id as string | undefined,
        date_from: dateFromParam ? new Date(dateFromParam) : undefined,
        date_to: dateToParam ? new Date(dateToParam) : undefined,
        search: searchParams.search as string | undefined,
    };

    const [logsResult, tablesResult] = await Promise.all([
        fetchAuditLogs(filters),
        fetchAuditTableNames(),
    ]);

    if (!logsResult.success) {
        return (
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erreur</AlertTitle>
                <AlertDescription>{logsResult.error}</AlertDescription>
            </Alert>
        );
    }

    const tableNames = tablesResult.success ? tablesResult.data : [];

    return (
        <AuditLogsView
            initialLogs={logsResult.data.logs}
            initialTotalCount={logsResult.data.totalCount}
            initialFilters={filters}
            tableNames={tableNames}
        />
    );
}
