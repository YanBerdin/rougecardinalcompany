import type { AuditLogDTO, AuditLogFilter } from "@/lib/schemas/audit-logs";

export interface AuditLogsViewProps {
    initialLogs: AuditLogDTO[];
    initialTotalCount: number;
    initialFilters: AuditLogFilter;
    tableNames: string[];
}

export interface AuditLogFiltersProps {
    filters: AuditLogFilter;
    tableNames: string[];
    onFilterChange: (filters: AuditLogFilter) => void;
    isLoading?: boolean;
}

export interface AuditLogsTableProps {
    logs: AuditLogDTO[];
    totalCount: number;
    filters: AuditLogFilter;
    onFilterChange: (filters: AuditLogFilter) => void;
    onRowClick: (log: AuditLogDTO) => void;
}

export interface AuditLogDetailModalProps {
    log: AuditLogDTO;
    open: boolean;
    onClose: () => void;
}
