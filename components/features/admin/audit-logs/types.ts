import type { AuditLogDTO, AuditLogFilter } from "@/lib/schemas/audit-logs";
import type { AuditLogSortField, AuditLogSortState } from "./AuditLogsTable";
import type { AuditUserOption } from "@/lib/dal/audit-logs";

export interface AuditLogsViewProps {
    initialLogs: AuditLogDTO[];
    initialTotalCount: number;
    initialFilters: AuditLogFilter;
    tableNames: string[];
    users: AuditUserOption[];
}

export interface AuditLogFiltersProps {
    filters: AuditLogFilter;
    tableNames: string[];
    users: AuditUserOption[];
    onFilterChange: (filters: AuditLogFilter) => void;
    isLoading?: boolean;
}

export interface AuditLogsTableProps {
    logs: AuditLogDTO[];
    totalCount: number;
    filters: AuditLogFilter;
    onFilterChange: (filters: AuditLogFilter) => void;
    onRowClick: (log: AuditLogDTO) => void;
    sortState: AuditLogSortState | null;
    onSort: (field: AuditLogSortField) => void;
}

export interface AuditLogDetailModalProps {
    log: AuditLogDTO;
    open: boolean;
    onClose: () => void;
}
