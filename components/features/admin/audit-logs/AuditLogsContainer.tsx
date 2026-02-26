import { fetchAuditLogs, fetchAuditTableNames, fetchDistinctAuditUsers } from "@/lib/dal/audit-logs";
import { AuditLogsView } from "./AuditLogsView";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { parseAuditLogFilters } from "@/lib/utils/audit-log-filters";

interface AuditLogsContainerProps {
    searchParams: Record<string, string | string[] | undefined>;
}

export async function AuditLogsContainer({ searchParams }: AuditLogsContainerProps) {
    const filters = parseAuditLogFilters(searchParams);

    const [logsResult, tablesResult, usersResult] = await Promise.all([
        fetchAuditLogs(filters),
        fetchAuditTableNames(),
        fetchDistinctAuditUsers(),
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
    const users = usersResult.success ? usersResult.data : [];

    return (
        <AuditLogsView
            initialLogs={logsResult.data.logs}
            initialTotalCount={logsResult.data.totalCount}
            initialFilters={filters}
            tableNames={tableNames}
            users={users}
        />
    );
}
